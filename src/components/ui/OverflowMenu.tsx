"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export interface OverflowItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  dividerBefore?: boolean;
}

// Accessible "⋯" overflow menu for dense table-row actions.
export function OverflowMenu({
  items,
  label = "More actions",
  align = "right",
}: {
  items: OverflowItem[];
  label?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-panel hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Icon name="more" size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-line bg-white py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.dividerBefore && <div className="my-1 h-px bg-line" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm disabled:opacity-40 ${
                  item.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-panel"
                }`}
              >
                {item.destructive && <Icon name="trash" size={14} />}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
