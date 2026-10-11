/* Light / dark theme. The palette lives in styles/tokens.css, keyed on
   `data-theme` on <html>. Dark is the designed default; a visitor's choice
   is remembered in localStorage. */

export type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

/** Browser chrome colour per theme (matches --color-bg). */
export const THEME_COLOR: Record<Theme, string> = { dark: "#0a0a0b", light: "#f5f4f0" };

/**
 * Inlined in <head> so the saved theme applies before first paint, with no
 * flash of the wrong palette.
 */
export const themeBootScript = `(function(){var t="dark";try{var s=localStorage.getItem("${STORAGE_KEY}");if(s==="light"||s==="dark")t=s}catch(e){}document.documentElement.setAttribute("data-theme",t)})()`;

/* ---- Client-side store --------------------------------------------------- */

const listeners = new Set<() => void>();

export function getTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function syncThemeColor(theme: Theme = getTheme()) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
}

function commit(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  root.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  syncThemeColor(theme);
  // Flush styles while transitions are off, then turn them back on.
  void window.getComputedStyle(document.body).color;
  requestAnimationFrame(() => root.removeAttribute("data-theme-switching"));
  listeners.forEach((l) => l());
}

/**
 * Switch theme. Given an origin element, the new palette spreads out from it
 * as a circle (View Transitions API); elsewhere, or with reduced motion, it
 * switches instantly.
 */
export function setTheme(theme: Theme, origin?: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!origin || reduce || !document.startViewTransition) return commit(theme);

  const r = origin.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  // While the reveal plays, pointer events land on the transition overlay; flag it so
  // other pointer-driven UI (the sky scrubber) can ignore them.
  const root = document.documentElement;
  root.setAttribute("data-theme-transition", "");
  const transition = document.startViewTransition(() => commit(theme));
  transition.finished.finally(() => root.removeAttribute("data-theme-transition")).catch(() => {});
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}
