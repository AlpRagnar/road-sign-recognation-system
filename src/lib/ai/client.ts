import { env } from "@/lib/env";
import type { SystemLogAction } from "@/lib/types/database";
import {
  type AiErrorCategory,
  type AiMode,
  type AiRequest,
  type NormalizedAiResponse,
  modelHostname,
  normalizeAiResponse,
  resolveAiMode,
} from "@/lib/ai/contract";

// A log event the caller (Route Handler) should persist to system_logs.
// Kept context-free; the caller adds userId/deviceId.
export interface AiLogEvent {
  action: SystemLogAction;
  message?: string;
  metadata?: Record<string, unknown>;
}

export type AiOutcome =
  | {
      ok: true;
      mode: AiMode;
      usedMock: boolean;
      response: NormalizedAiResponse;
      attempts: number;
      elapsedMs: number;
      logs: AiLogEvent[];
    }
  | {
      ok: false;
      mode: AiMode;
      category: AiErrorCategory;
      status?: number;
      message: string;
      attempts: number;
      elapsedMs: number;
      logs: AiLogEvent[];
    };

// ---- Mock detector (never removed; used by mode=mock or auto-without-URL) ----
const MOCK_CLASSES: Array<{ id: number; name: string }> = [
  { id: 14, name: "Speed Limit 50" },
  { id: 13, name: "Yield" },
  { id: 1, name: "Stop" },
  { id: 17, name: "No Entry" },
  { id: 38, name: "Keep Right" },
];

function mockDetect(): NormalizedAiResponse {
  const count = Math.random() < 0.25 ? 0 : Math.random() < 0.7 ? 1 : 2;
  const detections = [];
  for (let i = 0; i < count; i++) {
    const cls = MOCK_CLASSES[Math.floor(Math.random() * MOCK_CLASSES.length)]!;
    detections.push({
      class_id: cls.id,
      class_name: cls.name,
      confidence: Number((0.6 + Math.random() * 0.4).toFixed(3)),
      bbox: {
        x: Math.floor(Math.random() * 400),
        y: Math.floor(Math.random() * 300),
        width: 48 + Math.floor(Math.random() * 64),
        height: 48 + Math.floor(Math.random() * 64),
      },
    });
  }
  return {
    detections,
    processing_time_ms: 40 + Math.floor(Math.random() * 160),
    model_version: "mock-1",
    raw: { mock: true },
  };
}

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

interface AttemptResult {
  kind: "ok" | "retryable" | "fatal";
  category?: AiErrorCategory;
  status?: number;
  message?: string;
  json?: unknown;
}

async function attemptFetch(request: AiRequest, timeoutMs: number): Promise<AttemptResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const key = env.aiModelApiKey();
  if (key) headers["Authorization"] = `Bearer ${key}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(env.aiModelApiUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!res.ok) {
      const retryable = RETRYABLE_STATUS.has(res.status);
      return {
        kind: retryable ? "retryable" : "fatal",
        category: "http",
        status: res.status,
        message: `Model server returned HTTP ${res.status}.`,
      };
    }

    const json = await res.json().catch(() => null);
    return { kind: "ok", json };
  } catch (err) {
    const isAbort = (err as Error)?.name === "AbortError";
    return {
      kind: "retryable",
      category: isAbort ? "timeout" : "network",
      message: isAbort
        ? `AI request timed out after ${timeoutMs} ms.`
        : `Network error contacting model server: ${sanitize((err as Error)?.message)}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

