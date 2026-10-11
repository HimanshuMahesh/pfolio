"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { site } from "@/content/site";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";

/* The Spacered contact buttons (spacered-web booking-section.tsx): raised
   chips with a spring press and a sparkle burst on click. */

// 12-particle burst — varied sizes, distances, and stagger delays
const BURST = [
  { angle: 0, dist: 54, size: 13, delay: 0, star: true },
  { angle: 30, dist: 46, size: 10, delay: 0.04, star: false },
  { angle: 60, dist: 50, size: 12, delay: 0.02, star: true },
  { angle: 90, dist: 58, size: 11, delay: 0.05, star: false },
  { angle: 120, dist: 44, size: 13, delay: 0.01, star: true },
  { angle: 150, dist: 52, size: 10, delay: 0.03, star: false },
  { angle: 180, dist: 54, size: 12, delay: 0.04, star: true },
  { angle: 210, dist: 46, size: 10, delay: 0.02, star: false },
  { angle: 240, dist: 50, size: 13, delay: 0.05, star: true },
  { angle: 270, dist: 58, size: 11, delay: 0.01, star: false },
  { angle: 300, dist: 44, size: 12, delay: 0.03, star: true },
  { angle: 330, dist: 52, size: 10, delay: 0.02, star: false },
];

/** Shape shared by every state. */
const CHIP_BASE = "flex w-fit cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm transition-all duration-200";

/** The resting chip: Spacered's, with a blue cast in the fill and the top highlight. */
const CHIP_REST =
  "bg-spacered-surface-hover text-spacered-muted " +
  "shadow-[inset_0_1px_0_rgba(170,195,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.3),0_2px_6px_rgba(0,0,0,0.35)] " +
  "hover:bg-spacered-surface-tint hover:text-spacered-heading";

const TAP = {
  scale: 0.96,
  transition: { type: "spring", stiffness: 400, damping: 25 },
} as const;

function SparkleParticle({
  angle,
  dist,
  size,
  delay,
  star,
}: {
  angle: number;
  dist: number;
  size: number;
  delay: number;
  star: boolean;
}) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist;
  const half = size / 2;
  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 left-1/2 z-50 text-spacered-heading"
      style={{ marginLeft: -half, marginTop: -half }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{
        x: tx,
        y: ty,
        scale: [0, 1.5, 1.1],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 0.65,
        delay,
        x: { ease: [0.15, 0.8, 0.3, 1], duration: 0.65 },
        y: { ease: [0.15, 0.8, 0.3, 1], duration: 0.65 },
        scale: { times: [0, 0.22, 1], ease: "easeOut", duration: 0.65 },
        opacity: { times: [0, 0.3, 1], ease: "easeIn", duration: 0.65 },
      }}
    >
      {star ? (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 0L7.1 4.9L12 6L7.1 7.1L6 12L4.9 7.1L0 6L4.9 4.9Z" />
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
          <path d="M4.5 0H7.5V4.5H12V7.5H7.5V12H4.5V7.5H0V4.5H4.5Z" />
        </svg>
      )}
    </motion.div>
  );
}

function Sparkles({ burst }: { burst: number }) {
  return burst > 0 ? BURST.map((p, i) => <SparkleParticle key={`${burst}-${i}`} {...p} />) : null;
}

export function SparkleCopyEmail({ children, copiedLabel }: { children: ReactNode; copiedLabel: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  async function handleClick() {
    setSparkleKey((k) => k + 1);
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // clipboard unavailable — silent
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={copied ? "Email copied" : "Copy email address"}
        whileTap={TAP}
        className={[
          CHIP_BASE,
          copied ? "border-transparent bg-spacered-heading text-spacered-canvas font-medium" : CHIP_REST,
        ].join(" ")}
      >
        <span className="relative shrink-0" style={{ width: 14, height: 14 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "check" : "copy"}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {copied ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 7.5L5.5 11L12 4" />
                </svg>
              ) : (
                <CopyIcon size={14} aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="relative" style={{ display: "grid" }}>
          <span className="col-start-1 row-start-1" aria-hidden={copied} style={{ visibility: copied ? "hidden" : "visible" }}>
            {children}
          </span>
          <span className="col-start-1 row-start-1" aria-hidden={!copied} style={{ visibility: copied ? "visible" : "hidden" }}>
            {copiedLabel}
          </span>
        </span>
      </motion.button>
      <Sparkles burst={sparkleKey} />
    </div>
  );
}

export function SparkleLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  const [sparkleKey, setSparkleKey] = useState(0);

  return (
    <div className="relative">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setSparkleKey((k) => k + 1)}
        whileTap={TAP}
        className={`${CHIP_BASE} ${CHIP_REST}`}
      >
        {icon}
        <span>{children}</span>
      </motion.a>
      <Sparkles burst={sparkleKey} />
    </div>
  );
}
