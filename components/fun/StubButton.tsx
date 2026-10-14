"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { HoloCard } from "@/components/ui/HoloCard";
import { downloadStub, drawStub, loadStubFonts, newStub, STUB_FOIL_AREA, type Stub } from "@/lib/stub";
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

function StubModal({ stub, onClose }: { stub: Stub; onClose: () => void }) {
  // Drawn off screen: the PNG is what's downloaded, its data URL is the card's art.
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [art, setArt] = useState<string | null>(null);
  const ready = art !== null;
  const thanks = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let live = true;
    loadStubFonts().then(() => {
      if (!live) return;
      const c = document.createElement("canvas");
      drawStub(c, stub);
      canvas.current = c;
      setArt(c.toDataURL("image/png"));
      thanks.current?.focus({ preventScroll: true });
    });
    return () => {
      live = false;
    };
  }, [stub]);

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
            {art && (
              <HoloCard
                image={art}
                alt={`Stub from ${stub.from}, on ${stub.on}, at ${stub.at}. “${stub.quote[0]}” — ${stub.quote[1]}`}
                preset={stub.foil}
                intensity={0.8}
                foilArea={STUB_FOIL_AREA}
                foilOutside={0.12}
                edgeSparkle={0.55}
                frame={3}
                glare={0.45}
                width="min(300px, 78vw)"
                radius={16}
                className={styles.card}
              />
            )}
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
