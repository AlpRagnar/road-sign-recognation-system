"""
FastAPI wrapper that adapts the local two-stage Triton traffic-sign pipeline to the
Traffic Sign Mapping web app's AI contract.

Runtime: Mobile browser -> Next.js app -> /api/detection/frame -> Supabase signed URL
         -> POST {this wrapper}/detect -> Triton (e2e detection + sign-mid classify)
         -> normalized JSON -> Next.js saves detection_events / traffic_signs.

This service is stateless: it downloads the image, runs inference, returns JSON.
It NEVER persists images, draws boxes, or logs signed URLs / bearer tokens.

Heavy inference dependencies (numpy, opencv, tritonclient, torch/ultralytics) are
imported lazily so the module can be byte-compiled and the server can start even when
they are not installed — in that case the inference endpoints report a clean error.
"""
from __future__ import annotations

import hmac
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("ai_wrapper")

from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# --------------------------------------------------------------------------- #
# Configuration (all via environment; never logged)
# --------------------------------------------------------------------------- #
TRITON_URL = os.environ.get("TRITON_URL", "localhost:8000")
AI_WRAPPER_API_KEY = os.environ.get("AI_WRAPPER_API_KEY", "")
MODEL_VERSION = os.environ.get("MODEL_VERSION", "triton-e2e-sign-mid-v1")

DETECTION_MODEL_NAME = os.environ.get("DETECTION_MODEL_NAME", "e2e")
CLASSIFICATION_MODEL_NAME = os.environ.get("CLASSIFICATION_MODEL_NAME", "sign-mid")

DET_CONF_THRESHOLD = float(os.environ.get("DETECTION_CONF_THRESHOLD", "0.25"))
DET_IOU_THRESHOLD = float(os.environ.get("DETECTION_IOU_THRESHOLD", "0.45"))

# Tensor names. Stage 1 names are fixed by the known model; stage 2 names are
# auto-detected from Triton metadata when left empty.
DET_INPUT_NAME = os.environ.get("DET_INPUT_NAME", "images")
DET_OUTPUT_NAME = os.environ.get("DET_OUTPUT_NAME", "output0")
CLS_INPUT_NAME = os.environ.get("CLS_INPUT_NAME", "")
CLS_OUTPUT_NAME = os.environ.get("CLS_OUTPUT_NAME", "")

DET_IMGSZ = int(os.environ.get("DET_IMGSZ", "1280"))
CLS_IMGSZ = int(os.environ.get("CLS_IMGSZ", "128"))

IMAGE_DOWNLOAD_TIMEOUT_S = float(os.environ.get("IMAGE_DOWNLOAD_TIMEOUT_S", "10"))
MAX_DETECTIONS = int(os.environ.get("MAX_DETECTIONS", "50"))

# Optional class mapping: {"0": "Speed Limit 20", ...}
CLASSES_PATH = Path(__file__).with_name("classes.json")


def _load_classes() -> Dict[str, str]:
    """Load the friendly class map at startup.

    Missing or malformed mappings must never prevent the wrapper from booting or
    break inference — inference falls back to `Sign {id}`. Problems are surfaced
    as a safe warning that never leaks the absolute path or any secret.
    """
    if not CLASSES_PATH.exists():
        logger.warning(
            "class map (%s) not found; falling back to 'Sign {id}' names",
            CLASSES_PATH.name,
        )
        return {}
    try:
        with open(CLASSES_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        logger.warning(
            "class map (%s) could not be parsed; falling back to 'Sign {id}' names",
            CLASSES_PATH.name,
        )
        return {}
    if not isinstance(data, dict) or not data:
        logger.warning(
            "class map (%s) is empty or malformed; falling back to 'Sign {id}' names",
            CLASSES_PATH.name,
        )
        return {}
    mapping = {str(k): str(v) for k, v in data.items()}
    logger.info("Loaded %d traffic-sign class names from %s", len(mapping), CLASSES_PATH.name)
    return mapping


CLASS_MAP: Dict[str, str] = _load_classes()


def class_name_for(class_id: int) -> str:
    return CLASS_MAP.get(str(class_id), f"Sign {class_id}")


# --------------------------------------------------------------------------- #
# Errors (never leak stack traces to clients)
# --------------------------------------------------------------------------- #
class WrapperError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)


