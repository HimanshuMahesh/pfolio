// 01 — The Nano Gauntlet, standing on its cuff with the back of the hand to us.
import { k, G, frame, pen, plinth, faceCircle } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -58, y: -44, w: 116, d: 88, r: 6 };
const FRONT = 11; // y of the back-of-hand face
const AZ = 64;

/** Forearm plates, bottom to top: a flared foot, three tapering bands, the gold wrist band. */
const CUFF = [
  { plan: { x: -27, y: -19, w: 54, d: 38, r: 16 }, z0: 0, z1: 5 },
  { plan: { x: -25, y: -17, w: 50, d: 34, r: 15 }, z0: 5.6, z1: 19 },
  { plan: { x: -24, y: -16, w: 48, d: 32, r: 14 }, z0: 19.6, z1: 33 },
  { plan: { x: -23, y: -15, w: 46, d: 30, r: 13 }, z0: 33.6, z1: 45 },
];
const BAND = { plan: { x: -24, y: -15.5, w: 48, d: 31, r: 13 }, z0: 45.6, z1: 53 };
const HAND_W = [21.6, 25.4]; // half-widths of the back of the hand at the wrist and at the knuckles
const Z_HAND = [53.6, 88];
const KNUCKLE = { plan: { x: -26, y: -12, w: 52, d: 24, r: 6 }, z0: 88.6, z1: 96 };

/** Index to little finger, left to right: centre x, width, and its three segment lengths. */
const FINGERS = [
  { x: -18.5, w: 10.6, segs: [20, 15, 12], stone: "power" },
  { x: -6.2, w: 10.8, segs: [22, 17, 13], stone: "space" },
  { x: 6.2, w: 10.6, segs: [20, 16, 12], stone: "reality" },
  { x: 18.5, w: 9.6, segs: [16, 12, 10], stone: "soul" },
];

/**
 * One finger or thumb as an armoured chain: turned segments that taper toward
 * the tip, each curling a little further toward the palm (away from us), with a
 * gold knuckle ball at every joint and a domed last segment. The tip is the
 * farthest piece, so the markup runs tip to root.
 */
function digit(P, S, L, red, gold, base, { segs, r0, splay, curl, lean = 0 }) {
  const pieces = [];
  let p = base;
  let r = r0;
  segs.forEach((len, j) => {
    const pitch = curl[j];
    const dir = G.unit3([Math.sin(splay) + lean, Math.sin(pitch), Math.cos(pitch)]);
    const F = G.frameAlong(p, dir);
    const r1 = r * 0.9;
    const last = j === segs.length - 1;
    const profile = last
      ? [[0, r], [len - r1 * 1.1, r1, 1], [len - r1 * 0.45, r1 * 0.78, 1], [len, 0]]
      : [[0, r], [len * 0.5, r * 0.97, 1], [len, r1]];
    pieces.push(red(S(G.solidOf(profile, F, P), { tone: "hi", inner: L(G.arcOf(F, len * 0.42, r * 0.98, P, { least: 0.1 }), { tone: "lo" }) })));
    p = G.pointOf(F, len, 0, 0);
    if (!last) pieces.push(gold(S(G.sphereOf(p, r1 * 0.98, P), { tone: "hi" })));
    r = r1 * 0.96;
  });
  return pieces.reverse().join("");
}

