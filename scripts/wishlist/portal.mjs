// 05 — Rick's portal gun, standing on its grip with a rest under the body.
import { k, G, frame, pen, plinth, faceRect } from "../carry/lib.mjs";
import { tint } from "./palette.mjs";

const PLATE = { x: -78, y: -40, w: 140, d: 80, r: 6 };
const T = 10; // half the gun's thickness
const CAP = [-18, 0]; // x, y of the capsule's axis

/** Body profile in the x–z plane: a wedge, high at the back. */
const BODY = [[-34, 34], [30, 34], [40, 40], [40, 50], [-26, 58], [-36, 50]];

export function portal() {
  const { P, width, height } = frame([...k.boxCorners(PLATE, -8, 0), [CAP[0], 0, 98], [40, T, 50], [-62, T, 2]], { azimuth: 50 });
  const { S, L, D, at, halo } = pen(P);
  const out = [plinth(P, PLATE, { index: "05" })];
  const pearl = (markup) => tint("pearl", markup);
  const steel = (markup) => tint("steel", markup);
  const green = (markup) => tint("green", markup);
  const side = (x, z) => [x, T, z]; // a point on the +y face

  out.push(halo({ x: -60, y: -10, w: 100, d: 20, r: 8 }, 0, 0.6, 7));

  // ---- Rest: a post under the body --------------------------------------------
  const REST = G.frameOf([18, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(S(G.disc(0, 1.6, 8, REST, P), { tone: "lo" }));
  out.push(steel(S(G.solidOf([[1.6, 3.6], [32, 3], [34, 5.4]], REST, P), { tone: "hi" })));

  // ---- Grip: a rounded bar from under the body down to the plinth ----------------
  const dir = G.unit3([-0.62, 0, -0.78]);
  const GRIP = G.frameOf([-22, -T + 1.5, 38], [0, 1, 0], dir, G.cross3([0, 1, 0], dir));
  out.push(pearl(S(G.prismOf(GRIP, G.stadium(6.4, 5.4, 44), 0, 2 * T - 3, P), { tone: "hi" })));
  out.push(pearl(L(k.pathOf([0.2, 0.5, 0.8].map((t) => at([-22 + dir[0] * 44 * t + 0, T - 1.4, 38 + dir[2] * 44 * t]))), { tone: "faint" })));

  // ---- Body ---------------------------------------------------------------------------
  const BODYF = G.frameOf([0, -T, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(pearl(S(G.prismOf(BODYF, BODY, 0, 2 * T, P), { tone: "hi" })));
  // Panel seam round the body and screws at its corners.
  out.push(pearl(L(k.pathOf([[-31, 37], [27, 37], [36, 41]].map(([x, z]) => side(x, z)).map(at)), { tone: "lo" })));
  out.push(D([[-28, 54], [34, 47], [-30, 39]].map(([x, z]) => at(side(x, z))), { size: 0.45, tone: "mid" }));
  // The red switch, and the black dial at the grip.
  out.push(`<path class="wl-c-red" d="${k.pathOf(faceRect("y", T + 0.2, -6, 6, 42, 48, 0.8).map(at), true)}"/>`);
  out.push(L(k.pathOf(faceRect("y", T + 0.2, -6, 6, 42, 48, 0.8).map(at), true), { tone: "hi" }));
  const KNOB = G.frameOf([-24, T, 40], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  out.push(steel(S(G.disc(0, 4.4, 6.6, KNOB, P), { tone: "hi", crease: "lo" })));
  out.push(steel(k.fadedSvg(G.ribsOf(KNOB, 0, 4.4, 6.6, 28, P, { fade: [0.1, 0.5] }), { tone: "lo" })));
  // The emitter at the front.
  const EMIT = G.frameOf([40, 0, 45], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  out.push(steel(S(G.disc(0, 2.4, 4.6, EMIT, P), { tone: "hi" })));
  out.push(`<path class="wl-c-lantern" d="${G.circleOf(EMIT, 2.5, 2.6, P)}"/>`);

  // ---- Capsule: a collar and a glass tube of green fluid --------------------------------
  const zc = 56;
  const CAPF = G.frameOf([CAP[0], CAP[1], zc - 2], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  out.push(pearl(S(G.solidOf([[0, 9.6], [4.4, 9.6], [5.4, 8.4]], CAPF, P), { tone: "hi" })));
  const glass = G.solidOf([[5, 7.6], [30, 7.6, 1], [34.5, 6, 1], [37.4, 3, 1], [38.4, 0]], CAPF, P);
  out.push(green(S(glass, { tone: "hi" })));
  // Fluid tendrils inside the glass, and a glint down its side.
  const tendril = (phase) =>
    Array.from({ length: 14 }, (_, i) => {
      const s = 7 + i * 2;
      const a = phase + i * 0.55;
      return at(G.pointOf(CAPF, s, 4.2 * Math.abs(Math.sin(a)), a * 0.8 + 0.6));
    });
  const fluid = [0, 1.7, 3.3].map((p) => k.pathOf(tendril(p))).join("");
  out.push(green(L(fluid, { tone: "mid" })));
  out.push(`<path class="carry-glint" d="${k.pathOf([9, 16, 23, 29].map((s) => at(G.pointOf(CAPF, s, 7.4, G.angleToward(CAPF, [-0.2, 1, 0])))))}"/>`);

  // Live: the fluid swirls and the capsule and emitter glow.
  const glowGlass = `<path class="wl-c-lantern pg-glow" d="${glass.outline}"/>`;
  const swirl = `<path class="iso-line pg-swirl" data-tone="lit" d="${fluid}"/>`;
  const beam = `<path class="wl-c-lantern pg-glow" style="animation-delay:.4s" d="${G.circleOf(EMIT, 3, 5, P)}"/>`;
  out.push({ live: glowGlass + swirl + beam });

  return {
    width,
    height,
    label: "An isometric drawing of Rick's portal gun standing on its grip with a rest post on a display plinth: a white body with a red switch, a black knurled dial and a front emitter, and a glass capsule of swirling green fluid.",
    body: out,
    css: `@keyframes pg-glow{0%,100%{opacity:.08}50%{opacity:.55}}.pg-glow{filter:blur(3px);animation:pg-glow 1.6s ease-in-out infinite}
@keyframes pg-swirl{to{stroke-dashoffset:-40}}.pg-swirl{stroke-dasharray:4 6;animation:pg-swirl 1.2s linear infinite;opacity:.8}`,
  };
}
