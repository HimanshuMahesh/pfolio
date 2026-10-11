// 04 — A handheld console lying flat, Joy-Cons attached, top edge facing us.
import { k, frame, pen, plinth, faceRect, faceCircle, topArc } from "./lib.mjs";

const PLATE = { x: -140, y: -70, w: 280, d: 140, r: 7 };
const H = 14;
const TAB = { x: -86.5, y: -51, w: 173, d: 102 };
const JL = { x: -122, y: -51, w: 35.5, d: 102 };
const JR = { x: 86.5, y: -51, w: 35.5, d: 102 };
const TOP = TAB.y + TAB.d; // the top edge, facing +y

/** A rectangle ring with its own radius per corner: [x0y0, x1y0, x1y1, x0y1]. */
function cornered({ x, y, w, d }, [r0, r1, r2, r3], steps = 10) {
  const out = [];
  const arc = (cx, cy, r, a0) => {
    const n = r > 0.01 ? steps : 1;
    for (let i = 0; i < n; i++) {
      const t = a0 + (Math.PI / 2) * (n === 1 ? 0.5 : i / (n - 1));
      out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  };
  arc(x + r0, y + r0, r0, Math.PI);
  arc(x + w - r1, y + r1, r1, Math.PI * 1.5);
  arc(x + w - r2, y + d - r2, r2, 0);
  arc(x + r3, y + d - r3, r3, Math.PI / 2);
  return out;
}

export function nswitch() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), ...k.boxCorners({ ...JL, x: -122, w: 244 }, 0, H + 6)], { azimuth: 36 });
  const { S, L, D, at, poly, fillPath, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "04" })];
  out.push(halo({ x: -118, y: -47, w: 236, d: 94, r: 16 }, 0, 0.5, 7));

  // ---- Shells: left Joy-Con, tablet, right Joy-Con (left to right is back to front here) ----
  const ringL = cornered(JL, [17, 0.6, 0.6, 17]);
  const ringR = cornered(JR, [0.6, 17, 17, 0.6]);
  const ringT = cornered(TAB, [2, 2, 2, 2], 4);
  out.push(S(k.extrude(ringL, 0, H, P, { bevel: 0.8 }), { tone: "mid", inner: L(k.ringSeam(ringL, 2, P), { tone: "faint" }) }));
  out.push(S(k.extrude(ringT, 0.4, H - 0.8, P, { bevel: 0.5 }), { tone: "mid" }));

  // Tablet top edge (+y face): vents, game card flap, headphone jack, power and volume buttons.
  for (let i = 0; i < 14; i++) {
    const x0 = -70 + i * 4.2;
    out.push(L(poly(faceRect("y", TOP, x0, x0 + 2.2, 4, 10, 1.1, 3), true), { tone: "lo" }));
  }
  const flap = faceRect("y", TOP, 10, 42, 3.6, 10.4, 1.4);
  out.push(L(poly(flap, true), { tone: "lo" }), L(poly([[12, TOP, 7], [40, TOP, 7]]), { tone: "faint" }));
  out.push(D([at([26, TOP, 9.2])], { size: 0.5, tone: "mid" }));
  out.push(fillPath(faceCircle("y", TOP, 52, 7, 1.9, 20), "carry-hole"), L(poly(faceCircle("y", TOP, 52, 7, 2.6, 24), true), { tone: "lo" }));
  for (const [x0, w] of [[60, 6], [70, 5.5], [77, 5.5]]) {
    out.push(S(k.slabOf({ x: x0, y: TOP - 0.4, w, d: 1.4, r: 0.6 }, 5.2, 3.6, P, 3), { tone: "mid" }));
  }

  // Display glass on the tablet face.
  const ZT = H - 0.4;
  const glass = cornered({ x: TAB.x + 1.2, y: TAB.y + 1.2, w: TAB.w - 2.4, d: TAB.d - 2.4 }, [1.2, 1.2, 1.2, 1.2], 3);
  out.push(fillPath(glass.map(([x, y]) => [x, y, ZT]), "carry-glass-2"));
  const SCREEN = { x: -69, y: -39, w: 138, d: 78, r: 0.8 };
  out.push(fillPath(k.ringOf(SCREEN, 2).map(([x, y]) => [x, y, ZT]), "carry-glass"));
  // Live: the screen wakes to a dark blue glow, lit from the top and a soft sheen drifting across.
  {
    const plane = k.topMatrix([0, 0], ZT, P, "x");
    const W = SCREEN.w / 2, Hh = SCREEN.d / 2;
    const scene = `<g class="sw-screen" transform="${plane}">
      <defs>
        <linearGradient id="sw-sky" x1="0" y1="${-Hh}" x2="0" y2="${Hh}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#16346f"/><stop offset=".55" stop-color="#0c1b45"/><stop offset="1" stop-color="#060d24"/></linearGradient>
        <radialGradient id="sw-bloom" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#3f6fd6" stop-opacity=".55"/><stop offset="1" stop-color="#3f6fd6" stop-opacity="0"/></radialGradient>
        <clipPath id="sw-clip"><rect x="${-W}" y="${-Hh}" width="${2 * W}" height="${2 * Hh}" rx="0.8"/></clipPath>
      </defs>
      <rect x="${-W}" y="${-Hh}" width="${2 * W}" height="${2 * Hh}" rx="0.8" fill="url(#sw-sky)"/>
      <rect x="${-W}" y="${-Hh}" width="${2 * W}" height="${2 * Hh}" fill="url(#sw-bloom)"/>
      <g clip-path="url(#sw-clip)"><path class="sw-sheen" d="M-30 ${-Hh - 4}L-6 ${-Hh - 4}L-36 ${Hh + 4}L-60 ${Hh + 4}Z" fill="#9fc0ff"/></g>
    </g>`;
    out.push({ live: scene });
  }
  out.push(L(k.planOutline(SCREEN, ZT, P, 2), { tone: "lo" }));
  out.push(L(k.onTop(glass, ZT, P, true), { tone: "lo" }));
  // Glints across the screen: three parallel diagonal strokes inside the display.
  for (const [a, b, o] of [[[-60, -39], [-10, 39], 0.9], [[-50, -39], [0, 39], 0.45], [[22, -39], [72, 39], 0.3]]) {
    out.push(`<path class="carry-glint" style="opacity:${o}" d="${k.lineOnTop([a[0] + 2, a[1] + 1.5], [b[0] - 2, b[1] - 1.5], ZT, P)}"/>`);
  }
  // Front camera-free bezel details: light sensor and the logo-free speaker slits at the bezel ends.
  out.push(fillPath(k.circleRing(0, -45, 0.9, 12).map(([x, y]) => [x, y, ZT]), "carry-hole"));

  // ---- Left Joy-Con controls ------------------------------------------------
  const ZJ = H;
  const stick = (x, y) => {
    out.push(S(k.cylinder(x, y, 9.6, ZJ, 0.5, P, 48), { tone: "lo" }));
    out.push(L(k.ring(x, y, 8.6, ZJ + 0.5, P, 48), { tone: "faint" }));
    out.push(S(k.cylinder(x, y, 3.2, ZJ + 0.5, 2.2, P, 20), { tone: "lo", crease: "none" }));
    out.push(S(k.cylinder(x, y, 7.6, ZJ + 2.7, 1.2, P, 48), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 7.2, ZJ + 3.9, 1.4, P, 48, 0.5), { tone: "hi", crease: "lo" }));
    out.push(L(k.knurl(x, y, 7.2, ZJ + 4, ZJ + 5.2, 44, P, 0.2), { tone: "lo" }));
    out.push(L(k.ring(x, y, 5.6, ZJ + 5.3, P, 40), { tone: "lo" }));
    out.push(L(k.ring(x, y, 3.6, ZJ + 5.3, P, 32), { tone: "faint" }));
    out.push(L(k.ring(x, y, 1.6, ZJ + 5.3, P, 24), { tone: "faint" }));
  };
  const button = (x, y, r = 3.5, lit = false) => {
    out.push(L(k.ring(x, y, r + 0.7, ZJ, P, 28), { tone: "faint" }));
    const cap = S(k.cylinder(x, y, r, ZJ, 1.6, P, 28, 0.4), { tone: "hi", crease: "lo", lit });
    out.push(lit ? { still: cap, live: `<g class="sw-press">${cap}</g>` } : cap);
  };
  const diamond = (cx, cy, lit) => {
    const pts = [[cx, cy + 8.2], [cx - 8.2, cy], [cx + 8.2, cy], [cx, cy - 8.2]];
    pts.sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)).forEach(([x, y]) => button(x, y, 3.5, lit && x === cx && y === cy + 8.2));
  };

  // L and R shoulder buttons: a seam round the outer top corner of each Joy-Con, ending on its edges.
  const shoulder = (sign) => {
    const cx = sign * (122 - 17), cy = TOP - 17;
    const arc = topArc(cx, cy, 12, ZJ, sign < 0 ? Math.PI : 0, Math.PI / 2, 16);
    const edge = sign * 122, bar = sign * (122 - 27);
    out.push(L(poly([[edge, cy, ZJ], ...arc, [bar, TOP - 5, ZJ], [bar, TOP, ZJ]]), { tone: "faint" }));
  };
  shoulder(-1);

  diamond(-104, -12);
  stick(-104, 20);
  // Minus, capture.
  out.push(S(k.slabOf({ x: -96.5, y: 39.2, w: 5, d: 1.6, r: 0.6 }, ZJ, 1, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: -101.4, y: -36.4, w: 5.6, d: 5.6, r: 1 }, ZJ, 1.1, P, 3), { tone: "mid" }));
  out.push(L(k.ring(-98.6, -33.6, 1.7, ZJ + 1.1, P, 20), { tone: "faint" }));
  // Rail release line and player LEDs on the inner edge.
  out.push(L(k.lineOnTop([JL.x + JL.w - 2.4, -44], [JL.x + JL.w - 2.4, 44], ZJ, P), { tone: "faint" }));
  out.push(D([-6, -2, 2, 6].map((y) => at([JL.x + JL.w - 4.6, y, ZJ])), { size: 0.5, tone: "lo" }));

  // ---- Right Joy-Con: shell, then its controls ------------------------------
  out.push(S(k.extrude(ringR, 0, H, P, { bevel: 0.8 }), { tone: "mid", inner: L(k.ringSeam(ringR, 2, P), { tone: "faint" }) }));
  out.push(L(k.lineOnTop([JR.x + 2.4, -44], [JR.x + 2.4, 44], ZJ, P), { tone: "faint" }));
  shoulder(1);
  // Plus, home.
  out.push(S(k.slabOf({ x: 91.5, y: 39.2, w: 5, d: 1.6, r: 0.6 }, ZJ, 1, P, 2), { tone: "hi" }));
  out.push(S(k.slabOf({ x: 93.2, y: 37.5, w: 1.6, d: 5, r: 0.6 }, ZJ, 1, P, 2), { tone: "hi" }));
  out.push(L(k.ring(98.6, -33.6, 3.8, ZJ, P, 28), { tone: "faint" }));
  out.push(S(k.cylinder(98.6, -33.6, 3, ZJ, 1.1, P, 28, 0.3), { tone: "mid" }));
  out.push(L(k.ring(98.6, -33.6, 1.6, ZJ + 1.1, P, 20), { tone: "lo" }));
  stick(104, -12);
  diamond(104, 20, true);

  return {
    width,
    height,
    label: "An isometric drawing of a handheld game console lying on a display plinth, with both controllers attached: analog sticks, face buttons, plus and minus buttons, the screen glass, and the vents, game-card flap and buttons on its top edge.",
    body: out,
    css: `.sw-screen{opacity:0;animation:sw-screen 4s ease-in-out infinite}
@keyframes sw-screen{0%{opacity:0}6%,92%{opacity:1}100%{opacity:0}}
.sw-sheen{opacity:.1;animation:sw-sheen 4s ease-in-out infinite}
@keyframes sw-sheen{0%,10%{transform:translateX(0)}70%,100%{transform:translateX(120px)}}
@keyframes sw-press{0%,100%{transform:none}2%,7%{transform:translateY(1.2px)}}.sw-press{animation:sw-press 4s cubic-bezier(.3,.7,0,1) infinite}`,
  };
}