# --------------------------------------------------------------------------- #
# Request model — mirrors the app's AiRequest. Lenient: extra fields allowed,
# everything except image_url is optional.
# --------------------------------------------------------------------------- #
class DetectLocation(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None

    class Config:
        extra = "allow"


class DetectRequest(BaseModel):
    image_url: Optional[str] = None
    image_id: Optional[str] = None
    session_id: Optional[str] = None
    device_id: Optional[str] = None
    timestamp: Optional[str] = None
    location: Optional[DetectLocation] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"


# --------------------------------------------------------------------------- #
# Lazy inference dependencies + Triton client (cached)
# --------------------------------------------------------------------------- #
_deps: Dict[str, Any] = {}
_triton: Dict[str, Any] = {}


def _infer_deps():
    """Imports numpy + opencv. Raises WrapperError(500) with a clean message if missing."""
    if "np" not in _deps:
        try:
            import numpy as np  # type: ignore
            import cv2  # type: ignore
        except Exception as exc:  # pragma: no cover - depends on local install
            raise WrapperError(
                500,
                "Inference dependencies missing (numpy/opencv). "
                "Install requirements.txt.",
            ) from exc
        _deps["np"] = np
        _deps["cv2"] = cv2
    return _deps["np"], _deps["cv2"]


def _triton_client():
    """Returns a cached Triton HTTP client. Raises WrapperError(503) if unavailable."""
    if "client" not in _triton:
        try:
            import tritonclient.http as httpclient  # type: ignore
        except Exception as exc:  # pragma: no cover
            raise WrapperError(
                503, "tritonclient is not installed on the AI server."
            ) from exc
        try:
            _triton["client"] = httpclient.InferenceServerClient(url=TRITON_URL)
            _triton["http"] = httpclient
        except Exception as exc:  # pragma: no cover
            raise WrapperError(503, "Could not create Triton client.") from exc
    return _triton["client"], _triton["http"]


def _nms_and_scale(pred, original_shape, ratio_pad):
    """
    Apply non-max-suppression and scale boxes back to the original image.
    Prefers ultralytics' own ops (exact parity with the local test pipeline);
    falls back to a self-contained numpy implementation otherwise.
    Returns a list of (x1, y1, x2, y2, conf, cls) in ORIGINAL image coordinates.
    """
    np, _ = _infer_deps()

    # --- Preferred path: ultralytics ops (matches local non_max_suppression/scale_boxes) ---
    try:
        import torch  # type: ignore
        # `non_max_suppression` lives in ultralytics.utils.ops (<=8.3) or
        # ultralytics.utils.nms (>=8.4); `scale_boxes` stays in ops.
        try:
            from ultralytics.utils.ops import non_max_suppression  # type: ignore
        except ImportError:
            from ultralytics.utils.nms import non_max_suppression  # type: ignore
        from ultralytics.utils.ops import scale_boxes  # type: ignore

        t = torch.from_numpy(np.ascontiguousarray(pred))
        dets = non_max_suppression(
            t, conf_thres=DET_CONF_THRESHOLD, iou_thres=DET_IOU_THRESHOLD
        )[0]
        if dets is None or len(dets) == 0:
            return []
        boxes = dets[:, :4].clone()
        boxes = scale_boxes((DET_IMGSZ, DET_IMGSZ), boxes, original_shape)
        out = []
        for i in range(len(dets)):
            x1, y1, x2, y2 = [float(v) for v in boxes[i].tolist()]
            conf = float(dets[i, 4].item())
            cls = int(dets[i, 5].item())
            out.append((x1, y1, x2, y2, conf, cls))
        return out
    except ImportError:
        pass  # ultralytics/torch not installed -> numpy fallback below

    # --- Fallback: numpy NMS (YOLO head). Assumes [1, C, N] or [1, N, C]. ---
    p = np.squeeze(np.asarray(pred), axis=0) if pred.ndim == 3 else np.asarray(pred)
    if p.shape[0] < p.shape[1]:
        p = p.T  # -> [N, C]
    nc = p.shape[1] - 4
    boxes_xywh = p[:, :4]
    scores_all = p[:, 4:]
    cls_ids = scores_all.argmax(axis=1)
    cls_conf = scores_all.max(axis=1)
    keep_mask = cls_conf >= DET_CONF_THRESHOLD
    boxes_xywh, cls_ids, cls_conf = (
        boxes_xywh[keep_mask], cls_ids[keep_mask], cls_conf[keep_mask],
    )
    if boxes_xywh.shape[0] == 0:
        return []
    # xywh (center) -> xyxy in letterboxed space
    xy = boxes_xywh[:, :2]
    wh = boxes_xywh[:, 2:4]
    xyxy = np.concatenate([xy - wh / 2, xy + wh / 2], axis=1)
    keep = _nms_numpy(xyxy, cls_conf, DET_IOU_THRESHOLD)
    gain = min(DET_IMGSZ / original_shape[0], DET_IMGSZ / original_shape[1])
    pad_w = (DET_IMGSZ - original_shape[1] * gain) / 2
    pad_h = (DET_IMGSZ - original_shape[0] * gain) / 2
    out = []
    for i in keep:
        x1, y1, x2, y2 = xyxy[i]
        x1 = (x1 - pad_w) / gain
        x2 = (x2 - pad_w) / gain
        y1 = (y1 - pad_h) / gain
        y2 = (y2 - pad_h) / gain
        out.append((float(x1), float(y1), float(x2), float(y2),
                    float(cls_conf[i]), int(cls_ids[i])))
    return out


def _nms_numpy(boxes, scores, iou_thres):
    np, _ = _infer_deps()
    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1).clip(0) * (y2 - y1).clip(0)
    order = scores.argsort()[::-1]
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(int(i))
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-9)
        order = order[1:][ovr <= iou_thres]
    return keep


