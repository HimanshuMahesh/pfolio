/**
 * Slightly hand-drawn SVG paths. The shapes stay true (boxes are boxes,
 * arrows land where they point); only the stroke wavers, like a steady pen:
 * edges bow a hair off straight and run a little past each corner.
 *
 * Everything is seeded, so server and client draw the exact same wobble.
 */

/** A seeded PRNG (mulberry32) returning floats in [0, 1). */
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable numeric seed from any string, e.g. a node's label. */
export function seedOf(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}

type Rand = () => number;
const f = (n: number) => Math.round(n * 10) / 10;
/** Uniform in [-1, 1). */
const j = (r: Rand) => r() * 2 - 1;

/**
 * One pen stroke from (x1, y1) to (x2, y2). `over` is how far it may run
 * past each end; `bow` scales how far the middle drifts off the line.
 * `exact` pins both ends (for arrows, which must land where they point).
 */
export function line(
  x1: number, y1: number, x2: number, y2: number, r: Rand,
  { over = 2.2, bow = 1, exact = false }: { over?: number; bow?: number; exact?: boolean } = {},
) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const nx = -uy;
  const ny = ux;
  const o1 = exact ? 0 : over * (0.35 + r() * 0.65);
  const o2 = exact ? 0 : over * (0.35 + r() * 0.65);
  const s1 = exact ? 0 : j(r) * 0.7;
  const s2 = exact ? 0 : j(r) * 0.7;
  const sx = x1 - ux * o1 + nx * s1;
  const sy = y1 - uy * o1 + ny * s1;
  const ex = x2 + ux * o2 + nx * s2;
  const ey = y2 + uy * o2 + ny * s2;
  const b = Math.min(len * 0.014, 3) * bow * j(r);
  const at = 0.4 + r() * 0.2;
  const mx = x1 + (x2 - x1) * at + nx * b * 2;
  const my = y1 + (y2 - y1) * at + ny * b * 2;
  return `M${f(sx)} ${f(sy)}Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`;
}

/** A box drawn as four separate strokes that cross at the corners. */
export function rect(x: number, y: number, w: number, h: number, r: Rand) {
  return [
    line(x, y, x + w, y, r),
    line(x + w, y, x + w, y + h, r),
    line(x + w, y + h, x, y + h, r),
    line(x, y + h, x, y, r),
  ].join("");
}

/** A diamond (rhombus) through four points: left, top, right, bottom. */
export function diamond(cx: number, cy: number, rx: number, ry: number, r: Rand) {
  const p = [
    [cx - rx, cy],
    [cx, cy - ry],
    [cx + rx, cy],
    [cx, cy + ry],
  ];
  return p.map((a, i) => {
    const b = p[(i + 1) % 4];
    return line(a[0], a[1], b[0], b[1], r, { over: 3 });
  }).join("");
}

/**
 * An ellipse drawn in one go, a touch over a full turn so the ends overlap
 * the way a quick pen circle does. `from`/`to` (radians) draw an arc instead.
 */
export function ellipse(
  cx: number, cy: number, rx: number, ry: number, r: Rand,
  { from = 0, to, wobble = 0.018 }: { from?: number; to?: number; wobble?: number } = {},
) {
  const start = from + (to === undefined ? r() * Math.PI * 2 : 0);
  const sweep = to === undefined ? Math.PI * 2 + 0.35 + r() * 0.2 : to - from;
  const steps = Math.max(12, Math.round(Math.abs(sweep) * 8));
  const k = 1 + j(r) * wobble;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = start + (sweep * i) / steps;
    // radius drifts slowly across the stroke (hand pressure), never jitters
    const drift = 1 + Math.sin(t * 1.5 + k * 3) * wobble;
    const x = cx + Math.cos(t) * rx * drift * (i === 0 ? k : 1);
    const y = cy + Math.sin(t) * ry * drift;
    d += `${i ? "L" : "M"}${f(x)} ${f(y)}`;
  }
  return d;
}

/** An open arrowhead landing on (tx, ty), travelling at angle `a`. */
function headAt(tx: number, ty: number, a: number, r: Rand, size: number) {
  const spread = 0.46 + j(r) * 0.05;
  const h1 = [tx - Math.cos(a - spread) * size, ty - Math.sin(a - spread) * size];
  const h2 = [tx - Math.cos(a + spread) * (size + j(r)), ty - Math.sin(a + spread) * (size + j(r))];
  return `M${f(h1[0])} ${f(h1[1])}L${f(tx)} ${f(ty)}L${f(h2[0])} ${f(h2[1])}`;
}

/** A single curved stroke from p0 to p1, bent toward control point c, with a head. */
export function curve(
  p0: [number, number], c: [number, number], p1: [number, number], r: Rand,
  { head = 7 }: { head?: number } = {},
) {
  const cx = c[0] + j(r) * 3;
  const cy = c[1] + j(r) * 3;
  const body = `M${f(p0[0])} ${f(p0[1])}Q${f(cx)} ${f(cy)} ${f(p1[0])} ${f(p1[1])}`;
  return { body, head: head ? headAt(p1[0], p1[1], Math.atan2(p1[1] - cy, p1[0] - cx), r, head) : "" };
}

/**
 * A path through `pts`, each leg a pen stroke that lands exactly on its
 * corner, with an open arrowhead at the end. Returns the body and head
 * separately so the body can be dashed and the head never is.
 */
export function arrow(pts: Array<[number, number]>, r: Rand, { head = 7 }: { head?: number } = {}) {
  let body = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    body += line(x1, y1, x2, y2, r, { exact: true, bow: 0.8 });
  }
  const [px, py] = pts[pts.length - 2];
  const [tx, ty] = pts[pts.length - 1];
  return { body, head: head ? headAt(tx, ty, Math.atan2(ty - py, tx - px), r, head) : "" };
}
