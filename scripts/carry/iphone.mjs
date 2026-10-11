// 02 — A phone lying on its face, the triple camera plateau up.
import { k, frame, pen, plinth, faceRect, faceCircle, topArc } from "./lib.mjs";

const PLATE = { x: -92, y: -54, w: 184, d: 112, r: 6 };
const PHONE = { x: -75, y: -36, w: 150, d: 72, r: 11 };
const H = 8.2;
const END = PHONE.x + PHONE.w; // the bottom end (USB-C), facing +x
const SIDE = PHONE.y + PHONE.d; // the long side facing +y
const MOD = { x: -71, y: -1, w: 37.5, d: 34, r: 8.5 }; // camera plateau, near-left corner
const MOD_H = 1.1;

export function iphone() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), ...k.boxCorners(PHONE, 0, H + 6)], { azimuth: 40 });
  const { S, L, D, at, poly, fillPath, halo, byDepth } = pen(P);
  const out = [plinth(P, PLATE, { index: "02" })];

  // ---- Body: frame band and back glass ------------------------------------
  out.push(halo(k.insetPlan(PHONE, 3), 0, 0.5, 6));
  out.push(S(k.slabOf(PHONE, 0, H, P, 10, 0.9), { tone: "mid", inner: L(k.sideSeam(PHONE, 1.4, P, 10), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PHONE, 1.1), H, P, 10), { tone: "lo" }));

  // Antenna bands: short insulated breaks across the frame, floor to top.
  for (const x of [-58, 52]) out.push(L(poly([[x, SIDE, 0.6], [x, SIDE, H - 0.4]]), { tone: "lo" }));
  for (const y of [-20, 21]) out.push(L(poly([[END, y, 0.6], [END, y, H - 0.4]]), { tone: "lo" }));

  // Side buttons on the +y side: action, volume up, volume down.
  for (const [x0, len] of [[-56, 6], [-44, 10], [-31, 10]]) {
    out.push(S(k.slabOf({ x: x0, y: SIDE - 0.6, w: len, d: 1.3, r: 0.6 }, 2.8, 2.8, P, 3), { tone: "mid" }));
  }

  // Bottom end: USB-C port, speaker and mic holes, two screws.
  const port = faceRect("x", END, -4.6, 4.6, 2.5, 5.7, 1.6);
  out.push(fillPath(port, "carry-hole"), L(poly(port, true), { tone: "mid" }));
  out.push(L(poly(faceRect("x", END, -2.6, 2.6, 3.6, 4.6, 0.5, 3), true), { tone: "faint" }));
  const holes = [];
  for (let i = 0; i < 6; i++) holes.push([-9.2 - i * 2.1], [9.2 + i * 2.1]);
  out.push(holes.map(([y]) => fillPath(faceCircle("x", END, y, H / 2, 0.55, 10), "carry-hole")).join(""));
  out.push(D([at([END, -23, H / 2]), at([END, 23, H / 2])], { size: 0.55, tone: "hi" }));

  // ---- Camera plateau ------------------------------------------------------
  out.push(S(k.slabOf(MOD, H, MOD_H, P, 8, 0.5), { tone: "mid", crease: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(MOD, 0.9), H + MOD_H, P, 8), { tone: "faint" }));
  const Z = H + MOD_H;

  // Three lenses: stainless ring, step, sapphire, inner elements.
  const LENSES = [
    { c: [-61.4, 8.6], main: true },
    { c: [-61.4, 25.4] },
    { c: [-45.6, 17] },
  ];
  for (const { c, main } of byDepth(LENSES, ({ c }) => [c[0], c[1], 0])) {
    const [x, y] = c;
    out.push(S(k.cylinder(x, y, 7.6, Z, 0.5, P, 56), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7.1, Z + 0.5, 2.1, P, 56, 0.4), { tone: "hi", crease: "lo", lit: Boolean(main) }));
    out.push(L(k.sideArc(x, y, 7.1, Z + 1.1, P, 40), { tone: "faint" }));
    const top = Z + 2.6;
    out.push(L(k.ring(x, y, 6.2, top, P, 48), { tone: "lo" }));
    out.push(fillPath(k.circleRing(x, y, 5.5, 48).map(([px, py]) => [px, py, top]), "carry-glass"));
    out.push(fillPath(k.circleRing(x, y, 3.6, 40).map(([px, py]) => [px, py, top]), "carry-glass-2"));
    out.push(L(k.ring(x, y, 4.5, top, P, 40), { tone: "faint" }));
    out.push(L(k.ring(x, y, 2.4, top, P, 32), { tone: "faint" }));
    out.push(fillPath(k.circleRing(x, y, 1.4, 24).map(([px, py]) => [px, py, top]), "carry-glass"));
    out.push(`<path class="carry-glint" d="${poly(topArc(x, y, 4.9, top, Math.PI * 1.05, Math.PI * 1.45, 10))}"/>`);
    out.push(`<path class="carry-glint" style="opacity:.4" d="${poly(topArc(x, y, 3, top, Math.PI * 1.1, Math.PI * 1.35, 6))}"/>`);
    out.push({ live: fillPath(k.circleRing(x, y, 5.5, 48).map(([px, py]) => [px, py, top]), `live-glow ph-lens ph-lens-${LENSES.findIndex((l) => l.c === c)}`) });
  }

  // Flash, LiDAR and the rear mic.
  const FLASH = [-41, 4.2];
  out.push(S(k.cylinder(FLASH[0], FLASH[1], 2.9, Z, 0.4, P, 32), { tone: "mid" }));
  out.push(fillPath(k.circleRing(FLASH[0], FLASH[1], 2.3, 32).map(([px, py]) => [px, py, Z + 0.4]), "carry-face"));
  out.push(L(k.ring(FLASH[0], FLASH[1], 2.3, Z + 0.4, P, 32), { tone: "lo" }));
  out.push(L(k.ring(FLASH[0], FLASH[1], 1.3, Z + 0.4, P, 24), { tone: "faint" }));
  out.push({ live: fillPath(k.circleRing(FLASH[0], FLASH[1], 6, 32).map(([px, py]) => [px, py, Z + 0.4]), "live-glow ph-bloom") + fillPath(k.circleRing(FLASH[0], FLASH[1], 2.3, 32).map(([px, py]) => [px, py, Z + 0.4]), "live-glow ph-flash") });
  const LIDAR = [-41, 29.4];
  out.push(S(k.cylinder(LIDAR[0], LIDAR[1], 2.7, Z, 0.4, P, 32), { tone: "mid" }));
  out.push(fillPath(k.circleRing(LIDAR[0], LIDAR[1], 2.1, 32).map(([px, py]) => [px, py, Z + 0.4]), "carry-glass"));
  out.push(`<path class="carry-glint" style="opacity:.5" d="${poly(topArc(LIDAR[0], LIDAR[1], 1.5, Z + 0.4, Math.PI * 1.1, Math.PI * 1.5, 6))}"/>`);
  out.push(fillPath(k.circleRing(-52.6, 1.8, 0.55, 12).map(([px, py]) => [px, py, Z]), "carry-hole"));

  // ---- Back glass details: a faint MagSafe ring and the regulatory print ----
  out.push(L(k.ring(8, 0, 22, H, P, 72), { tone: "faint" }));
  out.push(L(k.ring(8, 0, 17, H, P, 64), { tone: "faint" }));
  out.push(L(k.lineOnTop([8, -27], [8, -24], H, P), { tone: "faint" }));
  for (const [y, len] of [[-10, 18], [-6, 12], [-2, 15]]) {
    out.push(L(k.lineOnTop([52, y], [52 + len * 0.6, y], H, P), { tone: "faint", free: true }));
  }

  return {
    width,
    height,
    label: "An isometric drawing of a phone lying face down on a display plinth, showing its camera plateau with three lenses, a flash and a LiDAR sensor, side buttons and the USB-C port.",
    body: out,
    css: `@keyframes ph-flash{0%,8%{opacity:0}10%,16%{opacity:1}19%,24%{opacity:.1}26%,34%{opacity:1}48%,100%{opacity:0}}
.ph-flash{fill:#fff6dc;animation:ph-flash 2.4s infinite}.ph-bloom{fill:#fff1c4;filter:blur(3px);animation:ph-flash 2.4s infinite}
@keyframes ph-lens{0%,100%{opacity:0}30%{opacity:.55}60%{opacity:0}}.ph-lens{animation:ph-lens 2.4s ease-in-out infinite}.ph-lens-1{animation-delay:.25s}.ph-lens-2{animation-delay:.5s}`,
  };
}
