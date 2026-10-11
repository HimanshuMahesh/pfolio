// 05 — A three-hand wristwatch lying flat on its open steel bracelet.
import { k, G, frame, pen, plinth, topArc } from "./lib.mjs";

const PLATE = { x: -56, y: -98, w: 112, d: 196, r: 6 };
const R_CASE = 20;
const Z0 = 2.2; // caseback sits on a raised bracelet height
const Z_MID = Z0 + 2.6;
const Z_BEZ = Z_MID + 7.2;
const Z_DIAL = Z_BEZ + 0.6;

export function watch() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [0, 0, Z_BEZ + 6], [R_CASE + 8, 0, Z_BEZ]], { azimuth: 28 });
  const { S, L, D, at, poly, fillPath, halo, byDepth } = pen(P);
  const out = [plinth(P, PLATE, { index: "05", label: "front-right" })];
  const items = []; // depth-sorted parts of the bracelet and case
  const put = (point, svg) => items.push({ key: k.depthOf(point, P), svg });

  out.push(halo({ x: -14, y: -92, w: 28, d: 184, r: 10 }, 0, 0.4, 5));
  out.push(halo({ x: -20, y: -20, w: 40, d: 40, r: 20 }, 0, 0.4, 6));

  // ---- Bracelet: three-piece links, polished centre, tapering to the clasp ----
  const PITCH = 7.4;
  const row = (y, half, last) => {
    const d = PITCH - 0.5;
    const centre = { x: -half * 0.36, y, w: half * 0.72, d, r: 1.4 };
    const outerL = { x: -half, y: y + 0.2, w: half * 0.64 - 0.3, d: d - 0.4, r: 1.6 };
    const outerR = { x: half * 0.36 + 0.3, y: y + 0.2, w: half * 0.64 - 0.3, d: d - 0.4, r: 1.6 };
    const svg = [
      S(k.slabOf(outerL, 0, 3.8, P, 4, 0.5), { tone: "mid" }),
      S(k.slabOf(outerR, 0, 3.8, P, 4, 0.5), { tone: "mid" }),
      S(k.slabOf(centre, 0.3, 4.1, P, 4, 0.6), { tone: "hi", crease: "lo" }),
    ];
    // Pin ends on the outer edge.
    svg.push(D([at([half, y + d / 2, 1.9])], { size: 0.5, tone: "lo" }));
    put([0, y + d / 2, 2], svg.join(""));
  };
  // Towards us: six rows, then the folding clasp.
  for (let i = 0; i < 5; i++) row(24 + i * PITCH, 10.4 - i * 0.22, i === 5);
  const CLASP = { x: -8.8, y: 24 + 5 * PITCH, w: 17.6, d: 30, r: 2.4 };
  put([0, CLASP.y + CLASP.d / 2, 2], [
    S(k.slabOf(CLASP, 0, 4.6, P, 6, 0.8), { tone: "hi", crease: "lo", inner: L(k.sideSeam(CLASP, 2.2, P, 6), { tone: "faint" }) }),
    L(k.planOutline(k.insetPlan(CLASP, 2.2), 4.6, P, 6), { tone: "lo" }),
    S(k.slabOf({ x: -5, y: CLASP.y + CLASP.d - 6, w: 10, d: 4, r: 1.6 }, 4.6, 0.8, P, 4), { tone: "mid" }),
    L(k.lineOnTop([-3.4, CLASP.y + 8], [3.4, CLASP.y + 8], 4.6, P), { tone: "faint" }),
    D([at([-6.4, CLASP.y + 2.6, 4.6]), at([6.4, CLASP.y + 2.6, 4.6])], { size: 0.45 }),
  ].join(""));
  // Away from us: seven rows ending on the clasp's receiving end link.
  for (let i = 0; i < 7; i++) row(-24 - (i + 1) * PITCH, 10.4 - i * 0.22, i === 6);
  const END = { x: -8.6, y: -24 - 7 * PITCH - 5.6, w: 16.8, d: 6, r: 1.6 };
  put([0, END.y, 2], S(k.slabOf(END, 0, 3.4, P, 4, 0.5), { tone: "mid" }));

  // End links fitted between the lugs.
  for (const sign of [-1, 1]) {
    const plan = sign > 0 ? { x: -10.6, y: 17.2, w: 21.2, d: 6.8, r: 1.2 } : { x: -10.6, y: -24, w: 21.2, d: 6.8, r: 1.2 };
    put([0, sign * 20, 1.5], S(k.slabOf(plan, 0, 4.4, P, 3, 0.4), { tone: "mid" }));
  }

  // ---- Lugs ------------------------------------------------------------------
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const plan = { x: sx > 0 ? 10.8 : -16.8, y: sy > 0 ? 14.4 : -24.6, w: 6, d: 10.2, r: 2 };
      put([sx * 13.8, sy * 18, 4], S(k.slabOf(plan, 1.2, Z_MID + 3.6 - 1.2, P, 4, 0.5), { tone: "mid" }));
    }
  }

  items.sort((a, b) => a.key - b.key);
  // Bracelet and lugs that sit behind the case first, then the case, then the rest.
  const behind = items.filter((it) => it.key < k.depthOf([0, 6, 2], P));
  const front = items.filter((it) => it.key >= k.depthOf([0, 6, 2], P));
  out.push(...behind.map((it) => it.svg));

  // ---- Case: caseback, middle, bezel ------------------------------------------
  out.push(S(k.cylinder(0, 0, 17.6, 0, Z0, P, 64), { tone: "lo" }));
  out.push(S(k.cylinder(0, 0, R_CASE, Z0, Z_MID - Z0 + 6.6, P, 96, 0.6), { tone: "mid", inner: L(k.sideArc(0, 0, R_CASE, Z0 + 1.4, P, 64), { tone: "faint" }) }));
  const zb = Z_MID + 6.6;
  const BEZ = G.frameOf([0, 0, zb], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(S(G.solidOf([[0, 19.6], [0.6, 19.6], [Z_BEZ - zb, 17.4]], BEZ, P, { steps: 96 }), { tone: "hi", crease: "lo" }));
  out.push(k.fadedSvg(G.ribsOf(BEZ, 0, 0.6, 19.6, 120, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  // Bezel ticks on its sloping top: 60 marks, longer every five, a lit triangle at twelve.
  const tickTop = [];
  for (let i = 0; i < 60; i++) {
    if (i === 0) continue;
    const a = (i / 60) * Math.PI * 2;
    const long = i % 5 === 0;
    const r0 = 19.3, r1 = long ? 17.7 : 18.6;
    const z = (r) => zb + 0.6 + ((19.6 - r) / 2.2) * (Z_BEZ - zb - 0.6);
    tickTop.push(k.pathOf([at([Math.sin(a) * r0, -Math.cos(a) * r0, z(r0)]), at([Math.sin(a) * r1, -Math.cos(a) * r1, z(r1)])]));
  }
  out.push(L(tickTop.join(""), { tone: "lo" }));
  out.push(fillPath([[0, -17.8, Z_BEZ], [-1.2, -19.3, zb + 0.6], [1.2, -19.3, zb + 0.6]], "carry-ink"));

  // ---- Dial -------------------------------------------------------------------
  out.push(fillPath(k.circleRing(0, 0, 17.4, 96).map(([x, y]) => [x, y, Z_BEZ]), "carry-hole"));
  out.push(fillPath(k.circleRing(0, 0, 16.6, 96).map(([x, y]) => [x, y, Z_DIAL]), "carry-face"));
  const track = k.radialTicks(0, 0, 16.2, 60, 5, Z_DIAL, [0.8, 1.4], P);
  out.push(L(track.minor, { tone: "lo" }), L(track.major, { tone: "mid" }));
  out.push(L(k.ring(0, 0, 14.8, Z_DIAL, P, 72), { tone: "faint" }));
  // Applied hour indices: raised bars, a double bar at twelve.
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    const bar = (off) => {
      const ux = Math.sin(a), uy = -Math.cos(a), vx = -uy, vy = ux;
      const r0 = 10.4, r1 = 14.2, w = h % 3 === 0 ? 0.9 : 0.6;
      return [[r0, -w], [r1, -w], [r1, w], [r0, w]].map(([r, t]) => [ux * r + vx * (t + off), uy * r + vy * (t + off)]);
    };
    for (const off of h === 0 ? [-1.3, 1.3] : [0]) out.push(S(k.extrude(bar(off), Z_DIAL, 0.5, P), { tone: "hi", crease: "none" }));
  }
  // Date window at three.
  const DATE = { x: 9.2, y: -1.6, w: 4, d: 3.2, r: 0.4 };
  out.push(fillPath(k.ringOf(DATE, 2).map(([x, y]) => [x, y, Z_DIAL]), "carry-hole"), L(k.planOutline(DATE, Z_DIAL, P, 2), { tone: "mid" }));
  // Hands at 10:09:30 — hour, minute as filled leaves, the second hand lit.
  const hand = (angle, len, w, tail, z) => {
    const ux = Math.sin(angle), uy = -Math.cos(angle), vx = -uy, vy = ux;
    const pts = [[-tail, 0], [0, -w], [len * 0.82, -w * 0.7], [len, 0], [len * 0.82, w * 0.7], [0, w]];
    return S(k.extrude(pts.map(([s, t]) => [ux * s + vx * t, uy * s + vy * t]), z, 0.35, P), { tone: "hi", crease: "none" });
  };
  out.push(hand((10.15 / 12) * Math.PI * 2, 9.6, 1.4, 2.4, Z_DIAL + 0.8));
  out.push(hand((9.5 / 60) * Math.PI * 2, 14, 1.1, 2.8, Z_DIAL + 1.3));
  const sa = (30 / 60) * Math.PI * 2;
  const still = `<path class="iso-line" data-tone="lit" style="stroke-width:1" d="${k.lineOnTop([-Math.sin(sa) * 4, Math.cos(sa) * 4], [Math.sin(sa) * 15.4, -Math.cos(sa) * 15.4], Z_DIAL + 1.9, P)}"/>`;
  // Live: the same hand drawn in the dial's own plane, so a plain rotation there sweeps it round the dial.
  const live = `<g transform="${k.topMatrix([0, 0], Z_DIAL + 1.9, P, "x")}"><g><animateTransform attributeName="transform" type="rotate" from="180 0 0" to="540 0 0" dur="6s" repeatCount="indefinite"/><path class="iso-line" data-tone="lit" style="stroke-width:1" d="M0 4L0 -15.4"/><circle cx="0" cy="-11.6" r="0.9" class="carry-ink" style="fill:var(--anatomy-lit)"/></g></g>`;
  out.push({ still, live });
  out.push(S(k.cylinder(0, 0, 1.1, Z_DIAL + 1.65, 0.5, P, 20), { tone: "hi", lit: true }));
  // Crystal: a rim ring and two glints across the glass.
  out.push(L(k.ring(0, 0, 17.4, Z_BEZ, P, 96), { tone: "mid" }));
  out.push(`<path class="carry-glint" d="${poly(topArc(0, 0, 15.6, Z_BEZ + 0.4, Math.PI * 1.05, Math.PI * 1.4, 14))}"/>`);
  out.push(`<path class="carry-glint" style="opacity:.4" d="${poly(topArc(0, 0, 13.6, Z_BEZ + 0.4, Math.PI * 1.1, Math.PI * 1.3, 8))}"/>`);

  // ---- Crown and guards on the +x side --------------------------------------
  const zc = Z_MID + 3;
  for (const y of [-7.4, 4.6]) out.push(S(k.slabOf({ x: R_CASE - 2.4, y, w: 5, d: 2.8, r: 1.2 }, Z_MID, 6, P, 3, 0.3), { tone: "mid" }));
  const CR = G.frameOf([R_CASE - 0.6, 0, zc], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 2.4, 2.2, CR, P), { tone: "mid" }));
  out.push(S(G.disc(2.4, 5.6, 3.4, CR, P, { steps: 48 }), { tone: "hi", crease: "lo", lit: false }));
  out.push(k.fadedSvg(G.ribsOf(CR, 2.4, 5.6, 3.4, 40, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  out.push(L(G.circleOf(CR, 5.6, 1.6, P), { tone: "faint" }));

  out.push(...front.map((it) => it.svg));

  return {
    width,
    height,
    label: "An isometric drawing of a three-hand wristwatch lying on its open steel link bracelet on a display plinth: ribbed bezel with minute marks, applied hour indices, a date window, a lit second hand and a knurled crown between its guards.",
    body: out,
  };
}
