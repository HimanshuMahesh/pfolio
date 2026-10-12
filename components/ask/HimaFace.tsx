"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/grid";
import styles from "./HimaFace.module.css";

export type Mood = "idle" | "happy" | "thinking";

/* Where every face on the page should look. One set of listeners, shared. */
const attention = { x: 0, y: 0, at: -1e9, typedAt: -1e9 };
let listeners = 0;
const onPointer = (e: PointerEvent) => {
  attention.x = e.clientX;
  attention.y = e.clientY;
  attention.at = performance.now();
};
const onInput = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return;
  const r = el.getBoundingClientRect();
  // Watch the end of the line being typed, roughly
  attention.x = r.left + Math.min(r.width, 24 + ((el as HTMLTextAreaElement).value?.length ?? 0) * 7);
  attention.y = r.top + r.height / 2;
  attention.typedAt = attention.at = performance.now();
};
/** Have every face look at a point on screen for a moment (e.g. a section Hima is showing). */
export function glance(x: number, y: number) {
  attention.x = x;
  attention.y = y;
  attention.at = performance.now();
}

function listen() {
  if (listeners++ === 0) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("input", onInput, true);
  }
  return () => {
    if (--listeners === 0) {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("input", onInput, true);
    }
  };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* The eyes are drawn in a 100 × 100 box: two thin, round-capped lines, each a
   quadratic curve. Upright, they bow toward wherever Hima looks; happy, they
   bend into ∩ arcs; blinking pinches them short. */
const GAP = 13;   // each eye's distance from the centre line
const TALL = 10;  // half-height of an open eye
const REACH = { x: 11, y: 8 };

function eye(side: -1 | 1, x: number, y: number, lid: number, joy: number) {
  const cx = 50 + side * GAP + x * REACH.x;
  const cy = 50 + y * REACH.y;
  const h = TALL * lid;
  // Upright: top → bottom, bowed sideways with the look (the eye nearer the
  // look bends a touch more, like it's turning)
  const bow = x * (4 + side * x * 1.2);
  const up = [cx, cy - h, cx + bow, cy, cx, cy + h];
  // Happy: a ∩ arc, a bit wider than tall
  const arc = [cx - 7, cy + 3, cx, cy - 8 * lid, cx + 7, cy + 3];
  const p = up.map((v, k) => v + (arc[k] - v) * joy);
  return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}Q${p[2].toFixed(2)} ${p[3].toFixed(2)} ${p[4].toFixed(2)} ${p[5].toFixed(2)}`;
}

/**
 * Hima's face: two thin glowing lines. Hima is never still. The eyes glance
 * around on their own, turn to the pointer when it moves, watch the field
 * while someone types, scan while thinking, blink now and then, and bend into
 * happy arcs on cue. The paths are rewritten each frame, so nothing re-renders.
 */
export function HimaFace({ mood = "idle", className }: { mood?: Mood; className?: string }) {
  const face = useRef<HTMLSpanElement>(null);
  const left = useRef<SVGPathElement>(null);
  const right = useRef<SVGPathElement>(null);
  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    const el = face.current;
    const l = left.current;
    const r = right.current;
    if (!el || !l || !r) return;
    const unlisten = listen();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return unlisten;

    const cur = { x: 0, y: 0 };
    const goal = { x: 0, y: 0 };
    let joy = 0;
    let nextGlance = 0;
    let nextBlink = performance.now() + rand(1200, 3500);
    let blinkAt = -1e9;
    let raf = 0;
    let lastL = "";
    let lastR = "";

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const m = moodRef.current;

      if (m === "thinking") {
        // Reading somewhere up and to the side, eyes ticking back and forth
        goal.x = Math.sin(now / 260) > 0 ? 0.7 : -0.2;
        goal.y = -0.55;
      } else if (now - attention.at < (now - attention.typedAt < 1600 ? 1600 : 1400)) {
        // Look at what just moved: fully when it's close, a hint when far
        const dx = attention.x - cx;
        const dy = attention.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 160);
        goal.x = (dx / d) * k;
        goal.y = (dy / d) * k;
      } else if (now > nextGlance) {
        // Glance somewhere new; now and then back to centre
        const a = rand(0, Math.PI * 2);
        const k = Math.random() < 0.25 ? 0 : rand(0.45, 1);
        goal.x = Math.cos(a) * k;
        goal.y = Math.sin(a) * k * 0.8;
        nextGlance = now + (Math.random() < 0.2 ? rand(180, 320) : rand(700, 2600));
      }

      // Saccade: quick to arrive, no overshoot. The happy bend eases slower.
      cur.x += (goal.x - cur.x) * 0.22;
      cur.y += (goal.y - cur.y) * 0.22;
      joy += ((m === "happy" ? 1 : 0) - joy) * 0.16;

      if (now > nextBlink) {
        blinkAt = now;
        nextBlink = now + (Math.random() < 0.18 ? 240 : rand(2400, 6000));
      }
      const t = (now - blinkAt) / 150;
      const lid = t < 1 ? 1 - Math.sin(t * Math.PI) * 0.85 : 1;

      // Only touch the DOM when the eyes actually moved: most frames they're resting.
      const dl = eye(-1, cur.x, cur.y, lid, joy);
      const dr = eye(1, cur.x, cur.y, lid, joy);
      if (dl !== lastL) l.setAttribute("d", (lastL = dl));
      if (dr !== lastR) r.setAttribute("d", (lastR = dr));
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      unlisten();
    };
  }, []);

  return (
    <span ref={face} className={cx(styles.face, className)} data-mood={mood} aria-hidden="true">
      <svg viewBox="0 0 100 100" className={styles.eyes}>
        <path ref={left} d={eye(-1, 0, 0, 1, 0)} />
        <path ref={right} d={eye(1, 0, 0, 1, 0)} />
      </svg>
    </span>
  );
}