// Strip anything token-like from a message before logging/returning.
function sanitize(msg: string | undefined): string {
  if (!msg) return "unknown error";
  return msg.replace(/(bearer\s+)[\w.\-]+/gi, "$1***").slice(0, 300);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs traffic-sign detection honoring AI_MODEL_MODE (mock | external | auto),
 * with timeout + retry on transient failures and response normalization.
 * Returns a discriminated outcome plus system_logs events for the caller.
 */
export async function runDetection(request: AiRequest): Promise<AiOutcome> {
  const mode = resolveAiMode();
  const url = env.aiModelApiUrl();
  const start = Date.now();
  const logs: AiLogEvent[] = [];

  const useMock = mode === "mock" || (mode === "auto" && url.length === 0);

  if (useMock) {
    const response = mockDetect();
    logs.push({
      action: "AI_MOCK_USED",
      message: `Mock detector produced ${response.detections.length} detection(s)`,
      metadata: { mode },
    });
    return {
      ok: true,
      mode,
      usedMock: true,
      response,
      attempts: 0,
      elapsedMs: Date.now() - start,
      logs,
    };
  }

  // external, or auto-with-URL
  if (url.length === 0) {
    const message = "AI_MODEL_MODE=external but AI_MODEL_API_URL is not configured.";
    logs.push({ action: "AI_REQUEST_FAILED", message, metadata: { category: "config", mode } });
    return {
      ok: false,
      mode,
      category: "config",
      message,
      attempts: 0,
      elapsedMs: Date.now() - start,
      logs,
    };
  }

  const host = modelHostname(url);
  const timeoutMs = env.aiModelTimeoutMs();
  const maxRetries = env.aiModelMaxRetries();
  const backoff = env.aiModelRetryBackoffMs();

  logs.push({
    action: "AI_REQUEST_STARTED",
    message: `Calling model server${host ? ` (${host})` : ""}`,
    metadata: { mode, host, timeoutMs, maxRetries },
  });

  let last: AttemptResult | null = null;
  let attempts = 0;

  for (let i = 0; i <= maxRetries; i++) {
    attempts = i + 1;
    last = await attemptFetch(request, timeoutMs);
    if (last.kind === "ok") break;
    if (last.kind === "fatal") break;
    // retryable: backoff before next attempt (if any remain)
    if (i < maxRetries && backoff > 0) await sleep(backoff * (i + 1));
  }

  const elapsedMs = Date.now() - start;

  if (!last || last.kind !== "ok") {
    const category = last?.category ?? "network";
    const status = last?.status;
    const message = sanitize(last?.message);
    const action: SystemLogAction =
      category === "timeout" ? "AI_REQUEST_TIMEOUT" : "AI_REQUEST_FAILED";
    logs.push({
      action,
      message,
      metadata: { category, status, attempts, elapsedMs, host },
    });
    return { ok: false, mode, category, status, message, attempts, elapsedMs, logs };
  }

  // Validate + normalize the 2xx response.
  const normalized = normalizeAiResponse(last.json);
  if (!normalized.ok) {
    const message = `Invalid AI response: ${normalized.message}`;
    logs.push({
      action: "AI_RESPONSE_INVALID",
      message,
      metadata: { attempts, elapsedMs, host },
    });
    return {
      ok: false,
      mode,
      category: "invalid_response",
      message,
      attempts,
      elapsedMs,
      logs,
    };
  }

  logs.push({
    action: "AI_REQUEST_SUCCEEDED",
    message: `${normalized.value.detections.length} detection(s) in ${elapsedMs} ms`,
    metadata: {
      attempts,
      elapsedMs,
      host,
      model_version: normalized.value.model_version,
    },
  });

  return {
    ok: true,
    mode,
    usedMock: false,
    response: normalized.value,
    attempts,
    elapsedMs,
    logs,
  };
}

// ---- Admin health check ----
export interface AiHealthResult {
  mode: AiMode;
  externalConfigured: boolean;
  hostname: string | null;
  timeoutMs: number;
  maxRetries: number;
  retryBackoffMs: number;
  status: "mock-ready" | "healthy" | "reachable" | "unreachable" | "misconfigured";
  detail: string;
  checkedAt: string;
}

// Lightweight, non-invasive connectivity probe. Never sends a frame.
export async function checkAiHealth(): Promise<AiHealthResult> {
  const mode = resolveAiMode();
  const url = env.aiModelApiUrl();
  const base = {
    mode,
    externalConfigured: url.length > 0,
    hostname: url ? modelHostname(url) : null,
    timeoutMs: env.aiModelTimeoutMs(),
    maxRetries: env.aiModelMaxRetries(),
    retryBackoffMs: env.aiModelRetryBackoffMs(),
    checkedAt: new Date().toISOString(),
  };

  if (mode === "mock" || (mode === "auto" && url.length === 0)) {
    return { ...base, status: "mock-ready", detail: "Mock detector active; no external call." };
  }
  if (url.length === 0) {
    return {
      ...base,
      status: "misconfigured",
      detail: "Mode is external but AI_MODEL_API_URL is empty.",
    };
  }

  const probeTimeout = Math.min(base.timeoutMs, 5000);

  // 1) Try a conventional /health endpoint on the same origin.
  try {
    const healthUrl = new URL("/health", url).toString();
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), probeTimeout);
    try {
      const res = await fetch(healthUrl, { method: "GET", signal: controller.signal });
      if (res.ok) {
        return { ...base, status: "healthy", detail: `GET /health responded ${res.status}.` };
      }
    } finally {
      clearTimeout(t);
    }
  } catch {
    // fall through to base-URL probe
  }

  // 2) Fallback: a HEAD to the configured URL. Any HTTP response = reachable.
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), probeTimeout);
    try {
      const res = await fetch(url, { method: "HEAD", signal: controller.signal });
      return {
        ...base,
        status: "reachable",
        detail: `Server reachable (HEAD responded ${res.status}); no /health endpoint.`,
      };
    } finally {
      clearTimeout(t);
    }
  } catch (err) {
    const isAbort = (err as Error)?.name === "AbortError";
    return {
      ...base,
      status: "unreachable",
      detail: isAbort
        ? `Probe timed out after ${probeTimeout} ms.`
        : "Could not connect to the model server.",
    };
  }
}
