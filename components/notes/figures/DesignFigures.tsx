"use client";

import { useState } from "react";
import styles from "@/components/notes/Article.module.css";
import { Plate } from "./Plate";
import { Stepper } from "./Stepper";

/* Wireframe figures for "Death of the Blank Canvas". Every element is a
   keyed block, so stepping the slider moves the same blocks to their new
   places instead of redrawing the page. Monochrome, on the site's tokens. */

type Tone = "ink" | "fill" | "faint" | "mid" | "soft" | "blob";
type Block = { id: string; x: number; y: number; w: number; h: number; tone: Tone; r?: number; on?: boolean; round?: boolean };

/** "1 block", "3 blocks". */
const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const TONE: Record<Tone, string> = {
  ink: styles.wfInk,
  fill: styles.wfFill,
  faint: styles.wfFaint,
  mid: styles.wfMid,
  soft: styles.wfSoft,
  blob: styles.wfBlob,
};

/** One block. Position animates through a transform; size changes land at once. */
function Piece({ b }: { b: Block }) {
  const on = b.on !== false;
  return (
    <g className={styles.wfPiece} style={{ transform: `translate(${b.x}px, ${b.y}px)`, opacity: on ? 1 : 0 }}>
      {b.round ? (
        <circle cx={b.w / 2} cy={b.w / 2} r={b.w / 2} className={TONE[b.tone]} />
      ) : (
        <rect width={b.w} height={b.h} rx={b.r ?? 2} className={TONE[b.tone]} />
      )}
    </g>
  );
}

/* ---- Fig: from generated to designed ------------------------------------------ */
const DECISIONS = ["Generated", "+ Hierarchy", "+ Rhythm", "+ Type", "+ Cut"];

/** The same landing page after `step` decisions. */
function page(step: number): Block[] {
  const H = step >= 1, R = step >= 2, T = step >= 3, C = step >= 4;
  const out: Block[] = [];
  const add = (b: Block) => out.push(b);

  add({ id: "logo", x: 44, y: 44, w: 26, h: 6, tone: "fill" });
  [268, 296, 324].forEach((x, i) => add({ id: `nav${i}`, x: C ? x + 28 : x, y: 45, w: i === 2 ? 32 : 22, h: 4, tone: "faint", on: !(C && i === 0) }));

  add({ id: "blobA", x: 288, y: 56, w: 60, h: 60, tone: "blob", round: true, on: !C });

  const hy = C ? 80 : T ? 70 : R ? 74 : 66;
  const hh = T ? 14 : 10;
  add({ id: "h1a", x: 44, y: hy, w: T ? 230 : 200, h: hh, tone: H ? "ink" : "fill" });
  add({ id: "h1b", x: 44, y: hy + hh + 4, w: T ? 170 : 150, h: hh, tone: H ? "ink" : "fill" });

  const sy = hy + 2 * (hh + 4) + (R ? 8 : 4);
  add({ id: "sub1", x: 44, y: sy, w: T ? 190 : 230, h: 4, tone: "faint" });
  add({ id: "sub2", x: 44, y: sy + 8, w: T ? 150 : 200, h: 4, tone: "faint" });

  const by = sy + 8 + (R ? 16 : 12);
  add({ id: "btnA", x: 44, y: by, w: 64, h: 16, tone: H ? "ink" : "mid", r: 3 });
  add(H ? { id: "btnB", x: 116, y: by + 6, w: 40, h: 4, tone: "faint" } : { id: "btnB", x: 114, y: by, w: 64, h: 16, tone: "mid", r: 3 });

  const st = R ? 170 : 146;
  [0, 1, 2, 3].forEach((i) => add({ id: `stat${i}`, x: 44 + i * 80, y: st, w: 72, h: R ? 18 : 24, tone: H ? "soft" : "mid", on: !C }));

  const cy = C ? 196 : R ? 198 : 180;
  const ch = C ? 60 : R ? 48 : 52;
  const pad = R ? 10 : 8;
  [0, 1, 2].forEach((i) => {
    const x = 44 + i * 107;
    add({ id: `card${i}`, x, y: cy, w: 98, h: ch, tone: H ? "soft" : "mid", r: 4 });
    add({ id: `icon${i}`, x: x + pad, y: cy + pad, w: 10, h: 10, tone: "fill" });
    add({ id: `cl1${i}`, x: x + pad, y: cy + pad + 16, w: 60, h: 4, tone: "faint" });
    add({ id: `cl2${i}`, x: x + pad, y: cy + pad + 24, w: 44, h: 4, tone: "faint" });
  });

  add({ id: "quote", x: 44, y: R ? 256 : 242, w: 312, h: R ? 22 : 30, tone: H ? "soft" : "mid", r: 4, on: !C });
  add({ id: "quoteLine", x: 56, y: R ? 265 : 255, w: 200, h: 4, tone: "faint", on: !C });
  return out;
}

