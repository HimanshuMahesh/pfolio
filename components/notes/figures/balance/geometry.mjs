/* The balance figure: an equal-arm beam balance weighing one chess move.
   Built with the anatomy kit (lib/iso). Everything static is a string built
   once (on the server); the beam is rebuilt per frame by `beamAt`, and the two
   hangers move with `hangerShift`. World units: x along the beam, y depth,
   z up. */
import * as k from "../../../../lib/iso/iso-kit.mjs";
import * as G from "../../../../lib/iso/lathe.mjs";

export const WIDTH = 640;
export const HEIGHT = 430;

/* ---- the model ----------------------------------------------------------
   Terms of the evaluation, in pawns, from Black's side. The left pan holds
   what the move gains, the right pan what it costs. Illustrative values. */
export const TERMS = [
  { name: "material", value: 1.0 },
  { name: "king safety", value: -2.2 },
  { name: "activity", value: -0.5 },
  { name: "structure", value: -0.3 },
];
export const totalOf = (count) => TERMS.slice(0, count).reduce((sum, term) => sum + term.value, 0);
/** Beam tilt in radians for a score; positive lowers the left pan. */
export const MAX_TILT = (8 * Math.PI) / 180;
export const tiltOf = (score) => MAX_TILT * Math.tanh(score / 1.4);
const signed = (v) => (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1);
export const readoutOf = (count) => `${count} of 4 terms · ${signed(totalOf(count))}`;

/* ---- layout ------------------------------------------------------------ */
const PLATE = { x: -128, y: -42, w: 256, d: 84, r: 9 };
const PLATE_H = 9;
const FOOT_H = 5;
const COLUMN_TOP = 122;
const FZ = 131.2; // the central knife edge: the pivot
const L = 100; // half the beam
const EYE = L - 2.5;
const YOKE_DROP = 40;
const PAN_Z = 50;
const PAN_R = 25;
const WIRE_AT = [58, 178, 298].map((d) => (d * Math.PI) / 180); // one wire faces the viewer
const RACK = { x: -36, y: 17, w: 72, d: 17, r: 2.5 };
const RACK_H = 7;
const RACK_Y = RACK.y + RACK.d / 2;

/** The weights on the right pan, and the bore each sits in on the rack. */
const WEIGHTS = [
  { term: 1, r: 8, h: 12, pan: [0, 0], rack: [-21, RACK_Y] },
  { term: 2, r: 5.4, h: 8, pan: polar(13, 118), rack: [1, RACK_Y] },
  { term: 3, r: 4.2, h: 6, pan: polar(13, 238), rack: [19, RACK_Y] },
];
function polar(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

const P = k.fitProjection(
  [
    ...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0),
    [-EYE - PAN_R, -PAN_R, PAN_Z - 3],
    [EYE + PAN_R, PAN_R, PAN_Z - 3],
    [-L, 0, FZ + 12.5 + L * Math.sin(MAX_TILT)],
    [L, 0, FZ + 12.5 + L * Math.sin(MAX_TILT)],
  ],
  WIDTH,
  HEIGHT,
  { pad: 8, azimuth: 58 },
);
export const PROJECTION = P;

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const alongY = (x, y, z) => G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);

