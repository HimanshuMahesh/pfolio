import { clamp, mod } from "./math";
import { SkyRenderer } from "./renderer";
import {
  MINUTES_PER_DAY,
  dateAtMinutes,
  formatClock,
  minutesNow,
  parseClock,
  phaseName,
  solarNoon,
  sunAt,
  type Sun,
} from "./solar";

/* Drives the hero sky: the animation loop, the time readout, and scrubbing.

   Hover the sky to scrub through the day (edges of the grid = midnight,
   centre = solar noon); leave and it eases back to now. Touch: drag
   sideways. Keyboard: the readout is a slider (arrows, shift for hours,
   Escape/Home for now). `?sky=HH:MM` pins the time, for previews.

   The readout is written straight to the DOM from the loop: it can change
   every frame while scrubbing, and none of it is React state. */

export type SkyElements = {
  /** Positioned ancestor the sky is measured from. */
  shell: HTMLElement;
  sky: HTMLElement;
  canvas: HTMLCanvasElement;
  scrub: HTMLElement;
  /** The pill at the foot of the scrub line (measured to keep it on the grid)… */
  scrubLabel: HTMLElement;
  /** …holding a sun / moon glyph and the time text. */
  scrubGlyph: HTMLElement;
  scrubText: HTMLElement;
  /** Its content box is the scrub range. */
  bounds: HTMLElement;
  /** The sky ends at this element's vertical centre — the horizon runs through the portrait. */
  horizon: HTMLElement;
  /** The open band above the horizon; the scrub label lands on its centre line. */
  band: HTMLElement;
  time: HTMLElement;
  phase: HTMLElement;
  slider: HTMLElement;
  hint: HTMLElement | null;
};

const FEATHER = 6; // px — the sky's hairline merge into the page (matches the CSS mask)
const FOLLOW_MS = 180; // easing while scrubbing…
const SETTLE_MS = 600; // …and, slower, when returning to now
const MAX_FRAME_MS = 64;
const TOUCH_SLOP = 8;
const TOUCH_RELEASE_MS = 900;
const KEY_STEP = 15;
const KEY_STEP_LARGE = 60;
const WAKE_INTERVAL_MS = 30_000; // keeps a reduced-motion sky in step with the clock
const HINT_SEEN_KEY = "sky-used";

