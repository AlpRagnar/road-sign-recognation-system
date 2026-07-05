"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

// Right slide-in drawer on desktop; full-height bottom sheet on mobile.
// Focus-trapped, ESC to close, focus restored. Backdrop click closes.
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
  widthClass = "sm:max-w-md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = panelRef.current?.querySelectorAll<HTMLElement>(
          'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!f || f.length === 0) return;
        const arr = Array.from(f).filter((el) => !el.hasAttribute("disabled"));
        const firstEl = arr[0]!;
        const lastEl = arr[arr.length - 1]!;
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/45" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={`relative flex h-full w-full flex-col bg-white shadow-xl sm:w-full ${widthClass} sm:border-l sm:border-line
        max-sm:mt-16 max-sm:rounded-t-lg`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-panel"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-line px-5 py-3 pb-safe">{footer}</div>
        )}
      </div>
    </div>
  );
}
