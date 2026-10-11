"use client";

import { useEffect, useRef } from "react";

/* The footer is a diffusion model at work: every time it scrolls into view it
   starts from pure noise and is denoised, step by step, into one word set in
   pixel cells — then holds it. Wide screens get "BAZINGA!"; where that would
   be too small to read, "CIAO". The cursor perturbs whatever it passes over.
   One clean sample with reduced motion. */

const WORDS = ["BAZINGA!", "CIAO"]; // first that reads at this size wins; the last is the fallback
const MIN_WORD_ROWS = 7; // letter height, in cells, below which a word doesn't read
const MAX_CELL = 20; // px
const MIN_CELL = 12; // px — the smallest cell that still carries its digit
const COLS_WANTED = 76;

const STEPS = 50;
const STEP_MS = 70; // one denoising step

const CURSOR_REACH = 4.5; // cells
const HEAT_MS = 260; // how long a cell takes to answer the cursor, in and out
const JITTER_DRIFT = 0.04; // how fast the noise under the cursor wanders (per frame)
const GLYPHS = ["0", "1", "2", "4", "7", "8", "9", "#", "B", "F"];

/** eps: sampling noise · x0: the clean word · heat/jit: the cursor's eased, slowly wandering disturbance */
type Cell = { char: string; eps: number; x0: number; heat: number; jit: number };

const pick = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Navy → royal → azure → sky → white, with a legible glyph colour for each. */
function colours(density: number) {
  const v = Math.max(0, Math.min(1, density));
  if (v < 0.25) return { bg: `rgb(${24 + v * 40},${52 + v * 70},${135 + v * 60})`, fg: "rgba(147,197,253,0.4)" };
  if (v < 0.52) return { bg: `rgb(${40 + v * 60},${85 + v * 100},${200 + v * 45})`, fg: "rgba(191,219,254,0.7)" };
  if (v < 0.78) return { bg: `rgb(${100 + v * 80},${150 + v * 80},255)`, fg: "rgba(30,58,138,0.75)" };
  if (v < 0.9) return { bg: `rgb(${195 + v * 50},${220 + v * 35},255)`, fg: "rgba(29,78,216,0.9)" };
  return { bg: "#fff", fg: "#1d4ed8" };
}

/** Cosine noise schedule: signal weight at step s of STEPS (0 = pure noise, 1 = clean). */
const signalAt = (s: number) => Math.sin(((s / STEPS) * Math.PI) / 2);