export function GeneratedToDesigned({ fig }: { fig: string }) {
  const [step, setStep] = useState(0);
  const blocks = page(step);
  const shown = blocks.filter((b) => b.on !== false && !/^(cl|icon|quoteLine)/.test(b.id)).length;
  return (
    <Plate
      fig={fig}
      title="Generated to designed"
      hint="Step through the decisions"
      readout={`${count(step, "decision")} · ${count(shown, "block")}`}
      caption="The same landing page. Generated, everything gets the same weight and the same padding. Each step is one design decision: what leads, how things group, a real type scale, and finally what to cut. Nothing here needed a better tool. It needed someone to decide."
      control={<Stepper label="Decisions" stops={DECISIONS} value={step} onChange={setStep} />}
    >
      <svg viewBox="0 0 400 300" className={styles.chart} role="img" aria-label="A wireframe landing page that loses decoration and gains hierarchy, spacing and type as each design decision is added.">
        <rect x={24} y={20} width={352} height={266} rx={8} className={styles.wfFrame} />
        <line x1={24} x2={376} y1={34} y2={34} className={styles.wfFrameLine} />
        {[34, 42, 50].map((x) => <circle key={x} cx={x} cy={27} r={2} className={styles.wfFaint} />)}
        {blocks.map((b) => <Piece key={b.id} b={b} />)}
      </svg>
    </Plate>
  );
}

/* ---- Fig: the same flow, with and without a system ----------------------------- */
type Variant = { pad: number; hh: number; hw: number; cardR: number; cardH: number; btnR: number; btnH: number; btnW: number; btn: Tone };

/** Three screens generated one at a time, each with its own idea of a heading, a card and a button. */
const DRIFT: Variant[] = [
  { pad: 10, hh: 8, hw: 56, cardR: 2, cardH: 56, btnR: 2, btnH: 15, btnW: 84, btn: "ink" },
  { pad: 15, hh: 12, hw: 66, cardR: 10, cardH: 44, btnR: 9, btnH: 20, btnW: 70, btn: "mid" },
  { pad: 8, hh: 6, hw: 48, cardR: 5, cardH: 62, btnR: 7, btnH: 12, btnW: 88, btn: "fill" },
];
const SYSTEM: Variant = { pad: 12, hh: 10, hw: 62, cardR: 6, cardH: 52, btnR: 6, btnH: 17, btnW: 80, btn: "ink" };

function screen(i: number, v: Variant): Block[] {
  const px = 24 + i * 124;
  const x = px + v.pad;
  const inner = 104 - v.pad * 2;
  return [
    { id: `s${i}bar`, x: px + 36, y: 40, w: 32, h: 4, tone: "faint" },
    { id: `s${i}h`, x, y: 62, w: v.hw, h: v.hh, tone: "fill" },
    { id: `s${i}b1`, x, y: 62 + v.hh + 10, w: inner, h: 4, tone: "faint" },
    { id: `s${i}b2`, x, y: 62 + v.hh + 18, w: inner * 0.7, h: 4, tone: "faint" },
    { id: `s${i}card`, x, y: 116, w: inner, h: v.cardH, tone: "mid", r: v.cardR },
    { id: `s${i}cl`, x: x + 8, y: 128, w: inner - 30, h: 4, tone: "faint" },
    { id: `s${i}btn`, x: px + (104 - v.btnW) / 2, y: 238 - v.btnH, w: v.btnW, h: v.btnH, tone: v.btn, r: v.btnR },
  ];
}

export function SystemConsistency({ fig }: { fig: string }) {
  const [mode, setMode] = useState(0);
  const variants = mode === 1 ? [SYSTEM, SYSTEM, SYSTEM] : DRIFT;
  const kinds = (pick: (v: Variant) => string) => new Set(variants.map(pick)).size;
  return (
    <Plate
      fig={fig}
      title="Three screens, one system"
      hint="Step to add a system"
      readout={`${count(kinds((v) => `${v.btnR}${v.btnH}${v.btnW}${v.btn}`), "button style")} · ${count(kinds((v) => `${v.hh}`), "heading size")}`}
      caption="One onboarding flow, generated screen by screen. Without a system every screen invents its own button, heading and card. Give the tool a system and the decisions are already made, so all three screens agree."
      control={<Stepper label="Rules" stops={["No system", "With a system"]} value={mode} onChange={setMode} />}
    >
      <svg viewBox="0 0 400 300" className={styles.chart} role="img" aria-label="Three phone screens. Without a design system their buttons, headings and cards all differ; with one they match.">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={24 + i * 124} y={28} width={104} height={226} rx={12} className={styles.wfFrame} />
        ))}
        {variants.flatMap((v, i) => screen(i, v)).map((b) => <Piece key={b.id} b={b} />)}
        {[0, 1, 2].map((i) => (
          <text key={i} x={76 + i * 124} y={274} textAnchor="middle" className={styles.tick}>step {i + 1}</text>
        ))}
      </svg>
    </Plate>
  );
}