export function gauntlet() {
  const tallest = KNUCKLE.z1 + 22 + 17 + 13 + 3;
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [-24, 0, tallest], [24, 0, tallest], [-52, 4, 92]], { azimuth: AZ });
  const { S, L, D, at, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "01" })];
  const red = (markup) => tint("red", markup);
  const gold = (markup) => tint("gold", markup);
  const stones = []; // [x, z, r, name] on the front faces, for the glow layer

  out.push(halo(CUFF[0].plan, 0, 0.6, 6));

  // ---- Thumb: two segments leaning out from the hand's left edge -------------
  // Drawn first: the hand covers its root.
  const T = G.frameAlong([-22, 1, 60], G.unit3([-0.78, -0.08, 0.62]));
  out.push(gold(S(G.sphereOf([-22, 1, 60], 6.4, P), { tone: "hi" })));
  out.push(digit(P, S, L, red, gold, [-22, 1, 60], { segs: [16, 14], r0: 6.2, splay: -0.95, curl: [-0.1, -0.36], lean: -0.15 }));
  out.push(red(L(G.arcOf(T, 7, 6.2, P), { tone: "lo" })));
  // The time stone on the thumb's root, set facing us.
  const tp = G.pointOf(T, 8.4, 6.3, G.angleToward(T, [0.3, 1, 0.2]));
  const TS = G.frameAlong(tp, G.radialOf(T, G.angleToward(T, [0.3, 1, 0.2])));
  out.push(`<path class="wl-c-time" d="${G.circleOf(TS, 0, 2.5, P)}"/>`);
  out.push(gold(L(G.circleOf(TS, 0, 3.2, P), { tone: "hi" })));
  const timeGlow = `<path class="wl-c-time gt-glow" style="animation-delay:1.25s" d="${G.circleOf(TS, 0.2, 4.6, P)}"/>`;

  // ---- Cuff --------------------------------------------------------------------
  CUFF.forEach(({ plan, z0, z1 }, i) => {
    const seam = i > 0 ? L(k.sideSeam(plan, (z0 + z1) / 2, P, 8), { tone: "lo" }) : "";
    out.push(red(S(k.slabOf(plan, z0, z1 - z0, P, 8, 0.6), { tone: "hi", inner: seam })));
  });
  // The raised spine plate up the front of the forearm, with rivets.
  const SPINE = { x: -6, y: 14, w: 12, d: 3.6, r: 1.6 };
  out.push(red(S(k.slabOf(SPINE, 6.2, 38.6, P, 4, 0.5), { tone: "hi", inner: L(k.sideSeam(SPINE, 26, P, 4), { tone: "lo" }) })));
  out.push(D([12, 32, 40].map((z) => at([0, SPINE.y + SPINE.d, z])), { size: 0.5, tone: "mid" }));
  // Gold wrist band, ribbed.
  out.push(gold(S(k.slabOf(BAND.plan, BAND.z0, BAND.z1 - BAND.z0, P, 8, 0.5), {
    tone: "hi",
    inner: [48, 50.5].map((z) => L(k.sideSeam(BAND.plan, z, P, 8), { tone: "mid" })).join(""),
  })));

  // ---- Back of the hand ----------------------------------------------------------
  // A plate that flares from the wrist to the knuckles, its corners chamfered.
  const [z0, z1] = Z_HAND;
  const half = (z) => HAND_W[0] + ((z - z0) / (z1 - z0)) * (HAND_W[1] - HAND_W[0]);
  const outline = [[-HAND_W[0] + 2, z0], [HAND_W[0] - 2, z0], [HAND_W[0], z0 + 2], [HAND_W[1], z1 - 2], [HAND_W[1] - 2, z1], [-HAND_W[1] + 2, z1], [-HAND_W[1], z1 - 2], [-HAND_W[0], z0 + 2]];
  const HANDF = G.frameOf([0, -FRONT, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(red(S(G.prismOf(HANDF, outline, 0, 2 * FRONT, P), { tone: "hi" })));
  out.push(red(L(k.pathOf([[-half(63), FRONT + 0.05, 63], [half(63), FRONT + 0.05, 63]].map(at)), { tone: "lo" })));
  // Armour ridges running up the back of the hand to the index and little fingers.
  for (const x of [FINGERS[0].x, FINGERS[3].x]) {
    const RIDGE = { x: x - 2.6, y: FRONT - 0.4, w: 5.2, d: 2.2, r: 1.1 };
    out.push(red(S(k.slabOf(RIDGE, 64, z1 - 64 - 0.4, P, 3, 0.4), { tone: "hi" })));
    out.push(D([at([x, RIDGE.y + RIDGE.d, 66.4])], { size: 0.45, tone: "mid" }));
  }
  // The gold centre plate, and the mind stone in its bezel.
  const PLATE_C = { x: -11, y: FRONT - 0.6, w: 22, d: 3.4, r: 2.2 };
  out.push(gold(S(k.slabOf(PLATE_C, 58, 26, P, 4, 0.5), { tone: "hi" })));
  const zf = PLATE_C.y + PLATE_C.d;
  out.push(gold(L(k.pathOf(faceCircle("y", zf, 0, 72, 6.4, 40).map(at), true), { tone: "hi" })));
  stones.push([0, zf, 72, 5.2, "mind"]);
  out.push(gold(L(k.pathOf([[-11, zf, 62], [11, zf, 62]].map(at)), { tone: "mid" })));
  out.push(gold(L(k.pathOf([[-11, zf, 81], [11, zf, 81]].map(at)), { tone: "mid" })));

  // ---- Knuckle band, with four sockets ---------------------------------------------
  out.push(gold(S(k.slabOf(KNUCKLE.plan, KNUCKLE.z0, KNUCKLE.z1 - KNUCKLE.z0, P, 6, 0.5), { tone: "hi" })));
  const zk = KNUCKLE.plan.y + KNUCKLE.plan.d;
  for (const f of FINGERS) {
    out.push(gold(L(k.pathOf(faceCircle("y", zk, f.x, 92.3, 3.4, 28).map(at), true), { tone: "hi" })));
    stones.push([f.x, zk, 92.3, 2.6, f.stone]);
  }

  // ---- Stones ------------------------------------------------------------------------
  const glows = [];
  stones.forEach(([x, y, z, r, name], i) => {
    out.push(`<path class="wl-c-${name}" d="${k.pathOf(faceCircle("y", y + 0.3, x, z, r, 28).map(at), true)}"/>`);
    out.push(D([at([x - r * 0.35, y + 0.4, z + r * 0.4])], { size: r > 4 ? 0.9 : 0.5, tone: "hi" }));
    glows.push(`<path class="wl-c-${name} gt-glow" style="animation-delay:${(i === 0 ? 1 : i - 1) * 0.25}s" d="${k.pathOf(faceCircle("y", y + 0.4, x, z, r * 1.9, 28).map(at), true)}"/>`);
  });

  // ---- Fingers: armoured chains rising off the knuckle band, curling toward the palm ---
  // Left to right is far to near, so they paint in order.
  for (const f of FINGERS) {
    const spread = f.x / 18.5;
    out.push(digit(P, S, L, red, gold, [f.x, -0.6, KNUCKLE.z1 - 1.2], {
      segs: f.segs,
      r0: f.w / 2,
      splay: spread * 0.09,
      curl: [-0.06, -0.3, -0.56],
    }));
  }

  out.push({ live: glows.join("") + timeGlow });

  return {
    width,
    height,
    label: "An isometric drawing of the Nano Gauntlet standing on its cuff on a display plinth: red armour plates, a gold wrist band and knuckle band, segmented fingers and thumb, and the six stones set in gold.",
    body: out,
    css: `@keyframes gt-glow{0%,6%{opacity:0}12%{opacity:.75}24%,64%{opacity:.25}70%{opacity:.95}80%,100%{opacity:0}}
.gt-glow{opacity:0;filter:blur(2px);animation:gt-glow 4.2s ease-in-out infinite}`,
  };
}
