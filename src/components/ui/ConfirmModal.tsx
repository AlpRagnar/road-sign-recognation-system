"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { btnDanger, btnPrimary, btnSecondary } from "@/components/ui/primitives";

// Accessible confirmation modal: focus-trapped, ESC to cancel, focus restored.
// For destructive actions, the backdrop does NOT dismiss (dismissOnBackdrop=false).

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
  dismissOnBackdrop,
}: {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  dismissOnBackdrop?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const allowBackdrop = dismissOnBackdrop ?? !destructive;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        onCancel();
      }
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/45 p-4"
      onMouseDown={(e) => {
        if (allowBackdrop && !busy && e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl ring-1 ring-line"
      >
        <div className="flex items-start gap-3">
          {destructive && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Icon name="warning" size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className={`text-base font-semibold ${destructive ? "text-red-700" : "text-slate-900"}`}>
              {title}
            </h2>
            {children && <div className="mt-2 text-sm text-slate-600">{children}</div>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} disabled={busy} className={btnSecondary}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={busy}
            className={destructive ? btnDanger : btnPrimary}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Bordered danger zone wrapper for destructive admin actions.
export function DangerZone({
  title = "Danger zone",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50/50 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-700">
        <Icon name="warning" size={14} /> {title}
      </p>
      {children}
    </div>
  );
}
