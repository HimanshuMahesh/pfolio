"use client";

import { useEffect } from "react";
import { Architects_Daughter } from "next/font/google";
import { BLUEPRINT_SEEN_KEY } from "@/lib/blueprint";

/* Handwriting for the two margin notes. Only the homepage loads it. */
const hand = Architects_Daughter({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

type Target = {
  sel: string;
  /** Box the text itself, not the block (a short line in a wide column). */
  fit?: boolean;
  /** Width dimension under the box. */
  dim?: boolean;
  /** Part of the hero stack: gets a spacing tick to the next one. */
  stack?: boolean;
  /** Full-bleed backdrop: dashed edge, no hatch, never snapped. */
  area?: boolean;
  /** Boxes drawn inside this one; they ink in with it. */
  kids?: Omit<Target, "kids">[];
};

const TARGETS: Target[] = [
  { sel: '[data-bp="sky"]', area: true },
  {
    sel: '[data-bp="nav"]',
    kids: [{ sel: '[data-bp="logo"]' }, { sel: '[data-bp="links"]' }, { sel: '[data-bp="hi"]' }],
  },
  { sel: '[data-bp="portrait"]', stack: true },
  { sel: '[data-bp="chips"]' },
  { sel: '[data-bp="toggles"]' },
  { sel: '[data-bp="name"]', fit: true, stack: true },
  { sel: '[data-bp="tagline"]', fit: true, stack: true },
  { sel: '[data-bp="copy-1"]', dim: true, stack: true },
  { sel: '[data-bp="copy-2"]', dim: true, stack: true },
  { sel: "#work > .t-label" },
  ...[1, 2, 3, 4].map((n) => ({ sel: `#work article:nth-of-type(${n})` })),
];

const NOTES = { left: "home · sheet 1 of 3", right: "all dims in px" };

/** Timeline, ms. The whole run fits in ~2s: staggers are spans, split across however many boxes there are. */
const T = { box: 120, boxSpan: 440, draw: 360, settle: 440, inkSpan: 240, lift: 400 };
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll", "resize"] as const;

type Box = {
  t: Target;
  el: HTMLElement;
  kid: boolean;
  r: DOMRect;
  sx0: number;
  sx1: number;
  i: number;
  kids: Box[];
  node?: HTMLDivElement;
  dimEl?: HTMLElement;
  remL?: HTMLElement;
  remR?: HTMLElement;
};

const px = (v: number) => `${Math.round(v)}px`;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function make(cls: string, css: Partial<CSSStyleDeclaration> = {}, text?: string | number) {
  const n = document.createElement(cls === "b" ? "b" : "div");
  if (cls !== "b") n.className = cls;
  Object.assign(n.style, css);
  if (text != null) n.textContent = String(text);
  return n;
}

/**
 * The homepage "sets out" before it inks in, like a drafting sheet:
 *   1. sheet   the live 4 / 8 / 12 column grid draws down, margins hatch
 *   2. boxes   each element drawn as a hatched placeholder, snapped out to whole columns
 *   3. settle  boxes shrink to their true size while the dimensions count down
 *   4. ink     content fades in over its box, the sheet lifts
 * Every box is measured from the real element, so it holds at any width.
 * Only runs when the boot script (lib/blueprint.ts) set html.bp-run; any
 * click, key or scroll skips to the end.
 */
export function Blueprint() {
  useEffect(() => {
    const root = document.documentElement;
    const w = window as Window & { __bpFailsafe?: number };
    if (!root.classList.contains("bp-run")) return;
    clearTimeout(w.__bpFailsafe);

    const still = /[?&]bp=still(&|$)/.test(location.search);
    const timers: number[] = [];
    const targets: HTMLElement[] = [];
    let raf = 0;
    let done = false;
    let bp: HTMLDivElement | null = null;
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const cleanup = () => {
      bp?.remove();
      bp = null;
      root.classList.remove("bp-run");
      root.classList.add("bp-done");
      targets.forEach((el) => el.classList.remove("bp-t", "bp-on"));
      try {
        sessionStorage.setItem(BLUEPRINT_SEEN_KEY, "1");
      } catch {}
      SKIP_EVENTS.forEach((e) => removeEventListener(e, skip, true));
      document.removeEventListener("visibilitychange", onHide);
    };

    function skip() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
      targets.forEach((el) => el.classList.add("bp-on"));
      if (!bp) return cleanup();
      bp.classList.add("is-fast", "is-out");
      timers.push(window.setTimeout(cleanup, 280));
    }
    function onHide() {
      if (document.hidden) skip();
    }

    const build = () => {
      if (done) return;
      const vw = root.clientWidth;
      const vh = innerHeight;

      // the grid the page actually uses
      const cs = getComputedStyle(root);
      const cols = parseInt(cs.getPropertyValue("--grid-cols"), 10) || 12;
      const gut = parseFloat(cs.getPropertyValue("--grid-gutter")) || 24;
      const wrap = document.querySelector<HTMLElement>("main .wrap");
      if (!wrap) return skip();
      const wr = wrap.getBoundingClientRect();
      const ws = getComputedStyle(wrap);
      const L = wr.left + parseFloat(ws.paddingLeft);
      const R = wr.right - parseFloat(ws.paddingRight);
      const cw = (R - L - gut * (cols - 1)) / cols;
      const starts = Array.from({ length: cols }, (_, i) => L + i * (cw + gut));
      const ends = starts.map((s) => s + cw);
      const snap = (x0: number, x1: number): [number, number] => [
        x0 >= L - 0.5 ? Math.max(...starts.filter((s) => s <= x0 + 0.5)) : x0,
        x1 <= R + 0.5 ? Math.min(...ends.filter((e) => e >= x1 - 0.5)) : x1,
      ];
      const measure = (el: HTMLElement, fit?: boolean) => {
        if (!fit) return el.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect();
      };

      // collect what's on screen
      const boxes: Box[] = [];
      let order = 0;
      const add = (t: Target, el: HTMLElement, kid: boolean): Box | null => {
        const r = measure(el, t.fit);
        if (!r.width || r.bottom <= 0 || r.top >= vh) return null;
        const [sx0, sx1] = t.area || kid ? [r.left, r.right] : snap(r.left, r.right);
        const b: Box = { t, el, kid, r, sx0, sx1, i: order++, kids: [] };
        boxes.push(b);
        return b;
      };
      for (const t of TARGETS) {
        const el = document.querySelector<HTMLElement>(t.sel);
        if (!el) continue;
        const b = add(t, el, false);
        if (!b) continue;
        targets.push(el);
        b.kids = (t.kids ?? []).flatMap((k) => {
          const n = document.querySelector<HTMLElement>(k.sel);
          const kb = n && add(k, n, true);
          return kb ? [kb] : [];
        });
      }
      if (!boxes.length) return skip();
      targets.forEach((el) => el.classList.add("bp-t"));

      const sheet = make("bp") as HTMLDivElement;
      bp = sheet;
      sheet.setAttribute("aria-hidden", "true");
      sheet.style.setProperty("--gx", px(L));

      // 1. sheet
      sheet.append(make("bp-sheet"));
      sheet.append(make("bp-hatch l", { left: "0", width: px(L) }), make("bp-hatch r", { left: px(R), right: "0" }));
      starts.forEach((s, i) => {
        const c = make("bp-col", { left: px(s), width: px(cw) });
        c.style.setProperty("--i", String(i));
        c.dataset.n = String(i + 1).padStart(2, "0");
        sheet.append(c);
      });
      const top = make("bp-dim bp-dimtop", {
        left: px(L),
        width: px(R - L),
        top: "6px",
      });
      top.append(make("b", {}, `${Math.round(R - L)} · ${cols} col`));
      sheet.append(top);

      // notes sit in the free space either side of the floating nav, only if they fit
      const nav = document.querySelector('[data-bp="nav"]')?.getBoundingClientRect();
      const notes: Array<[HTMLElement, number]> = [
        [make(`bp-note ${hand.className}`, { left: px(L) }, NOTES.left), nav ? nav.left - L - 16 : 0],
        [make(`bp-note r ${hand.className}`, { right: px(vw - R) }, NOTES.right), nav ? R - nav.right - 16 : 0],
      ];
      notes.forEach(([n]) => sheet.append(n));

      // 2. boxes
      for (const b of boxes) {
        const { r, t } = b;
        const n = make(`bp-box${b.kid ? " is-kid" : ""}${t.area ? " is-area" : ""}`, {
          left: px(b.sx0),
          width: px(b.sx1 - b.sx0),
          top: px(r.top),
          height: px(r.height),
        }) as HTMLDivElement;
        b.node = n;
        sheet.append(n);

        if (t.dim) {
          const y = px(r.bottom + 4);
          b.dimEl = make("bp-dim", { top: y });
          b.dimEl.append(make("b"));
          if (r.left - b.sx0 >= 6) {
            b.remL = make("bp-dim is-rem", { top: y });
            b.remL.append(make("b"));
            sheet.append(b.remL);
          }
          if (b.sx1 - r.right >= 6) {
            b.remR = make("bp-dim is-rem", { top: y });
            b.remR.append(make("b"));
            sheet.append(b.remR);
          }
          sheet.append(b.dimEl);
        }
      }

      // vertical rhythm ticks down the hero stack
      const stack = boxes.filter((b) => b.t.stack);
      if (stack.length) {
        const gx = Math.max(4, Math.min(...stack.map((b) => b.sx0)) - 12);
        stack.forEach((b, k) => {
          const next = stack[k + 1];
          const gap = next ? next.r.top - b.r.bottom : 0;
          if (gap < 6) return;
          const g = make("bp-gap", {
            left: px(gx),
            top: px(b.r.bottom),
            height: px(gap),
          });
          g.append(make("b", {}, Math.round(gap)));
          sheet.append(g);
        });
      }

      const paint = (p: number) => {
        for (const b of boxes) {
          const x0 = b.sx0 + (b.r.left - b.sx0) * p;
          const x1 = b.sx1 + (b.r.right - b.sx1) * p;
          const width = x1 - x0;
          b.node!.style.left = px(x0);
          b.node!.style.width = px(width);
          if (b.dimEl) {
            Object.assign(b.dimEl.style, { left: px(x0), width: px(width) });
            b.dimEl.firstChild!.textContent = String(Math.round(width));
          }
          for (const [n, a, z] of [
            [b.remL, b.sx0, x0],
            [b.remR, x1, b.sx1],
          ] as const) {
            if (!n) continue;
            Object.assign(n.style, {
              left: px(a),
              width: px(z - a),
              visibility: z - a > 12 ? "visible" : "hidden",
            });
            n.firstChild!.textContent = String(Math.round(z - a));
          }
        }
      };
      paint(0);
      document.body.append(sheet);
      notes.forEach(([n, room]) => {
        if (n.offsetWidth > room) n.remove();
      });
      void sheet.offsetWidth; // commit the start state before transitions

      /* ---- run --------------------------------------------------------- */
      raf = requestAnimationFrame(() => sheet.classList.add("is-sheet"));
      const boxStep = T.boxSpan / boxes.length;
      boxes.forEach((b) => at(T.box + b.i * boxStep, () => b.node!.classList.add("is-drawn")));

      const settleAt = T.box + T.boxSpan + T.draw;
      at(settleAt - 160, () => sheet.classList.add("is-dims"));
      at(settleAt, () => {
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / T.settle);
          paint(ease(p));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      });

      if (still) return; // hold on the finished sheet; click to ink
      const inkAt = settleAt + T.settle;
      at(inkAt, () => sheet.classList.add("is-inking"));
      const tops = boxes.filter((b) => !b.kid);
      const inkStep = T.inkSpan / tops.length;
      tops.forEach((b, k) =>
        at(inkAt + k * inkStep, () => {
          b.el.classList.add("bp-on");
          b.node!.classList.add("is-out");
          b.kids.forEach((kb) => kb.node!.classList.add("is-out"));
        }),
      );
      const liftAt = inkAt + T.inkSpan;
      at(liftAt, () => sheet.classList.add("is-out"));
      at(liftAt + T.lift, () => {
        done = true;
        cleanup();
      });
    };

    SKIP_EVENTS.forEach((e) => addEventListener(e, skip, { capture: true, passive: true }));

    // Measure once type has settled, but never stall the page. In a background
    // tab, wait until it's actually seen; tabbing away mid-run skips.
    let cancelled = false;
    const visible = new Promise<void>((resolve) => {
      if (!document.hidden) return resolve();
      const v = () => {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", v);
        resolve();
      };
      document.addEventListener("visibilitychange", v);
    });
    const fonts = document.fonts ? document.fonts.ready.then(() => undefined) : Promise.resolve();
    Promise.all([visible, Promise.race([fonts, new Promise((r) => setTimeout(r, 900))])]).then(() => {
      if (cancelled) return;
      document.addEventListener("visibilitychange", onHide);
      raf = requestAnimationFrame(() => (raf = requestAnimationFrame(build)));
    });

    return () => {
      cancelled = true;
      if (bp) {
        // left the page mid-run: show everything, drop the sheet
        done = true;
        timers.forEach(clearTimeout);
        cancelAnimationFrame(raf);
        cleanup();
      } else {
        // unmounted before the sheet was built (dev strict mode remounts at once):
        // stand down, and let the next mount pick the run up, or release the page
        cancelAnimationFrame(raf);
        SKIP_EVENTS.forEach((e) => removeEventListener(e, skip, true));
        w.__bpFailsafe = window.setTimeout(() => root.classList.remove("bp-run"), 150);
      }
      root.classList.remove("bp-done");
    };
  }, []);

  return null;
}
