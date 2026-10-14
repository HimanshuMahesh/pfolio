// 06 — Doraemon's Anywhere Door, standing open on its base.
import { k, G, frame, pen, plinth } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -52, y: -22, w: 104, d: 84, r: 6 };
const IN = 25; // half the opening's width
const POST = 6; // post width
const Z0 = 6; // top of the base, foot of the opening
const Z1 = 104; // head of the opening
const D = 5; // half the frame's depth
const OPEN = (104 * Math.PI) / 180; // the leaf's direction from its hinge on the left post: swung toward us

export function door() {
  const leafDir = [Math.cos(OPEN), Math.sin(OPEN)];
  const hinge = [-IN, D];
  const tip = [hinge[0] + leafDir[0] * 2 * IN, hinge[1] + leafDir[1] * 2 * IN];
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [-IN - POST - 5, -D - 4, Z1 + 14], [IN + POST + 5, D + 4, Z1 + 14], [tip[0], tip[1], Z1], [tip[0], tip[1], Z0]], { azimuth: 38 });
  const { S, L, at, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "06" })];
  const pink = (markup) => tint("pink", markup);

  out.push(halo({ x: -IN - POST, y: -D, w: 2 * (IN + POST), d: 2 * D + 30, r: 6 }, 0, 0.6, 7));

  // ---- Live: somewhere else, seen through the opening -------------------------------
  // Drawn on the frame's back plane, so the posts and head always cover its edges.
  const back = -D;
  const onBack = (pts) => k.pathOf(pts.map(([x, z]) => at([x, back, z])), true);
  const sky = onBack([[-IN, Z0], [IN, Z0], [IN, Z1], [-IN, Z1]]);
  const mountain = onBack([[-IN, Z0 + 18], [-14, Z0 + 26], [-4, Z0 + 44], [4, Z0 + 45], [13, Z0 + 30], [IN, Z0 + 22], [IN, Z0], [-IN, Z0]]);
  const snow = onBack([[-7.2, Z0 + 38], [-4, Z0 + 44], [4, Z0 + 45], [8.6, Z0 + 38], [5, Z0 + 40], [1, Z0 + 37.6], [-3, Z0 + 40]]);
  const sun = onBack(Array.from({ length: 24 }, (_, i) => [12 + 6 * Math.cos((i / 24) * Math.PI * 2), Z0 + 66 + 6 * Math.sin((i / 24) * Math.PI * 2)]));
  out.push({ live: `<g class="dr-view"><path fill="#bfe3ff" d="${sky}"/><path fill="#ffc86b" d="${sun}"/><path fill="#5b6f9c" d="${mountain}"/><path fill="#ffffff" d="${snow}"/></g>` });

  // ---- Base: a plinth with curled feet ---------------------------------------------------
  for (const sx of [-1, 1]) {
    const foot = { x: sx > 0 ? IN + POST - 8 : -IN - POST - 2, y: -D - 3, w: 10, d: 2 * D + 6, r: 2.4 };
    out.push(pink(S(k.slabOf(foot, 0, 2.4, P, 4), { tone: "hi" })));
  }
  const BASE = { x: -IN - POST - 3, y: -D - 2, w: 2 * (IN + POST + 3), d: 2 * D + 4, r: 2 };
  out.push(pink(S(k.slabOf(BASE, 2.4, Z0 - 2.4, P, 4, 0.5), { tone: "hi" })));

  // ---- Frame: posts, head and the cornice -------------------------------------------------
  const post = (x) => ({ x, y: -D, w: POST, d: 2 * D, r: 1 });
  out.push(pink(S(k.slabOf(post(-IN - POST), Z0, Z1 - Z0, P, 3, 0.4), { tone: "hi" })));
  // The stop bead inside the opening, a lighter strip along the posts and head.
  out.push(pink(L(k.pathOf([[-IN, 1.2, Z0], [-IN, 1.2, Z1 - 0.4]].map(at)), { tone: "mid" })));
  out.push(pink(S(k.slabOf(post(IN), Z0, Z1 - Z0, P, 3, 0.4), { tone: "hi" })));
  const HEAD = { x: -IN - POST, y: -D, w: 2 * (IN + POST), d: 2 * D, r: 1 };
  out.push(pink(S(k.slabOf(HEAD, Z1, 6, P, 3, 0.4), { tone: "hi" })));
  const CORNICE = { x: -IN - POST - 4, y: -D - 3, w: 2 * (IN + POST + 4), d: 2 * D + 6, r: 2.4 };
  out.push(pink(S(k.slabOf(CORNICE, Z1 + 6, 4, P, 4, 0.6), { tone: "hi", inner: L(k.sideSeam(CORNICE, Z1 + 8, P, 4), { tone: "lo" }) })));

  // ---- Leaf: swung out toward us on the left post --------------------------------------------
  const n = [leafDir[1], -leafDir[0]]; // the leaf's face normal, the side facing the camera
  const LT = 2.6; // leaf thickness
  const corner = (u, t) => [hinge[0] + leafDir[0] * u + n[0] * t, hinge[1] + leafDir[1] * u + n[1] * t];
  const leaf = [corner(0.6, 0), corner(2 * IN - 0.6, 0), corner(2 * IN - 0.6, LT), corner(0.6, LT)];
  out.push(pink(S(k.extrude(leaf, Z0 + 0.8, Z1 - Z0 - 1.6, P, { bevel: 0.4 }), { tone: "hi" })));
  // Two raised panels on its outer face, as grooves.
  const onLeaf = (u, z) => {
    const [x, y] = corner(u, LT + 0.05);
    return [x, y, z];
  };
  for (const [z0, z1] of [[Z0 + 8, Z0 + 44], [Z0 + 52, Z1 - 8]]) {
    out.push(pink(L(k.pathOf([onLeaf(6, z0), onLeaf(2 * IN - 6, z0), onLeaf(2 * IN - 6, z1), onLeaf(6, z1)].map(at), true), { tone: "lo" })));
  }
  // The knob, on a round rose, two thirds of the way out.
  const kp = onLeaf(2 * IN - 6, Z0 + 46);
  const KN = G.frameAlong(kp, [n[0], n[1], 0]);
  out.push(tint("pearl", S(G.disc(0, 0.8, 3, KN, P), { tone: "hi" }) + S(G.solidOf([[0.8, 1.4], [3, 1.4], [3.6, 2.8, 1], [5.6, 2.8]], KN, P), { tone: "hi" })));

  return {
    width,
    height,
    label: "An isometric drawing of Doraemon's pink Anywhere Door standing open on its footed base on a display plinth: posts, head and cornice, the leaf swung toward us with two panels and a round knob.",
    body: out,
    css: `@keyframes dr-view{0%,15%{opacity:0}35%,80%{opacity:1}100%{opacity:0}}.dr-view{opacity:0;animation:dr-view 4.5s ease-in-out infinite}`,
  };
}