/* ---- base ---------------------------------------------------------------- */
function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 16).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 7.5, -PLATE_H - FOOT_H, 1.6, P, 32), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 32), { tone: "mid" }));
    out.push(Ln(k.knurl(x, y, 5.6, -PLATE_H - FOOT_H + 1.8, -PLATE_H - 0.2, 30, P), { tone: "faint" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));

  // a pan rest under each pan, a rubber pad on a short post
  for (const x of [-EYE, EYE]) {
    out.push(S(k.cylinder(x, 0, 9, 0, 2, P, 40), { tone: "mid" }));
    out.push(S(k.cylinder(x, 0, 3.4, 2, 24, P, 28), { tone: "mid", crease: "none" }));
    out.push(Ln(k.sideArc(x, 0, 3.4, 14, P, 16), { tone: "faint" }));
    out.push(S(k.cylinder(x, 0, 6.5, 26, 3, P, 36, 0.6), { tone: "lo", crease: "faint" }));
  }

  // the label plate, three rule lines and two screws
  const label = { x: -78, y: 22, w: 30, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  for (const [i, w] of [16, 22, 12].entries()) out.push(Ln(k.lineOnTop([label.x + 6, label.y + 3.5 + i * 2.6], [label.x + 6 + w, label.y + 3.5 + i * 2.6], 0.8, P), { tone: "faint", free: true }));
  out.push(D([at([label.x + 2.5, label.y + 6, 0.8]), at([label.x + label.w - 2.5, label.y + 6, 0.8])], { size: 0.42 }));

  // the spirit level: a round housing with its bubble ring
  const lv = [58, 27];
  out.push(S(k.cylinder(lv[0], lv[1], 7, 0, 3, P, 40, 0.6), { tone: "mid" }));
  out.push(Ln(k.ring(lv[0], lv[1], 5, 3, P, 32), { tone: "lo" }));
  out.push(Ln(k.ring(lv[0], lv[1], 1.8, 3, P, 20), { tone: "mid" }));
  out.push(D([at([lv[0] + 0.6, lv[1] - 0.4, 3])], { size: 0.7, tone: "hi" }));
  return out.join("");
}

/* ---- the weight rack: one bore per weight ---------------------------------- */
function rack() {
  const out = [];
  out.push(S(k.slabOf(RACK, 0, RACK_H, P, 6, 0.8), { tone: "mid" }));
  for (const w of WEIGHTS) {
    out.push(Ln(k.ring(w.rack[0], w.rack[1], w.r + 0.9, RACK_H, P, 40), { tone: "lo" }));
    out.push(Ln(k.ring(w.rack[0], w.rack[1], w.r + 0.3, RACK_H, P, 40), { tone: "faint" }));
  }
  out.push(D([at([RACK.x + 3, RACK_Y, RACK_H]), at([RACK.x + RACK.w - 3, RACK_Y, RACK_H])], { size: 0.45 }));
  return out.join("");
}

/** A brass weight standing at (x, y, z): a bevelled body, a neck and a ball knob. */
function weight(x, y, z, w) {
  const out = [];
  out.push(S(k.cylinder(x, y, w.r, z, w.h, P, 48, 0.7), { tone: "hi", crease: "lo" }));
  out.push(Ln(k.sideArc(x, y, w.r, z + 1.6, P, 32), { tone: "faint" }));
  const neck = w.r * 0.32;
  out.push(S(k.cylinder(x, y, neck, z + w.h, 1.8, P, 20), { tone: "hi", crease: "none" }));
  out.push(S(G.sphereOf([x, y, z + w.h + 1.8 + neck * 1.3], neck * 1.4, P), { tone: "hi" }));
  return out.join("");
}

/** Weights waiting in the rack. Each sits in a group the live layer fades. */
function rackWeights() {
  return WEIGHTS.map((w) => `<g data-rack="${w.term}">${weight(w.rack[0], w.rack[1], RACK_H - 1.2, w)}</g>`).join("");
}

/* ---- the pawn: a turned Staunton pawn ---------------------------------- */
function pawn(x, y, z) {
  const F = up(x, y, z);
  const out = [];
  out.push(S(G.solidOf([[0, 8.6], [1.4, 8.6], [2.4, 7.4, 1], [3.2, 6], [4.6, 5.6, 1], [8, 4, 1], [12, 3, 1], [14.6, 2.7]], F, P), { tone: "hi", crease: "lo" }));
  out.push(Ln(G.arcOf(F, 1.4, 8.6, P), { tone: "faint" }));
  out.push(S(G.disc(14.2, 15.6, 4.8, F, P, { bevel: 0.5 }), { tone: "hi", crease: "lo" }));
  out.push(S(G.sphereOf([x, y, z + 15.6 + 4.2], 4.8, P), { tone: "hi" }));
  return out.join("");
}

/* ---- a hanger: hook, rod, yoke, three wires and the pan ------------------
   Built at rest (beam level) with its eye at (sx·EYE, 0, FZ + 3). */
function hanger(side) {
  const x = side * EYE;
  const eyeZ = FZ + 3;
  const yokeZ = eyeZ - YOKE_DROP;
  const out = [];
  const rim = WIRE_AT.map((a) => [x + (PAN_R - 1.6) * Math.cos(a), (PAN_R - 1.6) * Math.sin(a), PAN_Z]);
  const nearest = 0; // WIRE_AT[0] faces the viewer

  // the rod; its hook ring round the beam's eye pin is drawn behind the beam (hookOf)
  out.push(S(k.cylinder(x, 0, 0.9, yokeZ + 2.4, eyeZ - 2.3 - yokeZ - 2.4, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, 0, 3.2, yokeZ, 2.4, P, 28, 0.4), { tone: "mid" }));

  // the pan: a shallow turned dish
  const F = up(x, 0, PAN_Z - 3.4);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: x - 18, y: -18, w: 36, d: 36, r: 18 }, PAN_Z - 6, 0.1, P)}" style="filter:blur(6px);opacity:.35"/>`);
  out.push(S(G.solidOf([[0, 15], [1.6, 21, 1], [3.4, PAN_R]], F, P), { tone: "mid", crease: "lo" }));
  out.push(Ln(k.ring(x, 0, PAN_R - 2.2, PAN_Z, P, 64), { tone: "lo" }));

  const wire = (i) =>
    k.wireSvg(at(rim[i]), at([x, 0, yokeZ]), { tone: "lo", size: 0.8 });
  const back = WIRE_AT.map((_, i) => i).filter((i) => i !== nearest).map(wire).join("");
  return { back: out.join("") + back, front: wire(nearest), x };
}

