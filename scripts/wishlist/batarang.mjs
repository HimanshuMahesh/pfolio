// 02 — An Arkham Knight batarang lying on two display pegs.
import { k, G, frame, pen, plinth } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -104, y: -38, w: 208, d: 76, r: 6 };
const K = 1.2; // the blade's scale against its drawn outline
const Z = 7; // underside of the blade, on its pegs
const H = 2.6; // blade thickness

/** A cubic Bézier through four floor points, sampled. */
function cubic(a, b, c, d, steps = 16) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, u = 1 - t;
    return [0, 1].map((j) => u * u * u * a[j] + 3 * u * u * t * b[j] + 3 * u * t * t * c[j] + t * t * t * d[j]);
  });
}

/** The right wing, from the centre top round the tip and back along the scalloped trailing edge. */
function wing() {
  const lead = [[0, -8], [3, -8], [4.6, -13.4], [7.4, -9.6], ...cubic([11, -9.4], [36, -7.4], [62, -12], [82, -31]).slice(0)];
  const trail = [
    ...cubic([82, -31], [77, -11], [64, 4], [45, 7]).slice(1),
    ...cubic([45, 7], [40, 1.4], [33, 1.4], [29, 6.4]).slice(1),
    ...cubic([29, 6.4], [24, 2.6], [18, 3.6], [14, 9.6]).slice(1),
    [7, 10.6], [0, 10.6],
  ];
  return { lead, trail };
}

export function batarang() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [0, 0, Z + H + 4]], { azimuth: 40 });
  const { S, L, D, at, fillPath, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "02" })];
  const steel = (markup) => tint("steel", markup);

  const { lead, trail } = wing();
  const right = [...lead, ...trail].map(([x, y]) => [x * K, y * K]);
  const mirror = (pts) => pts.map(([x, y]) => [-x, y]);
  // One closed outline: right wing clockwise, then the left wing back to the start.
  const outline = [...right, ...mirror(right).reverse()];

  out.push(halo({ x: -72, y: -14, w: 144, d: 26, r: 12 }, 0, 0.4, 7));

  // Pegs: a turned post under each wing.
  for (const x of [-46, 46]) {
    const F = G.frameOf([x, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    out.push(S(G.disc(0, 1.4, 6, F, P), { tone: "lo" }));
    out.push(S(G.solidOf([[1.4, 2.8], [Z - 0.6, 2.2], [Z, 3.4]], F, P), { tone: "mid" }));
  }

  // The blade.
  out.push(steel(S(k.extrude(outline, Z, H, P, { convex: false, bevel: 0.6 }), { tone: "hi", crease: "lo" })));
  const top = Z + H;
  // The sharpened leading edges: a bevel line just inside each, lit.
  const edge = (pts) => pts.slice(4).map(([x, y]) => [x * K * 0.985, (y + 1.4) * K]);
  const bevels = [edge(lead), mirror(edge(lead))].map((pts) => k.onTop(pts, top, P));
  out.push(steel(bevels.map((d) => L(d, { tone: "mid" })).join("")));

  // Holes through the wings, and the hub.
  for (const side of [-1, 1]) {
    for (const [x, y, r] of [[17, 0.6, 2.2], [24, -2.2, 2], [31, -1.6, 1.8], [38, -3.2, 1.5], [21, 6, 1.6]].map(([x, y, r]) => [x * K, y * K, r * K])) {
      const ring = k.circleRing(side * x, y, r, 20);
      out.push(fillPath(ring.map(([px, py]) => [px, py, top]), "carry-hole"));
      out.push(steel(L(k.ring(side * x, y, r, top, P, 20), { tone: "lo" })));
    }
  }
  const HUB = G.frameOf([0, 1, top], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(steel(S(G.disc(0, 1.2, 8.4, HUB, P), { tone: "hi", crease: "lo" })));
  out.push(steel(S(G.disc(1.2, 2, 5.6, HUB, P), { tone: "hi", crease: "lo" })));
  out.push(steel(L(G.circleOf(HUB, 2, 3.4, P), { tone: "lo" })));
  out.push(D([at([0, 1, top + 2])], { size: 0.6, tone: "hi" }));

  // Live: a glint runs out along each leading edge and off the tip.
  const glint = bevels.map((d) => `<path class="iso-line bt-glint" data-tone="lit" pathLength="100" d="${d}"/>`).join("");
  out.push({ live: glint });

  return {
    width,
    height,
    label: "An isometric drawing of an Arkham Knight batarang lying on two turned display pegs: a gunmetal bat-wing blade with sharpened leading edges, five holes through each wing and a raised centre hub.",
    body: out,
    css: `@keyframes bt-glint{0%{stroke-dashoffset:110}55%,100%{stroke-dashoffset:-30}}
.bt-glint{stroke-width:1.2;stroke-dasharray:18 200;animation:bt-glint 2.8s cubic-bezier(.5,0,.3,1) infinite}`,
  };
}