def _letterbox(img, new_size):
    """Resize with unchanged aspect ratio using padding (BGR in, BGR out)."""
    np, cv2 = _infer_deps()
    h, w = img.shape[:2]
    gain = min(new_size / h, new_size / w)
    nh, nw = int(round(h * gain)), int(round(w * gain))
    resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)
    canvas = np.full((new_size, new_size, 3), 114, dtype=np.uint8)
    top = (new_size - nh) // 2
    left = (new_size - nw) // 2
    canvas[top:top + nh, left:left + nw] = resized
    return canvas


def _preprocess(img_bgr, size):
    """BGR -> RGB, letterbox to size, /255, CHW, batch, FP32."""
    np, cv2 = _infer_deps()
    lb = _letterbox(img_bgr, size)
    rgb = cv2.cvtColor(lb, cv2.COLOR_BGR2RGB)
    arr = rgb.astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))  # CHW
    arr = np.expand_dims(arr, axis=0)  # NCHW
    return np.ascontiguousarray(arr)


def _preprocess_crop_simple(crop_bgr, size):
    """Stage-2 preprocess: BGR -> RGB, plain resize to size, /255, CHW, batch, FP32."""
    np, cv2 = _infer_deps()
    rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    rsz = cv2.resize(rgb, (size, size), interpolation=cv2.INTER_LINEAR)
    arr = rsz.astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))
    arr = np.expand_dims(arr, axis=0)
    return np.ascontiguousarray(arr)


def _cls_io_names(client):
    """Resolve stage-2 input/output tensor names from env or Triton metadata."""
    in_name, out_name = CLS_INPUT_NAME, CLS_OUTPUT_NAME
    if in_name and out_name:
        return in_name, out_name
    try:
        meta = client.get_model_metadata(CLASSIFICATION_MODEL_NAME)
        if not in_name:
            in_name = meta["inputs"][0]["name"]
        if not out_name:
            out_name = meta["outputs"][0]["name"]
    except Exception as exc:
        raise WrapperError(
            503,
            "Could not read sign-mid model metadata from Triton "
            "(set CLS_INPUT_NAME / CLS_OUTPUT_NAME to override).",
        ) from exc
    return in_name, out_name


def _classify(client, http, crop_bgr):
    """Run stage-2 classification; returns (top1_idx, top1_conf)."""
    np, _ = _infer_deps()
    in_name, out_name = _cls_io_names(client)
    data = _preprocess_crop_simple(crop_bgr, CLS_IMGSZ)
    inp = http.InferInput(in_name, list(data.shape), "FP32")
    inp.set_data_from_numpy(data)
    out = http.InferRequestedOutput(out_name)
    res = client.infer(model_name=CLASSIFICATION_MODEL_NAME, inputs=[inp], outputs=[out])
    probs = np.squeeze(res.as_numpy(out_name))
    top1 = int(np.argmax(probs))
    conf = float(probs[top1])
    return top1, conf


def _detect_stage1(client, http, img_bgr):
    """Run stage-1 detection; returns scaled boxes list (x1,y1,x2,y2,conf,cls)."""
    np, _ = _infer_deps()
    data = _preprocess(img_bgr, DET_IMGSZ)
    inp = http.InferInput(DET_INPUT_NAME, list(data.shape), "FP32")
    inp.set_data_from_numpy(data)
    out = http.InferRequestedOutput(DET_OUTPUT_NAME)
    res = client.infer(model_name=DETECTION_MODEL_NAME, inputs=[inp], outputs=[out])
    pred = res.as_numpy(DET_OUTPUT_NAME)
    return _nms_and_scale(pred, img_bgr.shape[:2], None)


