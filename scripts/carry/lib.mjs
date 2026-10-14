// Shared harness for the carry strip figures: one camera scale for the whole
// set, a site-palette theme baked into each SVG, and the display plinth every
// object stands on.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

export { k, G };

const HERE = dirname(fileURLToPath(import.meta.url));
export const OUT = join(HERE, "../../public/carry");

/** Screen px per world mm (before the kit's own unit factor), shared so the set reads at one scale. */
export const SCALE = 1.35;
export const PAD = 18;

/** A projection at the shared scale whose viewBox is fitted around `points`. */
export function frame(points, { azimuth = 45, elevation = 30, pad = PAD } = {}) {
  const unit = { origin: [0, 0], scale: SCALE, azimuth, elevation };
  const flat = points.map((p) => k.iso(p, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const left = Math.min(...xs) - pad;
  const top = Math.min(...ys) - pad;
  const width = Math.ceil(Math.max(...xs) + pad - left);
  const height = Math.ceil(Math.max(...ys) + pad - top);
  return { P: { origin: [-left, -top], scale: SCALE, azimuth, elevation }, width, height };
}

/** Small drawing helpers bound to one projection. */
export function pen(P) {
  const at = (p) => k.iso(p, P);
  return {
    at,
    S: (paths, style) => k.solidSvg(paths, style),
    L: (d, style) => k.lineSvg(d, style),
    D: (points, style) => k.dotsSvg(points, style),
    /** A closed or open polyline through world points. */
    poly: (points, closed = false) => k.pathOf(points.map(at), closed),
    /** A filled shape through world points, with a custom class. */
    fillPath: (points, cls) => `<path class="${cls}" d="${k.pathOf(points.map(at), true)}"/>`,
    byDepth: (list, of = (p) => p) => [...list].sort((a, b) => k.depthOf(of(a), P) - k.depthOf(of(b), P)),
    halo: (plan, z, h, blur) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur ? ` style="filter:blur(${blur}px)"` : ""}/>`,
  };
}

/** A rounded rectangle lying in a vertical face plane: `axis` "y" means the face at y = c (spanning x, z). */
export function faceRect(axis, c, u0, u1, z0, z1, r, steps = 5) {
  const ring = k.roundedPlan({ x: u0, y: z0, w: u1 - u0, d: z1 - z0, r }, steps);
  return ring.map(([u, z]) => (axis === "y" ? [u, c, z] : [c, u, z]));
}

/** A circle lying in a vertical face plane. */
export function faceCircle(axis, c, u, z, r, steps = 32, from = 0, to = Math.PI * 2) {
  const out = [];
  const closed = to - from >= Math.PI * 2 - 1e-6;
  const n = closed ? steps : steps + 1;
  for (let i = 0; i < n; i++) {
    const t = from + ((to - from) * i) / steps;
    const pu = u + r * Math.cos(t);
    const pz = z + r * Math.sin(t);
    out.push(axis === "y" ? [pu, c, pz] : [c, pu, pz]);
  }
  return out;
}

/** Arc points on a horizontal plane. */
export function topArc(cx, cy, r, z, from, to, steps = 24) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = from + ((to - from) * i) / steps;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t), z];
  });
}

/**
 * The display plinth: a bevelled plate on four feet, a groove, corner screws
 * and a label plate engraved with the figure's index.
 */
export function plinth(P, plate, { index, h = 5, label = "front-right" } = {}) {
  const { S, L, D, at, byDepth, halo } = pen(P);
  const FOOT = 3;
  const out = [halo(plate, -h - FOOT, h)];
  for (const [x, y] of byDepth(k.corners(plate, 14), ([x, y]) => [x, y, 0])) {
    out.push(S(k.cylinder(x, y, 5, -h - FOOT, 1, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 3.8, -h - FOOT + 1, FOOT - 1, P, 24), { tone: "lo" }));
  }
  out.push(S(k.slabOf(plate, -h, h, P, 8, 1.2), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 4), 0, P), { tone: "faint" }));
  const screws = k.corners(plate, 8);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.6, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.45 }));
  // Label plate in the near corner, three rule lines standing for print and the index engraved.
  const lp = label === "front-right"
    ? { x: plate.x + plate.w - 40, y: plate.y + plate.d - 15, w: 30, d: 9, r: 1 }
    : { x: plate.x + 10, y: plate.y + plate.d - 15, w: 30, d: 9, r: 1 };
  out.push(S(k.slabOf(lp, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(lp, 1.2), 0.6, P, 3), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([lp.x + 3, lp.y + 6.2], 0.6, P, "x"), index, { size: 4.2, tone: "mid" }));
  out.push(L(k.lineOnTop([lp.x + 12, lp.y + 3.2], [lp.x + 26, lp.y + 3.2], 0.6, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([lp.x + 12, lp.y + 5], [lp.x + 23, lp.y + 5], 0.6, P), { tone: "lo", free: true }));
  out.push(L(k.lineOnTop([lp.x + 12, lp.y + 6.8], [lp.x + 19, lp.y + 6.8], 0.6, P), { tone: "lo", free: true }));
  return out.join("");
}

// Site palette (styles/tokens.css): paper is the page background the strip sits on.
const THEMES = {
  dark: `--anatomy-paper:#0a0a0b;--anatomy-face:#1d1d20;--anatomy-top:#202023;
    --anatomy-shade-0:#0f0f11;--anatomy-shade-1:#141416;--anatomy-shade-2:#19191b;--anatomy-shade-3:#1e1e21;
    --anatomy-lit-top:#2a2a2e;--anatomy-lit-shade:#222226;
    --anatomy-hi:#e4e4de;--anatomy-mid:#85857f;--anatomy-lo:#4c4c48;--anatomy-faint:#303033;--anatomy-lit:#ffffff;
    --anatomy-halo:#000;--anatomy-halo-opacity:.85;--anatomy-dot:#e8e8e2;
    --carry-glass:#030304;--carry-glass-2:#16171c;--carry-glint:#9fb6ff;--carry-live:#7ea6ff;--anatomy-weight:.7px;`,
  light: `--anatomy-paper:#f5f4f0;--anatomy-face:#ffffff;--anatomy-top:#fdfdfb;
    --anatomy-shade-0:#d9d8d1;--anatomy-shade-1:#e2e1db;--anatomy-shade-2:#eae9e4;--anatomy-shade-3:#f1f0eb;
    --anatomy-lit-top:#ffffff;--anatomy-lit-shade:#ecebe6;
    --anatomy-hi:#222220;--anatomy-mid:#8a8983;--anatomy-lo:#b5b4ad;--anatomy-faint:#d5d4cd;--anatomy-lit:#000000;
    --anatomy-halo:#7d7c72;--anatomy-halo-opacity:.3;--anatomy-dot:#38382f;
    --carry-glass:#1c1d21;--carry-glass-2:#33363e;--carry-glint:#e9eeff;--carry-live:#2f5fe0;--anatomy-weight:.7px;`,
};

// Only the drawing rules of ISO_CSS: the plate, legend and stage rules don't apply to a bare SVG.
const DRAW_CSS = k.ISO_CSS.replace(/\s+/g, " ")
  .split("}")
  .filter((rule) => /\.(iso-svg|iso-fill|iso-shade|iso-top|iso-solid|iso-halo|iso-line|iso-dots|iso-face-text|tb-)/.test(rule) && !/iso-(plate|stage|figure|legend|key|swatch|caption)/.test(rule) && !/@|animation/.test(rule))
  .map((rule) => rule.trim() + "}")
  .join("");

const EXTRA_CSS = `.carry-glass{fill:var(--carry-glass);stroke:none}.carry-glass-2{fill:var(--carry-glass-2);stroke:none}
.carry-glint{fill:none;stroke:var(--carry-glint);stroke-width:.8;stroke-linecap:round;opacity:.75}
.carry-hole{fill:var(--anatomy-shade-0);stroke:none}.carry-face{fill:var(--anatomy-face);stroke:none}
.carry-ink{fill:var(--anatomy-hi);stroke:none}.carry-mid{fill:var(--anatomy-mid);stroke:none}
.iso-face-text{font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace}`;

/**
 * Writes four files per figure: still and live, each in dark and light. Body
 * entries are markup strings, or `{ still, live }` pairs for parts that the
 * live drawing replaces or adds (`still` may be ""). `css` holds the live
 * drawing's keyframes; it only ships in the live files. `dir` is where the
 * files go (the carry folder by default) and `themes` adds CSS per theme, such
 * as accent palettes for tinted parts.
 */
export function write(name, { width, height, label, body, css = "" }, { dir = OUT, themes = {} } = {}) {
  mkdirSync(dir, { recursive: true });
  for (const mode of ["still", "live"]) {
    const markup = body.map((part) => (typeof part === "string" ? part : part[mode] ?? "")).join("");
    const motion = mode === "live" ? `${LIVE_CSS}${css}` : "";
    for (const theme of ["dark", "light"]) {
      const file = `${name}-${theme}${mode === "live" ? "-live" : ""}.svg`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${label.replace(/"/g, "&quot;")}"><style>.iso{${THEMES[theme].replace(/s+/g, "")}}${DRAW_CSS}${EXTRA_CSS}${themes[theme] ?? ""}${motion}</style>${markup}</svg>`;
      writeFileSync(join(dir, file), svg);
      console.log(`wrote ${file}  ${(svg.length / 1024).toFixed(1)} KB`);
    }
  }
  return { name, width, height, label };
}

/** Shared pieces for the live drawings. */
const LIVE_CSS = `.live-glow{fill:var(--carry-glint);stroke:none;opacity:0}
.live-ring{fill:none;stroke:var(--carry-live);stroke-width:.9;opacity:0;transform-box:fill-box;transform-origin:center}
.live-press{transform-box:fill-box}`;