/** The hook ring at the top of a hanger's rod, hung on the eye pin. */
const hookOf = (side) => Ln(G.circleOf(alongY(side * EYE, 0, FZ + 3), 0, 2.3, P, 24), { tone: "mid" });

function leftHanger() {
  const h = hanger(-1);
  return h.back + `<g data-pan-term="0">${pawn(-EYE, 0, PAN_Z)}</g>` + h.front;
}

function rightHanger() {
  const h = hanger(1);
  const weights = [...WEIGHTS]
    .sort((a, b) => k.depthOf([a.pan[0], a.pan[1], 0], P) - k.depthOf([b.pan[0], b.pan[1], 0], P))
    .map((w) => `<g data-pan="${w.term}" data-off><g data-drop>${weight(EYE + w.pan[0], w.pan[1], PAN_Z, w)}</g></g>`)
    .join("");
  return h.back + weights + h.front;
}

/* ---- the stand: column, head, bearing and the scale ---------------------- */
function stand() {
  const out = [];
  out.push(S(k.cylinder(0, 0, 14, 0, 3, P, 48, 0.6), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 9, 3, 4, P, 40, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 5, 7, COLUMN_TOP - 7, P, 32), { tone: "mid", crease: "none" }));
  for (const z of [40, 80]) out.push(Ln(k.sideArc(0, 0, 5, z, P, 20), { tone: "faint" }));
  out.push(S(k.cylinder(0, 0, 6.8, 58, 4, P, 36, 0.4), { tone: "mid" }));
  out.push(Ln(k.knurl(0, 0, 6.8, 58.4, 61.6, 30, P), { tone: "faint" }));
  const head = { x: -10, y: -7, w: 20, d: 14, r: 2 };
  out.push(S(k.slabOf(head, COLUMN_TOP, FZ - 1.2 - COLUMN_TOP, P, 4, 0.5), { tone: "mid" }));
  out.push(D([at([head.x + 3, 0, FZ - 1.2]), at([head.x + head.w - 3, 0, FZ - 1.2])], { size: 0.42 }));
  // the bearing plate the knife rests on (agate, the one flat it touches)
  out.push(S(k.slabOf({ x: -6, y: -5, w: 12, d: 10, r: 0.8 }, FZ - 1.2, 1.2, P, 3), { tone: "lo", crease: "none" }));

  // the scale: an arc plate on a bracket in front of the column
  out.push(S(k.slabOf({ x: -3, y: 3.5, w: 6, d: 3.5, r: 0.6 }, FZ - 62, 8, P, 3), { tone: "mid", crease: "none" }));
  const plate = [];
  for (let i = 0; i <= 12; i++) {
    const a = ((-15 + (30 * i) / 12) * Math.PI) / 180;
    plate.push([60 * Math.sin(a), -60 * Math.cos(a)]);
  }
  const a0 = (15 * Math.PI) / 180;
  plate.push([-46 * Math.sin(a0), -46 * Math.cos(a0)]);
  plate.unshift([46 * Math.sin(-a0), -46 * Math.cos(a0)]);
  const PF = alongY(0, 7, FZ);
  out.push(S(G.prismOf(PF, plate, 0, 1.6, P), { tone: "mid" }));
  const face = 8.6;
  const tick = (deg, r0, r1) => {
    const a = (deg * Math.PI) / 180;
    return k.segment([r0 * Math.sin(a), face, FZ - r0 * Math.cos(a)], [r1 * Math.sin(a), face, FZ - r1 * Math.cos(a)], P);
  };
  const minor = [];
  const major = [];
  for (let d = -12; d <= 12; d++) (d % 4 === 0 ? major : minor).push(tick(d, 52.5, d % 4 === 0 ? 57.5 : 55.5));
  out.push(Ln(minor.join(""), { tone: "lo" }), Ln(major.join(""), { tone: "mid" }), Ln(tick(0, 51.5, 58.5), { tone: "hi" }));
  const arc = [];
  for (let d = -12; d <= 12; d += 0.5) {
    const a = (d * Math.PI) / 180;
    arc.push(at([52.5 * Math.sin(a), face, FZ - 52.5 * Math.cos(a)]));
  }
  out.push(Ln(k.pathOf(arc), { tone: "lo" }));
  out.push(D([at([-48.5 * Math.sin(a0) + 2, face, FZ - 50]), at([48.5 * Math.sin(a0) - 2, face, FZ - 50])], { size: 0.42 }));
  return out.join("");
}

