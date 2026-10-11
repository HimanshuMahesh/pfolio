"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Degrees a tile leans toward the pointer at its edge. */
const MAX_TILT = 6;

/**
 * Leans any `[data-tilt]` tile inside toward the pointer. One listener for the whole gallery; mouse and pen only, and never
 * under reduced motion.
 */
export function Tilt({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let current: HTMLElement | null = null;

    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element).closest<HTMLElement>("[data-tilt]");
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - y) * MAX_TILT}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * MAX_TILT}deg`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      if (current) reset(current);
      current = null;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