/** The word rendered as a cols × rows coverage mask (0–1), and how many rows of cells its letters span. */
function rasterise(word: string, cols: number, rows: number, family: string): { mask: Float32Array; tall: number } {
  const SS = 4; // supersample, then average down to cells
  const w = cols * SS;
  const h = rows * SS;
  const mask = new Float32Array(cols * rows);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) return { mask, tall: 0 };

  let size = h * 0.62;
  g.font = `700 ${size}px ${family}`;
  const fit = (w * 0.88) / g.measureText(word).width;
  if (fit < 1) size *= fit;

  g.font = `700 ${size}px ${family}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#fff";
  g.fillText(word, w / 2, h / 2 + size * 0.04);

  const px = g.getImageData(0, 0, w, h).data;
  let tall = 0;
  for (let r = 0; r < rows; r++) {
    let inked = false;
    for (let col = 0; col < cols; col++) {
      let sum = 0;
      for (let y = 0; y < SS; y++)
        for (let x = 0; x < SS; x++) sum += px[((r * SS + y) * w + col * SS + x) * 4 + 3];
      mask[r * cols + col] = sum / (SS * SS * 255);
      if (mask[r * cols + col] > 0.5) inked = true;
    }
    if (inked) tall++;
  }
  return { mask, tall };
}

export function FooterHeatmap({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const family = `${getComputedStyle(document.documentElement).getPropertyValue("--font-zalando").trim() || "Helvetica"}, Helvetica, Arial, sans-serif`;
    const pointer = { x: 0, y: 0, on: false };
    let W = 0;
    let H = 0;
    let size = MAX_CELL;
    let cols = 0;
    let rows = 0;
    let cells: Cell[] = [];
    let clock = 0; // ms of visible running time since this sample began
    let lastStep = -1;
    let raf = 0;
    let last = 0;
    let visible = false;

    const stepAt = (ms: number) => Math.min(STEPS, Math.floor(ms / STEP_MS) + 1);

    /** Back to pure noise, ready to sample the word again. */
    function restart() {
      clock = 0;
      lastStep = -1;
      for (const cell of cells) cell.eps = Math.random();
    }

    function draw(w: number, resample: boolean, dt = 0) {
      const cw = W / cols;
      const ch = H / rows;
      const settled = w > 0.97;
      const ease = 1 - Math.exp(-dt / HEAT_MS);
      const px = (pointer.x / W) * cols;
      const py = (pointer.y / H) * rows;
      ctx!.font = `600 ${Math.max(8, Math.round(size / 2))}px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.lineWidth = 0.5;
      ctx!.strokeStyle = "rgba(255,255,255,0.12)";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r * cols + c];
          // each sampling step redraws part of the noise, so the field visibly churns while it resolves
          if (resample) cell.eps = 0.65 * cell.eps + 0.35 * Math.random();
          let v = w * cell.x0 + (1 - w) * cell.eps;

          const target = pointer.on ? Math.max(0, 1 - Math.hypot(c - px, r - py) / CURSOR_REACH) : 0;
          cell.heat += (target - cell.heat) * ease;
          if (cell.heat > 0.01) {
            cell.jit += (Math.random() - cell.jit) * JITTER_DRIFT;
            v += (cell.jit - v) * cell.heat * 0.85;
          }

          // the finished sample resolves into bits: 1 for the word, 0 for the ground
          if (settled && cell.heat < 0.05) cell.char = cell.x0 > 0.5 ? "1" : "0";
          else if (Math.random() < 0.004 + 0.2 * (1 - w) + 0.03 * cell.heat) cell.char = pick();

          const { bg, fg } = colours(v);
          const x = c * cw;
          const y = r * ch;
          ctx!.fillStyle = bg;
          ctx!.fillRect(x, y, cw, ch);
          ctx!.strokeRect(x, y, cw, ch);
          ctx!.fillStyle = fg;
          ctx!.fillText(cell.char, x + cw / 2, y + ch / 2 + 1);
        }
      }
    }

    function frame(now: number) {
      const dt = Math.min(now - last, 64);
      clock += dt;
      last = now;
      const step = stepAt(clock);
      draw(signalAt(step), step !== lastStep && step < STEPS, dt);
      lastStep = step;
      raf = visible ? requestAnimationFrame(frame) : 0;
    }

    const kick = () => {
      if (!cols) return;
      if (reduce.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
        draw(1, false);
      } else if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas!.clientWidth;
      H = canvas!.clientHeight;
      if (!W || !H) return;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = Math.max(MIN_CELL, Math.min(MAX_CELL, W / COLS_WANTED));
      cols = Math.max(1, Math.round(W / size));
      rows = Math.max(1, Math.round(H / size));

      let word = WORDS[0];
      let mask: Float32Array = new Float32Array(cols * rows);
      for (word of WORDS) {
        const r = rasterise(word, cols, rows, family);
        mask = r.mask;
        if (r.tall >= MIN_WORD_ROWS) break;
      }
      canvas!.setAttribute("aria-label", word.charAt(0) + word.slice(1).toLowerCase());
      cells = Array.from({ length: cols * rows }, (_, i) => ({ char: pick(), eps: Math.random(), x0: 0.1 + 0.86 * mask[i], heat: 0, jit: Math.random() }));
      draw(reduce.matches ? 1 : signalAt(stepAt(clock)), false);
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      Object.assign(pointer, { x: e.clientX - r.left, y: e.clientY - r.top, on: true });
    };
    const onLeave = () => {
      pointer.on = false;
      if (reduce.matches) draw(1, false);
    };

    // every arrival samples the word afresh
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) restart();
      visible = e.isIntersecting;
      kick();
    });
    const ro = new ResizeObserver(resize);
    // the word is set in the site face, so re-rasterise once it has loaded
    document.fonts?.ready.then(() => cols && resize());
    io.observe(canvas);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", kick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      reduce.removeEventListener("change", kick);
    };
  }, []);

  return <canvas ref={ref} className={className} role="img" aria-label="Bazinga!" />;
}
