// 04 — The original prototype Omnitrix, lying on its side in two cradles.
import { k, G, frame, pen, plinth } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -52, y: -48, w: 104, d: 96, r: 6 };
const R_OUT = 22, R_IN = 15.5, WIDTH = 32;
const ZC = R_OUT + 5; // band centre
const Z_TOP = ZC + R_OUT; // top of the band
const Z_DIAL = Z_TOP + 5; // the face

/** The hourglass: two black wedges, in the face's own plane (world units). */
function hourglass(r) {
  const wedge = (a0) => {
    const arc = Array.from({ length: 13 }, (_, i) => {
      const t = a0 - 0.62 + (1.24 * i) / 12;
      return [r * Math.cos(t), r * Math.sin(t)];
    });
    return [...arc, [Math.cos(a0) * 1.3, Math.sin(a0) * 1.3]];
  };
  return [wedge(Math.PI * 0.82), wedge(Math.PI * 1.82)].map((pts) => `M${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`).join("");
}

export function omnitrix() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [0, 0, Z_DIAL + 4], [0, 18, Z_DIAL]], { azimuth: 24 });
  const { S, L, D, at, fillPath, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "04" })];
  const steel = (markup) => tint("steel", markup);
  const green = (markup) => tint("green", markup);
  const pearl = (markup) => tint("pearl", markup);

  out.push(halo({ x: -18, y: -18, w: 36, d: 36, r: 8 }, 0, 0.4, 6));
  // Cradles under each edge of the band.
  for (const x of [-14, 8]) out.push(S(k.slabOf({ x, y: -10, w: 6, d: 20, r: 1.6 }, 0, 9, P, 3, 0.4), { tone: "mid" }));

  // ---- Band: a thick strap ring lying across x, panelled -------------------------
  const BAND = G.frameOf([-WIDTH / 2, 0, ZC], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(steel(S(G.ringBand(0, WIDTH, R_IN, R_OUT, BAND, P), { tone: "hi", crease: "lo" })));
  out.push(steel(L([5, 27].map((s) => G.arcOf(BAND, s, R_OUT, P, { least: 0.1 })).join(""), { tone: "lo" })));
  // The bore at the near end: a dark opening, the inner wall's far rim showing.
  out.push(`<path class="carry-hole" d="${G.circleOf(BAND, WIDTH + 0.05, R_IN, P)}"/>`);
  out.push(steel(L(G.arcOf(BAND, 6, R_IN, P, { inward: true }), { tone: "faint" }) + L(G.circleOf(BAND, WIDTH + 0.05, R_IN, P), { tone: "mid" })));
  out.push(steel(k.fadedSvg(G.ribsOf(BAND, 5, 27, R_OUT, 14, P, { fade: [0.12, 0.5], phase: 0.1 }), { tone: "faint" })));

  // White clamps gripping the band either side of the dial.
  for (const sx of [-1, 1]) {
    const C = { x: sx > 0 ? 11 : -17, y: -15, w: 6, d: 30, r: 2.6 };
    out.push(pearl(S(k.slabOf(C, Z_TOP - 4, 5, P, 4, 0.5), { tone: "hi" })));
  }

  // ---- Dial housing, bezel with four keys, and the face --------------------------------
  const D0 = G.frameOf([0, 0, Z_TOP - 3], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(steel(S(G.disc(0, 6, 15, D0, P), { tone: "hi", crease: "lo" })));
  out.push(steel(S(G.solidOf([[6, 15], [7.4, 13.6], [7.4, 0]], D0, P), { tone: "hi", crease: "lo" })));
  out.push(steel(k.fadedSvg(G.ribsOf(D0, 0, 6, 15, 60, P, { fade: [0.1, 0.5] }), { tone: "faint" })));
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const ring = k.circleRing(Math.cos(a) * 11.6, Math.sin(a) * 11.6, 1.5, 16);
    out.push(fillPath(ring.map(([x, y]) => [x, y, Z_TOP + 4.5]), "wl-c-time"));
  }
  out.push(fillPath(k.circleRing(0, 0, 9.6, 48).map(([x, y]) => [x, y, Z_TOP + 4.5]), "carry-hole"));
  out.push(green(S(G.disc(4.4, 5, 8.6, D0, P), { tone: "hi", crease: "none" })));
  const face = k.topMatrix([0, 0], Z_TOP + 5.1, P, "x");
  const glass = `<path class="carry-hole" d="${hourglass(8.4)}"/>`;
  out.push({
    still: `<g transform="${face}">${glass}</g>`,
    live: `<g transform="${face}"><g><animateTransform attributeName="transform" type="rotate" values="0;0;90;90;0;0" keyTimes="0;.2;.35;.7;.85;1" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0 0 1 1;.4 0 .2 1;0 0 1 1;.4 0 .2 1;0 0 1 1"/>${glass}</g><circle class="wl-c-time om-flash" r="8.6"/></g>`,
  });
  out.push(green(L(k.ring(0, 0, 8.6, Z_TOP + 5.1, P, 48), { tone: "hi" })));

  // ---- The side button, facing us under the dial ---------------------------------------
  const n = G.unit3([0.62, 0.62, 0.48]);
  const BTN = G.frameAlong([n[0] * (R_OUT - 1.4), n[1] * (R_OUT - 1.4), ZC + n[2] * (R_OUT - 1.4)], n);
  out.push(steel(S(G.disc(0, 2.6, 4.8, BTN, P), { tone: "hi" })));
  out.push(`<path class="wl-c-time" d="${G.circleOf(BTN, 2.7, 3, P)}"/>`);
  out.push(D([at(G.pointOf(BTN, 2.8, 1.4, 2.2))], { size: 0.5, tone: "hi" }));

  return {
    width,
    height,
    label: "An isometric drawing of the original prototype Omnitrix lying in two cradles on a display plinth: a thick panelled strap, white clamps, a knurled dial with four green keys, the green face with its black hourglass, and a green side button.",
    body: out,
    css: `@keyframes om-flash{0%,84%{opacity:0}88%{opacity:.9}100%{opacity:0}}.om-flash{opacity:0;animation:om-flash 4s ease-out infinite}`,
  };
}