def _download_image(url: str):
    """Download + decode image to BGR. Raises WrapperError(400) on failure.
    Never logs the URL (it may be a signed Supabase URL)."""
    np, cv2 = _infer_deps()
    try:
        import requests  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise WrapperError(500, "The `requests` package is not installed.") from exc
    try:
        resp = requests.get(url, timeout=IMAGE_DOWNLOAD_TIMEOUT_S)
    except Exception as exc:
        raise WrapperError(400, "Could not download image_url.") from exc
    if resp.status_code != 200 or not resp.content:
        raise WrapperError(400, f"Image download failed (status {resp.status_code}).")
    buf = np.frombuffer(resp.content, dtype=np.uint8)
    img = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if img is None:
        raise WrapperError(400, "Image could not be decoded.")
    return img


def run_pipeline(image_url: str) -> Dict[str, Any]:
    """Full two-stage pipeline. Returns the normalized contract dict."""
    np, _ = _infer_deps()
    start = time.time()
    img = _download_image(image_url)
    client, http = _triton_client()

    boxes = _detect_stage1(client, http, img)
    h, w = img.shape[:2]
    detections: List[Dict[str, Any]] = []

    for (x1, y1, x2, y2, det_conf, _det_cls) in boxes[:MAX_DETECTIONS]:
        # Clamp to image bounds and skip degenerate boxes (app rejects non-positive).
        xi1 = max(0, min(int(round(x1)), w - 1))
        yi1 = max(0, min(int(round(y1)), h - 1))
        xi2 = max(0, min(int(round(x2)), w))
        yi2 = max(0, min(int(round(y2)), h))
        bw, bh = xi2 - xi1, yi2 - yi1
        if bw <= 0 or bh <= 0:
            continue
        crop = img[yi1:yi2, xi1:xi2]
        if crop.size == 0:
            continue

        top1_idx, top1_conf = _classify(client, http, crop)
        confidence = float(det_conf) * float(top1_conf)
        confidence = max(0.0, min(1.0, confidence))  # contract requires 0..1

        detections.append({
            "class_id": int(top1_idx),
            "class_name": class_name_for(int(top1_idx)),
            "confidence": round(confidence, 4),
            "bbox": {"x": xi1, "y": yi1, "width": bw, "height": bh},
        })

    return {
        "detections": detections,
        "processing_time_ms": int((time.time() - start) * 1000),
        "model_version": MODEL_VERSION,
    }


# --------------------------------------------------------------------------- #
# Auth
# --------------------------------------------------------------------------- #
def _check_auth(authorization: Optional[str]) -> None:
    """If AI_WRAPPER_API_KEY is set, require a matching Bearer token."""
    if not AI_WRAPPER_API_KEY:
        return  # unauthenticated local testing allowed
    token = ""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    if not token or not hmac.compare_digest(token, AI_WRAPPER_API_KEY):
        raise WrapperError(401, "Missing or invalid API key.")


# --------------------------------------------------------------------------- #
# FastAPI app
# --------------------------------------------------------------------------- #
app = FastAPI(title="Traffic Sign AI Wrapper", version=MODEL_VERSION)


@app.exception_handler(WrapperError)
async def _wrapper_error_handler(_request: Request, exc: WrapperError):
    return JSONResponse(status_code=exc.status, content={"ok": False, "error": exc.message})


@app.get("/health")
async def health():
    """Liveness of the wrapper + Triton + (best-effort) model readiness."""
    triton_live = False
    models = {"e2e": False, "sign_mid": False}
    try:
        client, _ = _triton_client()
        try:
            triton_live = bool(client.is_server_live())
        except Exception:
            triton_live = False
        if triton_live:
            try:
                models["e2e"] = bool(client.is_model_ready(DETECTION_MODEL_NAME))
            except Exception:
                models["e2e"] = False
            try:
                models["sign_mid"] = bool(client.is_model_ready(CLASSIFICATION_MODEL_NAME))
            except Exception:
                models["sign_mid"] = False
    except WrapperError:
        triton_live = False

    body = {
        "ok": triton_live,
        "triton_live": triton_live,
        "models": models,
        "model_version": MODEL_VERSION,
    }
    if not triton_live:
        return JSONResponse(status_code=503, content=body)
    return body


@app.post("/detect")
async def detect(req: DetectRequest, authorization: Optional[str] = Header(default=None)):
    _check_auth(authorization)
    if not req.image_url or not isinstance(req.image_url, str):
        raise WrapperError(400, "`image_url` is required.")
    try:
        return run_pipeline(req.image_url)
    except WrapperError:
        raise
    except Exception:
        # Never leak stack traces / internal details to the client.
        raise WrapperError(500, "Unexpected inference error.")
