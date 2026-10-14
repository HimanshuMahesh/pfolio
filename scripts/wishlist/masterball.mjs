// 07 — A Master Ball resting on a turned display cradle.
import { k, G, frame, pen, plinth } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -46, y: -46, w: 92, d: 92, r: 6 };
const R = 26; // ball radius
const SEAT = 12; // radius of the cradle's lip the ball rests on
const Z_LIP = 11;
const ZC = Z_LIP + Math.sqrt(R * R - SEAT * SEAT); // ball centre
const AZ = 45;

export function masterball() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [0, 0, ZC + R + 4], [-R, R, ZC], [R, -R, ZC]], { azimuth: AZ });
  const { S, L, D, at, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "07" })];
  const toward = (Math.PI * AZ) / 180; // the floor direction that faces the viewer
  const scale = G.scaleOf(P);
  const C = at([0, 0, ZC]);
  const rho = R * scale; // the sphere's silhouette radius on screen

  // ---- Cradle: a turned stand with a flared lip -----------------------------
  out.push(halo({ x: -16, y: -16, w: 32, d: 32, r: 16 }, 0, 0.4, 5));
  const STAND = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(S(G.disc(0, 2.6, 16, STAND, P), { tone: "lo" }));
  out.push(S(G.solidOf([[2.6, 12.6], [3.4, 11.4, 1], [6, 9.2, 1], [8.6, 10.2, 1], [Z_LIP, 13.4]], STAND, P), { tone: "mid" }));
  out.push(L(G.arcOf(STAND, 1.3, 16, P), { tone: "faint" }));
  out.push(D(G.dotsOf(STAND, 2.6, 13.6, 12, P, { fade: [0.04, 0.42] }), { size: 0.4, tone: "lo" }));

  // ---- Shell: one sphere, painted twice and clipped at the seam -------------
  // The visible seam is the near half of the equator; its ends sit on the silhouette.
  const equator = (z, from, to, steps = 48) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = from + ((to - from) * i) / steps;
      return at([R * Math.cos(t), R * Math.sin(t), z]);
    });
  const front = equator(ZC, toward - Math.PI / 2, toward + Math.PI / 2);
  const arcTo = (a, b, over) => {
    // the silhouette circle from screen point a to b, over the top (over) or under the bottom
    let t0 = Math.atan2(a[1] - C[1], a[0] - C[0]);
    let t1 = Math.atan2(b[1] - C[1], b[0] - C[0]);
    if (over) while (t1 > t0) t1 -= Math.PI * 2;
    else while (t1 < t0) t1 += Math.PI * 2;
    return Array.from({ length: 41 }, (_, i) => {
      const t = t0 + ((t1 - t0) * i) / 40;
      return [C[0] + rho * Math.cos(t), C[1] + rho * Math.sin(t)];
    });
  };
  const half = (over) => k.pathOf([...front, ...arcTo(front[front.length - 1], front[0], over)], true);
  const ball = S(G.sphereOf([0, 0, ZC], R, P), { tone: "hi", crease: "none" });
  const shell = [
    `<clipPath id="mb-top"><path d="${half(true)}"/></clipPath><clipPath id="mb-bottom"><path d="${half(false)}"/></clipPath>`,
    `<g clip-path="url(#mb-top)">${tint("pearl", ball)}</g>`,
    `<g clip-path="url(#mb-bottom)">${tint("purple", ball)}</g>`,
  ];

  // The black seam band, as wide as the button housing's collar.
  const band = (dz) => equator(ZC + dz, toward - Math.PI / 2, toward + Math.PI / 2);
  const up = band(1.9), down = band(-1.9);
  shell.push(`<path class="carry-hole" d="${k.pathOf([...up, ...down.reverse()], true)}"/>`);
  shell.push(L(k.pathOf(up), { tone: "lo" }), L(k.pathOf(band(-1.9)), { tone: "lo" }));

  // ---- Bumps: the two raised pink pads either side of the crown ---------------
  const onBall = (lat, lon, lift = 0) => {
    const n = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
    return { n, p: [n[0] * (R + lift), n[1] * (R + lift), ZC + n[2] * (R + lift)] };
  };
  const bumps = [-1, 1]
    .map((side) => onBall(0.62, toward + side * 1.15, -1.2))
    .sort((a, b) => k.depthOf(a.p, P) - k.depthOf(b.p, P));
  for (const { n, p } of bumps) {
    const F = G.frameAlong(p, n);
    shell.push(tint("pink", S(G.solidOf([[0, 8.6], [1.4, 8.4, 1], [2.8, 6.6, 1], [3.6, 3.4, 1], [3.9, 0]], F, P), { tone: "hi", crease: "none" })));
  }

  // ---- The M, raised on the front of the cap ---------------------------------
  const glyph = [[-5.6, -3.6], [-5.6, 3.8], [0, -1.2], [5.6, 3.8], [5.6, -3.6]];
  const lon = toward, lat0 = 0.42;
  const e1 = [-Math.sin(lon), Math.cos(lon), 0];
  const mark = glyph.map(([u, v]) => {
    const lat = lat0 + v / R;
    const base = [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)];
    const d = [base[0] + (e1[0] * u) / R, base[1] + (e1[1] * u) / R, base[2]];
    const m = Math.hypot(...d);
    return at([(d[0] / m) * (R + 0.3), (d[1] / m) * (R + 0.3), ZC + (d[2] / m) * (R + 0.3)]);
  });
  shell.push(`<path class="wl-mark" style="stroke-width:${(2.4 * scale).toFixed(2)}" d="${k.pathOf(mark)}"/>`);

  // ---- Button: a dark collar and the white push button at the seam -----------
  const n0 = [Math.cos(toward), Math.sin(toward), 0];
  const BTN = G.frameAlong([n0[0] * (R - 2), n0[1] * (R - 2), ZC], n0);
  shell.push(S(G.disc(0, 2.9, 7.4, BTN, P), { tone: "lo" }));
  shell.push(tint("pearl", S(G.disc(2.9, 3.9, 5.2, BTN, P), { tone: "hi" }) + L(G.circleOf(BTN, 3.9, 3.2, P), { tone: "mid" })));
  const glow = `<path class="live-glow mb-glow" d="${G.circleOf(BTN, 4, 4.6, P)}"/>`;

  // A glint across the purple cap.
  const g = Array.from({ length: 16 }, (_, i) => {
    const t = -2.35 + i * 0.045;
    return [C[0] + rho * 0.82 * Math.cos(t), C[1] + rho * 0.82 * Math.sin(t)];
  });
  shell.push(`<path class="carry-glint" d="${k.pathOf(g)}"/>`);

  // Live: the ball rocks on its cradle three times, then the button blinks: caught.
  const pivot = at([0, 0, Z_LIP]);
  const body = shell.join("");
  out.push({
    still: body,
    live: `<g class="mb-rock" style="transform-origin:${pivot[0].toFixed(1)}px ${pivot[1].toFixed(1)}px">${body}${glow}</g>`,
  });

  return {
    width,
    height,
    label: "An isometric drawing of a Master Ball on a turned display cradle: purple upper shell with two raised pink pads and an M, a white lower shell, the black seam band and the white push button.",
    body: out,
    css: `@keyframes mb-rock{0%,8%,62%,100%{transform:none}14%{transform:rotate(-9deg)}22%{transform:rotate(7deg)}30%{transform:rotate(0)}38%{transform:rotate(-6deg)}46%{transform:rotate(4deg)}54%{transform:rotate(0)}}
.mb-rock{animation:mb-rock 3.6s cubic-bezier(.4,0,.3,1) infinite;transform-box:view-box}
@keyframes mb-glow{0%,62%{opacity:0}66%{opacity:.95}72%{opacity:.2}76%{opacity:.95}92%,100%{opacity:0}}
.mb-glow{fill:#fff;animation:mb-glow 3.6s ease-in-out infinite}`,
  };
}
