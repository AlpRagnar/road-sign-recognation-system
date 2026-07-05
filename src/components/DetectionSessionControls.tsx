"use client";

interface Props {
  running: boolean;
  starting: boolean;
  startDisabled?: boolean;
  durationSeconds: number;
  framesSent: number;
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  onStart: () => void;
  onStop: () => void;
}

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function DetectionSessionControls({
  running,
  starting,
  startDisabled,
  durationSeconds,
  framesSent,
  intervalMs,
  onIntervalChange,
  onStart,
  onStop,
}: Props) {
  return (
    <div className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Session</p>
          <p className="text-xs text-slate-400">
            {running ? "Active" : "Stopped"} · {framesSent} frames sent
          </p>
        </div>
        <p className="font-mono text-2xl text-slate-800">{fmtDuration(durationSeconds)}</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs text-slate-500">Capture interval</label>
        <select
          value={intervalMs}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          disabled={running}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-60"
        >
          <option value={1000}>1s</option>
          <option value={2000}>2s</option>
          <option value={3000}>3s</option>
        </select>
      </div>

      <div className="mt-4 flex gap-3">
        {!running ? (
          <button
            onClick={onStart}
            disabled={starting || startDisabled}
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start detection"}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Stop detection
          </button>
        )}
      </div>
    </div>
  );
}