/* ---- the beam, rebuilt for each tilt ------------------------------------- */
const rot = (theta) => ({ u: [Math.cos(theta), 0, Math.sin(theta)], v: [-Math.sin(theta), 0, Math.cos(theta)] });
const onBeam = (theta, s, t, y = 0) => {
  const { u, v } = rot(theta);
  return [s * u[0] + t * v[0], y, FZ + s * u[2] + t * v[2]];
};

/** Every path of the beam at tilt `theta` (radians). */
export function beamAt(theta) {
  const { u, v } = rot(theta);
  const across = (y) => G.frameOf([0, y, FZ], [0, 1, 0], u, v);
  const along = G.frameOf([0, 0, FZ], u, v, [0, 1, 0]);
  const out = [];
  // the knife edge, apex down on the bearing
  out.push(S(G.prismOf(across(-4), [[-3.2, 3.6], [3.2, 3.6], [0, 0]], 0, 8, P), { tone: "lo", crease: "none" }));
  // the beam: deep at the centre, tapering to the ends
  out.push(S(G.prismOf(across(-2.5), [[-L, 5.5], [0, 3.4], [L, 5.5], [L, 9.5], [0, 12.6], [-L, 9.5]], 0, 5, P), { tone: "mid", crease: "lo" }));
  // lightening slots along the beam
  for (const s of [-1, 1]) {
    const slot = [[18, 6.2], [72, 6.9], [72, 8.6], [18, 10.6]].map(([a, b]) => [a * s, b]);
    out.push(Ln(k.pathOf(slot.map(([a, b]) => at(onBeam(theta, a, b, 2.5))), true), { tone: "faint" }));
  }
  // balance nuts on the threaded ends, and the end blocks that carry the eye pins
  for (const s of [-1, 1]) {
    out.push(S(G.disc(s > 0 ? L - 22 : -(L - 16), s > 0 ? L - 16 : -(L - 22), 3.6, { ...along, o: onBeam(theta, 0, 7.5) }, P, { bevel: 0.4 }), { tone: "mid", crease: "lo" }));
    out.push(S(G.prismOf(across(-3.4), [[s * (L - 7), 1.2], [s * (L + 1.5), 1.2], [s * (L + 1.5), 10.4], [s * (L - 7), 10.4]], 0, 6.8, P), { tone: "mid", crease: "lo" }));
    const eye = onBeam(theta, s * EYE, 3);
    out.push(S(G.disc(-3.4, 3.4, 1.1, G.frameOf(eye, [0, 1, 0], u, v), P), { tone: "lo", crease: "none" }));
  }
  // the pointer boss on the beam's front face
  const boss = onBeam(theta, 0, 7.5);
  out.push(S(G.disc(2.5, 9.6, 2.6, G.frameOf(boss, [0, 1, 0], u, v), P, { bevel: 0.4 }), { tone: "mid", crease: "lo" }));
  return out.join("");
}

/** The needle: from the boss down to the scale, in front of the plate. */
export function needleAt(theta) {
  const from = at(onBeam(theta, 0, 7.5, 9.6));
  const to = at(onBeam(theta, 0, -58, 9.6));
  return { d: k.pathOf([from, to]), pin: from };
}

/** How far a hanger moves (screen px) from rest when the beam tilts by `theta`. */
export function hangerShift(side, theta) {
  const now = onBeam(theta, side * EYE, 3);
  const rest = onBeam(0, side * EYE, 3);
  return k.translateAlong(P, [now[0] - rest[0], 0, now[2] - rest[2]]);
}

/** Every static layer, in paint order around the live parts. */
export function layers() {
  return {
    back: base(),
    left: leftHanger(),
    stand: stand(),
    hookLeft: hookOf(-1),
    hookRight: hookOf(1),
    right: rightHanger(),
    front: rack() + rackWeights(),
  };
}

export const LABEL =
  "An equal-arm balance on a base plate. The left pan holds a chess pawn: the material a move wins. The right pan takes brass weights for king safety, piece activity and pawn structure. As each term is counted, the beam tips from the pawn's side to the weights' side and a needle reads the total on an arc scale.";
