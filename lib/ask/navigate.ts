/**
 * Moves the page to a section for Hima, politely: never while the reader is
 * scrolling or reading, never off the current page, and any wheel, touch or
 * key from the reader cancels it on the spot. See docs/hima-ai-plan.md §2, §8.2.
 */
import type { Source } from "./protocol";

/** The reader touched the page this recently (ms): leave the page where it is. */
const QUIET_MS = 3000;
let lastInput = -1e9;
let cancel: (() => void) | null = null;

/** Watch for the reader's own input on the page (outside Hima's panel). */
export function watchReader(panel: () => HTMLElement | null): () => void {
  const mark = (e: Event) => {
    const p = panel();
    if (p && e.target instanceof Node && p.contains(e.target)) return;
    lastInput = performance.now();
    cancel?.();
  };
  const opts = { passive: true, capture: true } as const;
  const types = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
  types.forEach((t) => window.addEventListener(t, mark, opts));
  return () => types.forEach((t) => window.removeEventListener(t, mark, opts));
}

/** The element for a source on this page, if it's here. */
export function find(source: Source): HTMLElement | null {
  if (source.route !== location.pathname || !source.anchor) return null;
  return document.getElementById(source.anchor);
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Scrolls `el` under the nav. Resolves true if the page moved or was already
 * there, false if Hima held back. `asked` means the reader tapped a chip, so
 * the quiet-period rule doesn't apply.
 */
export function goTo(el: HTMLElement, { asked = false } = {}): Promise<boolean> {
  if (!asked && performance.now() - lastInput < QUIET_MS) return Promise.resolve(false);

  const r = el.getBoundingClientRect();
  const vh = innerHeight;
  // Already mostly in view: no need to move
  const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
  if (visible >= Math.min(r.height, vh) * 0.6) return Promise.resolve(true);

  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const from = scrollY;
  const max = document.documentElement.scrollHeight - vh;
  const to = Math.max(0, Math.min(max, from + r.top - pad));
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scrollTo({ top: to, behavior: "instant" });
    return Promise.resolve(true);
  }

  cancel?.();
  const dist = Math.abs(to - from);
  const dur = Math.max(450, Math.min(1100, 250 + dist * 0.35));
  return new Promise((resolve) => {
    const t0 = performance.now();
    let raf = 0;
    const html = document.documentElement;
    // The site sets scroll-behavior: smooth; the tween drives every frame itself
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    const end = (moved: boolean) => {
      cancelAnimationFrame(raf);
      html.style.scrollBehavior = prev;
      cancel = null;
      resolve(moved);
    };
    cancel = () => end(false);
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      scrollTo(0, from + (to - from) * ease(t));
      if (t < 1) raf = requestAnimationFrame(frame);
      else end(true);
    };
    raf = requestAnimationFrame(frame);
  });
}
