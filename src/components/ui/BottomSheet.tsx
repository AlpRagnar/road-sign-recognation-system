"use client";

import { useEffect, useRef, useState } from "react";

export type SheetSnap = "collapsed" | "medium" | "expanded";

// Draggable bottom sheet with three snap states. Mobile-only usage (maps).
// Heights are viewport-relative; the collapsed state keeps map controls visible.
const HEIGHTS: Record<SheetSnap, string> = {
  collapsed: "128px",
  medium: "48vh",
  expanded: "88vh",
};
const ORDER: SheetSnap[] = ["collapsed", "medium", "expanded"];

export function BottomSheet({
  open,
  snap,
  onSnapChange,
  onClose,
  ariaLabel,
  children,
}: {
  open: boolean;
  snap: SheetSnap;
  onSnapChange: (s: SheetSnap) => void;
  onClose?: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && onClose) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current || startY.current == null) return;
    setDragOffset(e.clientY - startY.current);
  }
  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    const offset = dragOffset;
    setDragOffset(0);
    startY.current = null;
    const idx = ORDER.indexOf(snap);
    // Drag up (negative) → expand; drag down (positive) → collapse.
    if (offset < -60 && idx < ORDER.length - 1) onSnapChange(ORDER[idx + 1]!);
    else if (offset > 60) {
      if (idx > 0) onSnapChange(ORDER[idx - 1]!);
      else if (onClose) onClose();
    }
  }

  function cycle() {
    const idx = ORDER.indexOf(snap);
    onSnapChange(ORDER[(idx + 1) % ORDER.length]!);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-[900] flex flex-col rounded-t-lg border border-line bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.12)] md:hidden"
      style={{
        height: HEIGHTS[snap],
        transform: dragOffset ? `translateY(${Math.max(0, dragOffset)}px)` : undefined,
        transition: dragging.current ? "none" : "height 200ms ease, transform 200ms ease",
      }}
    >
      {/* Drag handle */}
      <button
        type="button"
        aria-label="Resize panel"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={cycle}
        className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center py-2.5 active:cursor-grabbing"
      >
        <span className="h-1.5 w-10 rounded-full bg-slate-300" />
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-safe">{children}</div>
    </div>
  );
}