export function createSky(el: SkyElements): () => void {
  const renderer = new SkyRenderer(el.canvas);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forced = parseClock(new URLSearchParams(window.location.search).get("sky"));
  const liveMinutes = () => forced ?? minutesNow();

  let display = liveMinutes();
  let target: number | null = null;
  let lastReadout = "";
  let raf = 0;
  let last = performance.now();
  let visible = true;

  /* ---- readout ----------------------------------------------------------- */
  function updateReadout(minutes: number, sun: Sun) {
    const phase = phaseName(sun);
    const text = formatClock(minutes);
    const glyph = sun.alt > -0.8 ? "sun" : "moon";
    if (el.scrubGlyph.dataset.kind !== glyph) el.scrubGlyph.dataset.kind = glyph;
    if (text + phase === lastReadout) return;
    lastReadout = text + phase;
    el.time.textContent = text;
    if (el.phase.textContent !== phase) {
      el.phase.textContent = phase;
      el.phase.animate?.(
        [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
        { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    }
    el.scrubText.textContent = `${text} · ${phase}`;
    el.slider.setAttribute("aria-valuenow", String(Math.round(mod(minutes, MINUTES_PER_DAY))));
    el.slider.setAttribute("aria-valuetext", `${text}, ${phase.toLowerCase()} in Bengaluru`);
  }

  /* ---- loop -------------------------------------------------------------- */
  const shortestDiff = (from: number, to: number) => mod(to - from + 720, MINUTES_PER_DAY) - 720;

  function frame(now: number) {
    const dt = Math.min(now - last, MAX_FRAME_MS);
    last = now;
    const goal = target ?? liveMinutes();
    const diff = shortestDiff(display, goal);
    const tau = target === null ? SETTLE_MS : FOLLOW_MS;
    display = reduce.matches || Math.abs(diff) < 0.02 ? goal : display + diff * (1 - Math.exp(-dt / tau));

    const sun = sunAt(dateAtMinutes(display));
    renderer.render(sun, now, dt, !reduce.matches);
    updateReadout(display, sun);

    const settling = Math.abs(shortestDiff(display, goal)) > 0.02;
    raf = visible && (settling || !reduce.matches) ? requestAnimationFrame(frame) : 0;
  }

  const kick = () => {
    if (raf || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  /* ---- sizing: the horizon runs through the portrait ------------------------ */
  // offsetTop ignores transforms, so the portrait's reveal animation doesn't move the horizon.
  const topWithin = (node: HTMLElement) => {
    let y = 0;
    for (let n: HTMLElement | null = node; n && n !== el.shell; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    return y;
  };

  function fit() {
    const y = topWithin(el.horizon);
    const skyH = Math.round(y + el.horizon.offsetHeight / 2 + FEATHER / 2);
    el.sky.style.setProperty("--sky-h", `${skyH}px`);
    // the scrub line ends, and its label sits, on the band's centre line
    const bandMid = topWithin(el.band) + el.band.offsetHeight / 2;
    el.sky.style.setProperty("--scrub-end", `${Math.round(skyH - bandMid)}px`);
  }

  function resize() {
    renderer.resize(el.sky.clientWidth, el.sky.clientHeight);
    const sun = sunAt(dateAtMinutes(display));
    renderer.render(sun, performance.now(), 0, !reduce.matches);
    updateReadout(display, sun);
  }

  /* ---- scrubbing ----------------------------------------------------------- */
  let hintDismissed = false;
  const dismissHint = () => {
    if (hintDismissed) return;
    hintDismissed = true;
    el.hint?.setAttribute("data-gone", "");
    try {
      sessionStorage.setItem(HINT_SEEN_KEY, "1");
    } catch {}
  };
  try {
    if (sessionStorage.getItem(HINT_SEEN_KEY)) dismissHint();
  } catch {}

  const range = () => {
    const r = el.bounds.getBoundingClientRect();
    const cs = getComputedStyle(el.bounds);
    return { l: r.left + parseFloat(cs.paddingLeft), r: r.right - parseFloat(cs.paddingRight) };
  };

  function scrubTo(clientX: number) {
    const b = range();
    const x = clamp(clientX, b.l, b.r);
    const half = el.scrubLabel.offsetWidth / 2;
    target = mod(solarNoon(liveMinutes()) + ((x - b.l) / (b.r - b.l) - 0.5) * MINUTES_PER_DAY, MINUTES_PER_DAY);
    el.scrub.style.setProperty("--x", `${x}px`);
    el.scrub.style.setProperty("--shift", `${clamp(x, b.l + half, b.r - half) - x}px`); // label never leaves the grid
    el.scrub.setAttribute("data-on", "");
    dismissHint();
    kick();
  }

  function release() {
    target = null;
    el.scrub.removeAttribute("data-on");
    kick();
  }

  const inSky = (e: PointerEvent) => {
    if (document.documentElement.hasAttribute("data-theme-transition")) return false;
    const r = el.sky.getBoundingClientRect();
    const t = e.target as Element | null;
    return e.clientY >= r.top && e.clientY <= r.bottom && !t?.closest("header, a, button, [role=slider]");
  };

  const onMouseMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (inSky(e)) {
      scrubTo(e.clientX);
      const r = el.sky.getBoundingClientRect();
      Object.assign(renderer.pointer, { x: e.clientX - r.left, y: e.clientY - r.top, on: true });
    } else {
      renderer.pointer.on = false;
      if (target !== null && document.activeElement !== el.slider) release();
    }
  };
  const onPageLeave = () => {
    renderer.pointer.on = false;
    if (target !== null) release();
  };

  let touch: { x: number; y: number; on: boolean } | null = null;
  const onTouchStart = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && inSky(e)) touch = { x: e.clientX, y: e.clientY, on: false };
  };
  const onTouchMove = (e: PointerEvent) => {
    if (!touch || e.pointerType === "mouse") return;
    const dx = e.clientX - touch.x;
    const dy = e.clientY - touch.y;
    if (!touch.on && Math.abs(dx) > TOUCH_SLOP && Math.abs(dx) > Math.abs(dy)) touch.on = true;
    if (touch.on) scrubTo(e.clientX);
  };
  let releaseTimer = 0;
  const onTouchEnd = () => {
    if (touch?.on) releaseTimer = window.setTimeout(release, TOUCH_RELEASE_MS);
    touch = null;
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const base = target ?? display;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") target = mod(base + step, MINUTES_PER_DAY);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") target = mod(base - step, MINUTES_PER_DAY);
    else if (e.key === "Escape" || e.key === "Home") target = null;
    else return;
    e.preventDefault();
    kick();
  };
  const onSliderClick = () => {
    target = null;
    kick();
  };
  const onSliderBlur = () => {
    if (target !== null) release();
  };

  /* ---- wiring -------------------------------------------------------------- */
  const onVisibility = () => {
    visible = !document.hidden;
    kick();
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting && !document.hidden;
    kick();
  });
  const skyObserver = new ResizeObserver(resize);
  const layoutObserver = new ResizeObserver(fit);
  const wake = window.setInterval(kick, WAKE_INTERVAL_MS);

  io.observe(el.sky);
  skyObserver.observe(el.sky);
  layoutObserver.observe(el.bounds);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pointermove", onMouseMove, { passive: true });
  window.addEventListener("pointerdown", onTouchStart, { passive: true });
  window.addEventListener("pointermove", onTouchMove, { passive: true });
  window.addEventListener("pointerup", onTouchEnd);
  window.addEventListener("pointercancel", onTouchEnd);
  document.documentElement.addEventListener("pointerleave", onPageLeave);
  el.slider.addEventListener("keydown", onKey);
  el.slider.addEventListener("click", onSliderClick);
  el.slider.addEventListener("blur", onSliderBlur);

  fit();
  document.fonts?.ready.then(fit);
  kick();

  return () => {
    cancelAnimationFrame(raf);
    window.clearInterval(wake);
    window.clearTimeout(releaseTimer);
    io.disconnect();
    skyObserver.disconnect();
    layoutObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onMouseMove);
    window.removeEventListener("pointerdown", onTouchStart);
    window.removeEventListener("pointermove", onTouchMove);
    window.removeEventListener("pointerup", onTouchEnd);
    window.removeEventListener("pointercancel", onTouchEnd);
    document.documentElement.removeEventListener("pointerleave", onPageLeave);
    el.slider.removeEventListener("keydown", onKey);
    el.slider.removeEventListener("click", onSliderClick);
    el.slider.removeEventListener("blur", onSliderBlur);
  };
}
