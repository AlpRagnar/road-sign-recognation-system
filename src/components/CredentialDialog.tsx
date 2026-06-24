"use client";

import { useState } from "react";

export interface CredentialInfo {
  title: string;
  rows: { label: string; value: string }[];
  password: string;
}

// One-time credential display. The temporary password is shown here and only
// here — it is never persisted or refetched.
export function CredentialDialog({
  info,
  onClose,
}: {
  info: CredentialInfo;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(info.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-base font-semibold text-slate-900">{info.title}</h3>

        <dl className="mt-4 space-y-2 text-sm">
          {info.rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <dt className="text-slate-500">{r.label}</dt>
              <dd className="text-right font-medium text-slate-800">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">Temporary password</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900">
              {info.password}
            </code>
            <button
              onClick={copy}
              className="rounded-md bg-brand px-3 py-2 text-xs font-medium text-white hover:bg-brand-dark"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Copy this password now. It will not be shown again.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
