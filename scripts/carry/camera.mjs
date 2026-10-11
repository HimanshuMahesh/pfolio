// 01 — A fixed-lens rangefinder-style camera standing on its plinth.
import { k, G, frame, pen, plinth, faceRect, faceCircle, topArc } from "./lib.mjs";

const PLATE = { x: -84, y: -42, w: 168, d: 104, r: 6 };
const BODY = { x: -64, y: -17, w: 128, d: 34, r: 7 };
const FRONT = BODY.y + BODY.d; // y of the front face
const RIGHT = BODY.x + BODY.w; // x of the right side
const Z_BASE = 6; // bottom plate top
const Z_TOP = 58; // leather top / top plate bottom
const Z_ROOF = 72; // top plate top
const LENS = [10, 32]; // x, z of the lens axis on the front face

export function camera() {
  const { P, width, height } = frame(
    [...k.boxCorners(PLATE, -8, 0), ...k.boxCorners(BODY, 0, Z_ROOF + 9), [LENS[0], FRONT + 28, LENS[1] + 22], [LENS[0] - 22, FRONT + 28, LENS[1] - 22]],
    { azimuth: 58 },
  );
  const { S, L, D, at, poly, fillPath, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "01" })];

  // ---- Body: bottom plate, leather band, top plate ------------------------
  out.push(halo(k.insetPlan(BODY, 2), 0, 1, 5));
  out.push(S(k.slabOf(k.insetPlan(BODY, 4), 0, 1.4, P, 6), { tone: "lo" })); // rubber base pad
  out.push(S(k.slabOf(BODY, 1.4, Z_BASE - 1.4, P, 8, 0.6), { tone: "mid" }));
  const LEATHER = k.insetPlan(BODY, 0.7);
  out.push(S(k.slabOf(LEATHER, Z_BASE, Z_TOP - Z_BASE, P, 8), { tone: "mid", crease: "none" }));

  // Leather grain: a staggered grid of fine dots on the two visible faces.
  const grain = [];
  for (let z = Z_BASE + 2, row = 0; z < Z_TOP - 1; z += 2.6, row++) {
    for (let x = LEATHER.x + 6 + (row % 2) * 1.3; x < RIGHT - 7; x += 2.6) {
      if (Math.hypot(x - LENS[0], z - LENS[1]) < 23.5) continue;
      grain.push(at([x, FRONT - 0.7, z]));
    }
    for (let y = LEATHER.y + 6 + (row % 2) * 1.3; y < FRONT - 7; y += 2.6) grain.push(at([RIGHT - 0.7, y, z]));
  }
  out.push(D(grain, { size: 0.28, tone: "faint" }));

  out.push(S(k.slabOf(BODY, Z_TOP, Z_ROOF - Z_TOP, P, 8, 0.8), { tone: "mid", inner: L(k.sideSeam(BODY, Z_TOP + 3.5, P, 8), { tone: "faint" }) }));

  // ---- Front of the top plate: viewfinder window, light sensor, AF lamp ---
  const vf = faceRect("y", FRONT, -56, -34, Z_TOP + 5.5, Z_ROOF - 3.5, 1.6);
  out.push(fillPath(vf, "carry-glass"));
  out.push(L(poly(vf, true), { tone: "lo" }));
  out.push(`<path class="carry-glint" d="${poly([[-52, FRONT, Z_TOP + 7], [-47, FRONT, Z_ROOF - 5]])}"/>`);
  out.push(`<path class="carry-glint" d="${poly([[-49, FRONT, Z_TOP + 7], [-46.5, FRONT, Z_TOP + 10.5]])}" style="opacity:.4"/>`);
  const sensor = faceRect("y", FRONT, -28, -22, Z_TOP + 6.5, Z_ROOF - 5, 1);
  out.push(fillPath(sensor, "carry-glass"), L(poly(sensor, true), { tone: "lo" }));
  const lamp = faceCircle("y", FRONT, 30, Z_TOP + 8, 1.6, 20);
  out.push(fillPath(lamp, "carry-glass-2"), L(poly(lamp, true), { tone: "lo" }));
  out.push({ live: fillPath(lamp, "live-glow cam-lamp") });

  // Viewfinder lever on the leather, right of the lens.
  out.push(S(k.slabOf({ x: 44, y: FRONT, w: 3, d: 2.2, r: 0.6 }, 40, 12, P, 3), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: 42.5, y: FRONT + 0.6, w: 6, d: 2.6, r: 1 }, 50, 3, P, 3), { tone: "hi" }));
  // Focus-mode switch, lower right.
  out.push(S(k.slabOf({ x: 50, y: FRONT, w: 7, d: 1.4, r: 0.7 }, 14, 4, P, 3), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: 51, y: FRONT + 1.4, w: 2.4, d: 1.8, r: 0.6 }, 14.6, 2.8, P, 3), { tone: "mid" }));

  // ---- Right side: strap lug and port door --------------------------------
  const door = faceRect("x", RIGHT - 0.7, -10, 8, Z_BASE + 10, Z_BASE + 34, 2);
  out.push(L(poly(door, true), { tone: "lo" }));
  out.push(L(poly([[RIGHT - 0.7, -10, Z_BASE + 20], [RIGHT - 0.7, -10, Z_BASE + 24]]), { tone: "mid" }));
  const LUG = G.frameOf([RIGHT, 0, Z_TOP + 4], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(S(G.disc(0, 1.2, 3.4, LUG, P), { tone: "mid" }));
  out.push(S(G.disc(1.2, 4.2, 2.3, LUG, P), { tone: "mid" }));
  out.push(`<path class="carry-hole" d="${G.circleOf(LUG, 4.2, 1.1, P)}"/>`);
  // Split ring through the lug, hanging below it.
  const ringPts = faceCircle("y", 0, RIGHT + 4.2, Z_TOP + 1, 3.6, 40, -Math.PI * 0.42, Math.PI * 1.42);
  out.push(`<path class="iso-line" data-tone="hi" d="${poly(ringPts)}" style="stroke-width:1.6"/>`);
  out.push(`<path class="iso-line" data-tone="faint" d="${poly(ringPts)}" style="stroke-width:.5;stroke:var(--anatomy-paper)"/>`);

  // ---- Top plate controls, back to front ----------------------------------
  // Hot shoe
  const SHOE = { x: -16, y: -9, w: 22, d: 18, r: 1 };
  out.push(S(k.slabOf(SHOE, Z_ROOF, 1.2, P, 3), { tone: "mid" }));
  for (const y of [SHOE.y, SHOE.y + SHOE.d - 2.4]) out.push(S(k.slabOf({ x: SHOE.x, y, w: SHOE.w, d: 2.4, r: 0.4 }, Z_ROOF + 1.2, 1.4, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: SHOE.x + 3, y: SHOE.y + 2.4, w: SHOE.w - 3, d: SHOE.d - 4.8, r: 0.6 }, Z_ROOF + 1.2, 0.4, P, 2), { tone: "lo", crease: "none" }));
  out.push(D([[-10, -2], [-7, 0], [-10, 2], [-4, -2], [-4, 2]].map(([x, y]) => at([x, y, Z_ROOF + 1.6])), { size: 0.6, tone: "hi" }));
  // Diopter-free top: a small Fn button between shoe and dial
  out.push(S(k.cylinder(14, 8, 2.6, Z_ROOF, 1.2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(14, 8, 2, Z_ROOF + 1.2, 0.8, P, 20), { tone: "hi" }));

  // Exposure compensation dial, overhanging the back right corner.
  const EC = [50, -6];
  out.push(S(k.cylinder(EC[0], EC[1], 9, Z_ROOF, 5, P, 48, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(EC[0], EC[1], 9, Z_ROOF + 0.6, Z_ROOF + 4.4, 48, P, 0.3), { tone: "lo" }));
  const ecTicks = k.radialTicks(EC[0], EC[1], 8.4, 18, 3, Z_ROOF + 5, [1, 2], P, -Math.PI * 0.8, Math.PI * 1.6);
  out.push(L(ecTicks.minor, { tone: "lo" }), L(ecTicks.major, { tone: "mid" }));
  out.push(L(k.ring(EC[0], EC[1], 4.4, Z_ROOF + 5, P, 32), { tone: "faint" }));

  // Shutter speed dial with the shutter button and its power collar.
  const SD = [26, 0];
  out.push(S(k.cylinder(SD[0], SD[1], 11.5, Z_ROOF, 1.2, P, 56), { tone: "lo" }));
  out.push(S(k.cylinder(SD[0], SD[1], 11, Z_ROOF + 1.2, 5.6, P, 56, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(SD[0], SD[1], 11, Z_ROOF + 2, Z_ROOF + 6, 64, P, 0.3), { tone: "lo" }));
  out.push(L(k.sideArc(SD[0], SD[1], 11, Z_ROOF + 2, P, 40), { tone: "faint" }));
  const sdTop = Z_ROOF + 6.8;
  const sdTicks = k.radialTicks(SD[0], SD[1], 10.3, 12, 3, sdTop, [1.2, 2.4], P, -Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(sdTicks.minor, { tone: "lo" }), L(sdTicks.major, { tone: "mid" }));
  out.push(L(k.ring(SD[0], SD[1], 7.2, sdTop, P, 40), { tone: "faint" }));
  // Power collar with its tab, then the threaded button.
  out.push(S(k.cylinder(SD[0], SD[1], 5.6, sdTop, 1.6, P, 36), { tone: "mid" }));
  out.push(S(k.slabOf({ x: SD[0] + 4, y: SD[1] + 2, w: 5, d: 3, r: 1 }, sdTop, 1.6, P, 3), { tone: "mid" }));
  out.push(S(k.cylinder(SD[0], SD[1], 3.6, sdTop + 1.6, 1.4, P, 28), { tone: "mid" }));
  out.push(L(k.ring(SD[0], SD[1], 3, sdTop + 3, P, 24), { tone: "lo" }));
  const button = S(k.cylinder(SD[0], SD[1], 2.4, sdTop + 3, 1.4, P, 24), { tone: "hi", lit: true });
  out.push({ still: button, live: `<g class="cam-btn">${button}</g>` });

  // Index mark on the top plate, in front of the shutter dial.
  out.push(L(k.lineOnTop([SD[0], SD[1] + 12.5], [SD[0], SD[1] + 14.5], Z_ROOF, P), { tone: "hi" }));
  out.push(L(k.lineOnTop([EC[0] - 10, EC[1] + 4], [EC[0] - 12, EC[1] + 4.6], Z_ROOF, P), { tone: "hi" }));
  // Two screws on the top plate's front edge.
  out.push(D([at([-60, 12, Z_ROOF]), at([60, 12, Z_ROOF])], { size: 0.45 }));

  // ---- Lens ----------------------------------------------------------------
  const F = G.frameOf([LENS[0], FRONT, LENS[1]], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const profile = [
    [0, 22.5], [2.2, 22.5], // mount ring
    [2.2, 21], [8.5, 21], // aperture ring
    [8.5, 19.6], [10, 19.6], // spacer
    [10, 20.6], [20.5, 20.6], // focus ring
    [20.5, 19.4], [25, 19.4], // filter rim
  ];
  out.push(halo({ x: LENS[0] - 18, y: FRONT + 2, w: 36, d: 22, r: 10 }, 0, 0.1, 6));
  out.push(S(G.solidOf(profile, F, P), { tone: "hi", crease: "lo" }));
  out.push(k.fadedSvg(G.ribsOf(F, 2.2, 8.5, 21, 54, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  out.push(k.fadedSvg(G.ribsOf(F, 10, 20.5, 20.6, 96, P, { fade: [0.1, 0.55] }), { tone: "lo" }));
  // Aperture scale ticks on the aperture ring's front shoulder.
  out.push(L(G.spokesOf(F, 8.5, 19.8, 21, 7, P, { from: Math.PI * 0.35, to: Math.PI * 0.65 }), { tone: "mid" }));
  out.push(L(G.arcOf(F, 2.2, 22.5, P), { tone: "faint" }));

  // Front: filter thread ring, the glass and its inner elements.
  out.push(L(G.circleOf(F, 25, 17.6, P), { tone: "lo" }));
  out.push(`<path class="carry-glass" d="${G.circleOf(F, 25, 15.8, P)}"/>`);
  out.push(L(G.circleOf(F, 25, 15.8, P), { tone: "mid" }));
  out.push(`<path class="carry-glass-2" d="${G.circleOf(F, 25, 9.5, P)}"/>`);
  out.push(L(G.circleOf(F, 25, 12.6, P), { tone: "faint" }));
  out.push(L(G.circleOf(F, 25, 6.2, P), { tone: "faint" }));
  out.push(`<path class="carry-glass" d="${G.circleOf(F, 25, 3.4, P)}"/>`);
  const glint = (r, a0, a1, style = "") =>
    `<path class="carry-glint" d="${k.pathOf(Array.from({ length: 13 }, (_, i) => k.iso(G.pointOf(F, 25, r, a0 + ((a1 - a0) * i) / 12), P)))}"${style}/>`;
  out.push(glint(14, 1.95, 2.75), glint(11, 2.0, 2.45, ` style="opacity:.45"`), glint(7.6, 5.2, 5.7, ` style="opacity:.35"`));
  // Live: the exposure flashes across the glass.
  out.push({ live: `<path class="live-glow cam-flash" d="${G.circleOf(F, 25, 15.8, P)}"/>` });
  // Lens index dot on the mount ring.
  out.push(D([at([LENS[0], FRONT + 1.1, LENS[1] + 22.5])], { size: 0.7, tone: "hi" }));

  return {
    width,
    height,
    label: "An isometric drawing of a fixed-lens rangefinder camera on a small display plinth: leather-wrapped body, knurled shutter-speed and exposure dials, hot shoe, viewfinder window and a ribbed lens.",
    body: out,
    css: `@keyframes cam-press{0%,100%{transform:none}6%,16%{transform:translateY(1.4px)}}.cam-btn{animation:cam-press 2.4s cubic-bezier(.3,.7,0,1) infinite}
@keyframes cam-flash{0%,11%{opacity:0}13%{opacity:.85}45%,100%{opacity:0}}.cam-flash{fill:#eef2ff;animation:cam-flash 2.4s ease-out infinite}
@keyframes cam-lamp{0%,2%{opacity:0}5%,11%{opacity:.95}16%,100%{opacity:0}}.cam-lamp{animation:cam-lamp 2.4s infinite}`,
  };
}
