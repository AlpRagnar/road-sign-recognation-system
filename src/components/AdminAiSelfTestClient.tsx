"use client";

import { useState } from "react";

interface SelfTestDetection {
  class_id: number | null;
  class_name: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number } | null;
}

interface SelfTestSuccess {
  ok: true;
  mode: string;
  usedMock: boolean;
  elapsedMs: number;
  attempts: number;
  modelVersion: string | null;
  processingTimeMs: number | null;
  detections: SelfTestDetection[];
  message: string;
}

interface SelfTestFailure {
  ok: false;
  category?: string;
  attempts?: number;
  elapsedMs?: number;
  mode?: string;
  message: string;
}

type Result = SelfTestSuccess | SelfTestFailure;

export function AdminAiSelfTestClient() {
  const [file, setFile] = useState<File | null>(null);
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run(useEvent: boolean) {
    setLoading(true);
    setResult(null);
    try {
      let res: Response;
      if (useEvent) {
        res = await fetch("/api/admin/ai/self-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ detectionEventId: eventId.trim() }),
        });
      } else {
        const fd = new FormData();
        fd.append("file", file!);
        res = await fetch("/api/admin/ai/self-test", { method: "POST", body: fd });
      }
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setResult({
          ok: false,
          message: json.error || `Self-test failed (${res.status})`,
          category: json.category,
          attempts: json.attempts,
          elapsedMs: json.elapsedMs,
          mode: json.mode,
        });
      } else {
        setResult({ ok: true, ...json.data });
      }
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Model contract self-test</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Validates the configured AI server against the expected contract. Does not create any
          detection records.
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <button
            onClick={() => run(false)}
            disabled={loading || !file}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {loading ? "Running…" : "Run with uploaded image"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="…or existing detection event id"
            className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={() => run(true)}
            disabled={loading || !eventId.trim()}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Run with existing frame
          </button>
        </div>

        {result && <SelfTestResult result={result} />}
      </div>
    </div>
  );
}

function SelfTestResult({ result }: { result: Result }) {
  if (!result.ok) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-medium">Self-test failed</p>
        <p className="mt-1">{result.message}</p>
        <p className="mt-1 text-xs text-red-600">
          {result.category && <>category: {result.category} · </>}
          {result.mode && <>mode: {result.mode} · </>}
          {result.attempts != null && <>attempts: {result.attempts} · </>}
          {result.elapsedMs != null && <>elapsed: {result.elapsedMs} ms</>}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md bg-green-50 px-4 py-3 text-sm">
      <p className="font-medium text-green-800">{result.message}</p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-green-700">
        <span>mode: {result.mode}{result.usedMock ? " (mock)" : ""}</span>
        <span>elapsed: {result.elapsedMs} ms</span>
        <span>attempts: {result.attempts}</span>
        <span>model: {result.modelVersion ?? "—"}</span>
        <span>detections: {result.detections.length}</span>
        <span>processing: {result.processingTimeMs != null ? `${result.processingTimeMs} ms` : "—"}</span>
      </div>

      {result.detections.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md bg-white ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Bbox (x,y,w,h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.detections.map((d, i) => (
                <tr key={i}>
                  <td className="px-3 py-1.5 font-medium text-slate-800">{d.class_name}</td>
                  <td className="px-3 py-1.5 text-slate-600">{d.class_id ?? "—"}</td>
                  <td className="px-3 py-1.5 text-slate-600">{(d.confidence * 100).toFixed(0)}%</td>
                  <td className="px-3 py-1.5 font-mono text-slate-600">
                    {d.bbox
                      ? `${d.bbox.x}, ${d.bbox.y}, ${d.bbox.width}, ${d.bbox.height}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
