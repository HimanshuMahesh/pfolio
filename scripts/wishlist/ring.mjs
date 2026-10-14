// 03 — The Green Lantern ring, standing in an open ring box.
import { k, G, frame, pen, plinth, faceRect } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -50, y: -46, w: 100, d: 92, r: 6 };
const BOX = { x: -30, y: -24, w: 60, d: 48, r: 5 };
const Z_BOX = 20; // top of the box's base
const Z_PAD = Z_BOX + 5; // top of the cushions
const R_OUT = 13, R_IN = 10.4, BAND = 8;
const ZC = Z_PAD + R_OUT - 6; // ring centre: its foot sits down in the slit

export function ring() {
  const zs = ZC + R_OUT + 6;
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [-30, -31, 74], [30, -31, 74], [0, 0, zs]], { azimuth: 45 });
  const { S, L, at, fillPath, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "03" })];
  const green = (markup) => tint("green", markup);
  const gold = (markup) => tint("gold", markup);
  const steel = (markup) => tint("steel", markup);

  out.push(halo(BOX, 0, 1, 7));

  // ---- Lid, open on its hinge: the satin panel faces us ----------------------
  const LID = { x: -30, y: -31, w: 60, d: 7, r: 3 };
  out.push(S(k.slabOf(LID, Z_BOX - 2, 54, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.pathOf(faceRect("y", LID.y + LID.d, -25, 25, Z_BOX + 6, Z_BOX + 48, 3).map(at), true), { tone: "faint" }));
  out.push(L(k.pathOf(faceRect("y", LID.y + LID.d, -21, 21, Z_BOX + 10, Z_BOX + 44, 2).map(at), true), { tone: "faint" }));
  // Hinge knuckles along the back edge.
  for (const x of [-18, 18]) {
    const F = G.frameOf([x - 4, LID.y + LID.d - 1, Z_BOX - 1], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
    out.push(gold(S(G.disc(0, 8, 1.8, F, P), { tone: "hi" })));
  }

  // ---- Base and cushions -----------------------------------------------------------
  out.push(S(k.slabOf(BOX, 0, Z_BOX, P, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(BOX, Z_BOX - 4, P, 6), { tone: "faint" }) }));
  out.push(gold(L(k.planOutline(k.insetPlan(BOX, 1.6), Z_BOX, P, 6), { tone: "mid" })));
  const BACK = { x: -27, y: -21, w: 54, d: 19, r: 6 };
  const FRONT_PAD = { x: -27, y: 2, w: 54, d: 19, r: 6 };
  out.push(S(k.slabOf(BACK, Z_BOX, Z_PAD - Z_BOX, P, 8, 1.2), { tone: "lo" }));

  // ---- The ring: a steel band, its foot in the slit ------------------------------------
  const RING = G.frameOf([0, -BAND / 2, ZC], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(steel(S(G.ringBand(0, BAND, R_IN, R_OUT, RING, P), { tone: "hi", crease: "lo" })));
  out.push(`<path class="carry-hole" d="${G.circleOf(RING, BAND + 0.05, R_IN, P)}"/>`);
  out.push(steel(L(G.arcOf(RING, 1.6, R_IN, P, { inward: true }), { tone: "faint" }) + L(G.circleOf(RING, BAND + 0.05, R_IN, P), { tone: "mid" })));

  // The front cushion covers the band's foot.
  out.push(S(k.slabOf(FRONT_PAD, Z_BOX, Z_PAD - Z_BOX, P, 8, 1.2), { tone: "lo" }));

  // ---- The signet: a gold seat, green inlay and the lantern between two bars -----------
  const zt = ZC + R_OUT - 2.4;
  const SEAT = { x: -11, y: -10, w: 22, d: 20, r: 2.4 };
  out.push(gold(S(k.slabOf(SEAT, zt, 4, P, 4, 0.5), { tone: "hi" })));
  const INLAY = k.insetPlan(SEAT, 1.6);
  out.push(green(S(k.slabOf(INLAY, zt + 4, 0.8, P, 3), { tone: "hi", crease: "none" })));
  const zf = zt + 4.8;
  for (const y of [-8.4, 4.9]) out.push(gold(S(k.slabOf({ x: -9.4, y, w: 18.8, d: 3.5, r: 0.8 }, zf, 1.3, P, 3, 0.3), { tone: "hi" })));
  // The lantern: a disc with ridges, pinched between curved sides.
  out.push(fillPath(k.circleRing(0, 0, 5.6, 40).map(([x, y]) => [x, y, zf + 0.1]), "wl-c-lantern"));
  out.push(green(L([2, 3.4, 4.6].map((r) => k.ring(0, 0, r, zf + 0.1, P, 32)).join(""), { tone: "mid" })));
  out.push(green(L(k.ring(0, 0, 5.6, zf + 0.1, P, 40), { tone: "hi" })));
  for (const s of [-1, 1]) {
    const side = Array.from({ length: 9 }, (_, i) => {
      const t = -1 + i / 4;
      return [s * (6.6 + 1.6 * (1 - t * t)), t * 4.9];
    });
    out.push(gold(L(k.onTop(side, zf + 0.1, P), { tone: "hi" })));
  }

  // Live: the lantern lights, and rings of light rise off it.
  const glow = fillPath(k.circleRing(0, 0, 9, 40).map(([x, y]) => [x, y, zf + 0.2]), "wl-c-lantern rg-glow");
  const rings = [0, 1, 2].map((i) => `<path class="rg-ring" style="animation-delay:${i * 0.55}s" d="${k.ring(0, 0, 6, zf + 0.3, P, 48)}"/>`).join("");
  out.push({ live: glow + rings });

  return {
    width,
    height,
    label: "An isometric drawing of the Green Lantern ring standing in an open ring box on a display plinth: a steel band set in the cushion slit, a gold signet with a green inlay and the lantern emblem between two bars.",
    body: out,
    css: `@keyframes rg-glow{0%,100%{opacity:.15}50%{opacity:.75}}.rg-glow{filter:blur(2.5px);animation:rg-glow 1.8s ease-in-out infinite}
@keyframes rg-ring{0%{opacity:0;transform:translateY(0) scale(1)}15%{opacity:.9}100%{opacity:0;transform:translateY(-26px) scale(2.2)}}
.rg-ring{fill:none;stroke:#3ddc6e;stroke-width:.9;opacity:0;transform-box:fill-box;transform-origin:center;animation:rg-ring 1.65s cubic-bezier(.2,.6,.3,1) infinite}`,
  };
}
