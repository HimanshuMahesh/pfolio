"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { downloadStub, drawStub, loadStubFonts, newStub, type Stub } from "@/lib/stub";
import styles from "./StubButton.module.css";

/** Pixel confetti, fired once as the stub lands. */
function Burst({ stub }: { stub: Stub }) {
  const [bits] = useState(() =>
    Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3;
      const d = 150 + Math.random() * 110;
      const l = stub.hue.l[0] + ((stub.hue.l[1] - stub.hue.l[0]) * (2 + (i % 3))) / 4;
      return {
        "--tx": `${Math.cos(a) * d}px`,
        "--ty": `${Math.sin(a) * d}px`,
        "--r": `${Math.random() * 180}deg`,
        "--sz": `${6 + Math.floor(Math.random() * 6)}px`,
        "--c": `hsl(${stub.hue.h} ${stub.hue.s}% ${l}%)`,
        animationDelay: `${0.2 + Math.random() * 0.15}s`,
      } as CSSProperties;
    }),
  );
  return (
    <div className={styles.burst} aria-hidden="true">
      {bits.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}

/** Leans toward the pointer on an underdamped spring. */
function useSpringTilt() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const s = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
    const k = 220;
    const c = 2 * Math.sqrt(k) * 0.55;
    let raf = 0;
    let last = 0;
    const step = (t: number) => {
      const dt = Math.min(0.064, (t - (last || t)) / 1000);
      last = t;
      s.vx += (k * (s.tx - s.x) - c * s.vx) * dt;
      s.vy += (k * (s.ty - s.y) - c * s.vy) * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      el.style.transform = `rotateX(${-s.y * 12}deg) rotateY(${s.x * 12}deg)`;
      if (Math.abs(s.vx) + Math.abs(s.vy) + Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.001) raf = requestAnimationFrame(step);
      else raf = last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      s.tx = ((e.clientX - b.left) / b.width - 0.5) * 2;
      s.ty = ((e.clientY - b.top) / b.height - 0.5) * 2;
      kick();
    };
    const home = () => {
      s.tx = s.ty = 0;
      kick();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", home);
    el.addEventListener("pointerup", home);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", home);
      el.removeEventListener("pointerup", home);
    };
  }, []);
  return ref;
}

function StubModal({ stub, onClose }: { stub: Stub; onClose: () => void }) {
  const canvas = useSpringTilt();
  const [ready, setReady] = useState(false);
  const thanks = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    loadStubFonts().then(() => {
      if (!live || !canvas.current) return;
      drawStub(canvas.current, stub);
      setReady(true);
      thanks.current?.focus({ preventScroll: true });
    });
    return () => {
      live = false;
    };
  }, [stub, canvas]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const theme = {
    "--h": stub.hue.h,
    "--s": `${stub.hue.s}%`,
    "--btn-l": `${stub.hue.btnL}%`,
    "--btn-ink": stub.hue.ink,
  } as CSSProperties;

  return (
    <div
      className={styles.overlay}
      data-ready={ready || undefined}
      style={theme}
      role="dialog"
      aria-modal="true"
      aria-label="Your stub"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.cluster}>
        {ready && <Burst stub={stub} />}
        <button type="button" className={styles.x} onClick={onClose} aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
          </svg>
        </button>
        <div className={styles.reveal}>
          <div className={styles.float}>
            <div className={styles.shadow}>
              <canvas
                ref={canvas}
                className={styles.canvas}
                role="img"
                aria-label={`Stub from ${stub.from}, on ${stub.on}, at ${stub.at}. “${stub.quote[0]}” — ${stub.quote[1]}`}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        ref={thanks}
        type="button"
        className={styles.thanks}
        onClick={() => {
          if (canvas.current) downloadStub(canvas.current, stub);
          setTimeout(onClose, 250);
        }}
      >
        Thanks!
      </button>
    </div>
  );
}

/** A coloured tag among the /fun filters; opens a fresh stub each time. */
export function StubButton() {
  const [stub, setStub] = useState<Stub | null>(null);
  const close = useCallback(() => setStub(null), []);

  return (
    <>
      <button type="button" className={styles.tag} onClick={() => setStub(newStub())} aria-haspopup="dialog">
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h13A1.5 1.5 0 0 1 18 3.5V6a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 12.5V10a2 2 0 0 0 0-4Z" />
          <path d="M13 2.5v11" strokeDasharray="1.6 2" />
        </svg>
        Get my stub!
      </button>
      {stub && createPortal(<StubModal stub={stub} onClose={close} />, document.body)}
    </>
  );
}
