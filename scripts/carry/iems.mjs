// 03 — A pair of in-ear monitors on a braided cable: Y-split, chin slider, plug.
import { k, G, frame, pen, plinth } from "./lib.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";

const PLATE = { x: -72, y: -42, w: 144, d: 108, r: 6 };
const SHELL_H = 9;
const FACE_H = 2.6;
const CABLE_R = 1.15;

/** A rounded bean outline for the shell, mirrored for the left ear. */
function shellRing(cx, cy, mirror) {
  const pts = [];
  const n = 72;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = 1 + 0.2 * Math.cos(2 * t - 0.5) + 0.08 * Math.cos(3 * t + 0.4);
    const x = Math.cos(t) * 16.5 * r;
    const y = Math.sin(t) * 13 * r;
    pts.push([cx + (mirror ? -x : x), cy + y]);
  }
  return mirror ? pts.reverse() : pts;
}

export function iems() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [-60, -14, 16], [60, -14, 16]], { azimuth: 42 });
  const { S, L, D, at, poly, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "03", label: "front-left" })];
  const items = [];
  const put = (point, svg, bias = 0) => items.push({ key: k.depthOf(point, P) + bias, svg });

  // ---- Shells -----------------------------------------------------------------
  const ear = (cx, cy, mirror) => {
    const sign = mirror ? -1 : 1;
    const ring = shellRing(cx, cy, mirror);
    const svg = [halo({ x: cx - 17, y: cy - 13, w: 34, d: 26, r: 12 }, 0, 0.3, 5)];
    // Nozzle and eartip pointing outward along ±x, drawn with the shell in the right order.
    const N = G.frameOf([cx + sign * 17.2, cy - 2, 6.8], [sign, 0, 0], [0, 1, 0], [0, 0, 1]);
    const nozzle = [
      S(G.disc(0, 4.2, 2.7, N, P), { tone: "mid" }),
      S(G.solidOf([[3.4, 2.9], [4.2, 4.6, 1], [6.4, 6.2, 1], [9.4, 6.5, 1], [11.2, 5.3, 1], [12.2, 3.2, 1], [12.4, 2.6]], N, P, { steps: 64 }), { tone: "hi", crease: "lo" }),
      L(G.arcOf(N, 9.4, 6.5, P, { least: 0.1 }), { tone: "faint" }),
      `<path class="carry-hole" d="${G.circleOf(N, 12.4, 1.4, P)}"/>`,
    ].join("");
    const shell = [
      S(k.extrude(ring, 0.6, SHELL_H - 0.6, P, { bevel: 0.8 }), { tone: "mid", inner: L(k.ringSeam(ring, 2.4, P), { tone: "faint" }) }),
    ];
    // Faceplate: an inset cap with a guilloché of rings, a badge and two vents.
    const faceRing = ring.map(([x, y]) => [cx + (x - cx) * 0.9, cy + (y - cy) * 0.9]);
    shell.push(S(k.extrude(faceRing, SHELL_H, FACE_H, P, { bevel: 0.6 }), { tone: "hi", crease: "lo" }));
    const zf = SHELL_H + FACE_H;
    for (const s of [0.74, 0.58, 0.42]) {
      shell.push(L(k.onTop(faceRing.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]), zf, P, true), { tone: s === 0.74 ? "lo" : "faint" }));
    }
    shell.push(L(k.ring(cx - sign * 1, cy, 2.4, zf, P, 28), { tone: "mid" }));
    shell.push(D([at([cx - sign * 1, cy, zf])], { size: 0.7, tone: "hi" }));
    shell.push({ live: `<g class="iem-badge">${L(k.ring(cx - sign * 1, cy, 2.4, zf, P, 28), { tone: "lit" })}</g>` });
    shell.push(D([at([cx + sign * 6, cy - 5.4, zf]), at([cx + sign * 7.6, cy - 4, zf])], { size: 0.5, tone: "lo" }));
    // Two-pin socket on the near edge, the cable's connector seated on it.
    const sock = { x: cx - sign * 4 - 3.2, y: cy + 12.2, w: 6.4, d: 3.6, r: 1.2 };
    shell.push(S(k.slabOf(sock, SHELL_H - 0.4, FACE_H + 0.4, P, 3), { tone: "lo" }));
    const pick = (mode) => shell.map((p) => (typeof p === "string" ? p : p[mode] ?? "")).join("");
    return { ring, nozzle, shell: { still: pick("still"), live: pick("live") }, svg: svg.join(""), sock, N };
  };
  const left = ear(-30, -14, true);
  const right = ear(30, -14, false);
  // The left nozzle points away from us (behind its shell); the right one toward us.
  put([-30, -14, 0], { still: left.svg + left.nozzle + left.shell.still, live: left.svg + left.nozzle + left.shell.live }, -40);
  put([30, -14, 0], { still: right.svg + right.shell.still, live: right.svg + right.shell.live }, -40);
  put([54, -16, 6.8], right.nozzle, -40);
  // Live: sound rings leaving the right eartip, in the plane across the nozzle.
  const rings = [0, 1, 2].map((i) => `<path class="live-ring iem-ring" style="animation-delay:${i * 0.6}s" d="${G.circleOf(right.N, 14 + i * 0.01, 4.2, P)}"/>`).join("");
  put([70, -16, 6.8], { live: rings }, 30);

  // ---- Cable: two ear legs from the connectors to the Y-split, then the main run to the plug ----
  const connector = (sock) => {
    const x = sock.x + sock.w / 2;
    const F = G.frameOf([x, sock.y + sock.d, SHELL_H + 1], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    return { F, tip: [x, sock.y + sock.d + 7, SHELL_H + 1], svg: [S(G.solidOf([[0, 2.6], [5, 2.6], [7, 1.6]], F, P, { steps: 40 }), { tone: "mid" }), L(G.arcOf(F, 3, 2.6, P), { tone: "faint" })].join("") };
  };
  const cL = connector(left.sock);
  const cR = connector(right.sock);
  put(cL.tip, cL.svg, -20);
  put(cR.tip, cR.svg, -20);

  const Y = [0, 34];
  const legL = G.fillet([cL.tip, [cL.tip[0], cL.tip[1] + 8, CABLE_R + 4], [cL.tip[0] + 4, cL.tip[1] + 16, CABLE_R], [-10, 26, CABLE_R], [-2.4, Y[1] - 4, CABLE_R]], 8, 8);
  const legR = G.fillet([cR.tip, [cR.tip[0], cR.tip[1] + 8, CABLE_R + 4], [cR.tip[0] - 4, cR.tip[1] + 16, CABLE_R], [10, 26, CABLE_R], [2.4, Y[1] - 4, CABLE_R]], 8, 8);
  const main = G.fillet([[0, Y[1] + 6, CABLE_R * 1.3], [0, 44, CABLE_R * 1.3], [0, 52, CABLE_R * 1.3], [8, 58, CABLE_R * 1.3], [16, 58, CABLE_R * 1.3], [24, 58, 4.2]], 8, 8);
  const braid = { pitch: 2, twist: 1.2, cross: true, tone: "lo" };
  const cable = (points, r, gaps = []) => {
    for (const piece of tubePieces(points, r, P, { maxLength: 10, gaps, rings: braid })) put(piece.mid, tubeSvg(piece, { tone: "mid" }));
  };
  cable(legL, CABLE_R);
  cable(legR, CABLE_R);
  // Chin slider gaps the main run at s ≈ 10.
  cable(main, CABLE_R * 1.3, [[9, 13]]);

  // Y-split: a turned barrel lying along y.
  const YF = G.frameOf([0, Y[1] - 5, 3], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  put([0, Y[1], 3], [S(G.solidOf([[0, 2.2], [1.6, 3, 1], [8.4, 3, 1], [11, 1.9]], YF, P, { steps: 48 }), { tone: "hi", crease: "lo" }), L(G.arcOf(YF, 5, 3, P), { tone: "faint" })].join(""), 2);
  // Chin slider: a small bead on the main run.
  const sl = G.pointAlong(main, 11);
  const SF = G.frameOf([sl[0], sl[1] - 2, sl[2]], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  put(sl, S(G.solidOf([[0, 1.6], [0.8, 2.4, 1], [3.2, 2.4, 1], [4, 1.6]], SF, P, { steps: 40 }), { tone: "hi", crease: "lo" }), 2);

  // Plug: strain relief, knurled barrel, collar, the jack pin with insulator rings.
  const end = main[main.length - 1];
  const PF = G.frameOf(end, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const plug = [
    S(G.solidOf([[0, 1.9], [5, 2.8, 1], [8, 3.4], [8, 0]], PF, P, { steps: 40 }), { tone: "mid" }),
    S(G.disc(8, 22, 4.2, PF, P, { steps: 56 }), { tone: "hi", crease: "lo" }),
    k.fadedSvg(G.ribsOf(PF, 10, 18, 4.2, 48, P, { fade: [0.1, 0.55] }), { tone: "lo" }),
    L(G.arcOf(PF, 10, 4.2, P), { tone: "faint" }),
    L(G.arcOf(PF, 18, 4.2, P), { tone: "faint" }),
    S(G.disc(22, 24, 3, PF, P), { tone: "mid" }),
    S(G.solidOf([[24, 1.75], [33.2, 1.75], [33.8, 1.4, 1], [35, 1.75, 1], [36.2, 0.6, 1], [36.6, 0]], PF, P, { steps: 32 }), { tone: "hi", crease: "lo", lit: true }),
    L(G.arcOf(PF, 28, 1.75, P), { tone: "lo" }),
    L(G.arcOf(PF, 31, 1.75, P), { tone: "lo" }),
  ].join("");
  put([42, 58, 4.2], plug, 6);
  out.push(halo({ x: 26, y: 54, w: 36, d: 8, r: 4 }, 0, 0.2, 3));

  items.sort((a, b) => a.key - b.key);
  out.push(...items.map((it) => it.svg));


  return {
    width,
    height,
    label: "An isometric drawing of a pair of custom in-ear monitors on a display plinth: shells with patterned faceplates and silicone eartips, two-pin connectors, a braided cable through a Y-split and chin slider to a knurled 3.5 mm plug.",
    body: out,
    css: `@keyframes iem-ring{0%{opacity:0;transform:scale(1)}12%{opacity:.9}100%{opacity:0;transform:scale(3.2)}}.iem-ring{animation:iem-ring 1.8s cubic-bezier(.2,.6,.3,1) infinite}
@keyframes iem-badge{0%,100%{opacity:.15}50%{opacity:1}}.iem-badge{animation:iem-badge .9s ease-in-out infinite}`,
  };
}
