/**
 * Emphasis: a web page laid flat on a board, five sections stacked from top
 * to bottom (a thin nav, a hero, a features band, a proof strip, a call to
 * action). Each section stands as tall as it matters. The section under the
 * pointer rises and the rest settle low, staggered outwards from it, so the
 * page reads as one clear focus. The slider is the contrast: at its low end
 * every section ends up almost the same height, the "everything equally
 * loud" page; at its high end one section owns the page.
 */
const {
  Cam, clamp, facing, fit, poly, prism, proj, rings, ringAt, rrect, seg, unproj,
  tween, tset, tval, tdone, disposer, mk, pointer, put, register, solid, reflect,
} = HL;

const W = 112, PAD = 8;
// [name, y0, y1, rest height]; the hero leads at rest
const SECTIONS = [
  ["nav", 0, 7, 3],
  ["hero", 12, 46, 16],
  ["features", 51, 71, 7],
  ["proof", 76, 88, 4.5],
  ["cta", 93, 104, 10],
];
const LOW = 2.2;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rise = value;

  const C = Cam(45, 0.5, 1.72);
  const X0 = -PAD, X1 = W + PAD, Y0 = -PAD, Y1 = 104 + PAD;
  fit(C, [[X0, Y0, -5], [X1, Y1, -5], [X1, Y0, -5], [X0, Y1, -5], [0, 12, 3 + 34], [W, 46, 3 + 34]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [br, bi] = rings(X0, Y0, X1, Y1, 8, 2);
  reflect(svg, g, P, front, br, -5, 12);
  put(solid(g), prism(P, front, br, bi, -5, 0));

  // back to front: the sections run down the page along y, so append them in order
  const parts = SECTIONS.map(([name, y0, y1, h0], i) => {
    const inset = name === "nav" ? 0 : name === "cta" ? 26 : 4;
    const x0 = inset, x1 = W - inset;
    const [ring, inner] = rings(x0, y0, x1, y1, name === "nav" ? 2.2 : 3.4, 0.9);
    const el = solid(g);
    const mark = mk("path", { class: "nf lo" }, el.g);
    return { i, name, x0, x1, y0, y1, h0, ring, inner, el, mark, z: tween(h0), drawn: NaN };
  });

  /** The few marks each section really has, drawn on its top at height h. */
  function marks(p, h) {
    const at = (u, v) => P(u, v, h);
    if (p.name === "hero") return seg(at(14, 22), at(70, 22)) + seg(at(14, 28), at(52, 28));
    if (p.name === "features") return [0, 1, 2].map((k) => poly(ringAt(P, rrect(10 + k * 32, 55, 34 + k * 32, 67, 2, 3), h))).join("");
    if (p.name === "cta") return poly(ringAt(P, rrect(40, 96, 72, 101, 2.4, 3), h));
    if (p.name === "nav") return seg(at(6, 3.5), at(14, 3.5)) + seg(at(80, 3.5), at(104, 3.5));
    return seg(at(12, 82), at(98, 82));
  }

  let act = -1, lit = 1;
  function draw(p, h) {
    if (h === p.drawn) return;
    p.drawn = h;
    put(p.el, prism(P, front, p.ring, p.inner, 0, h));
    p.mark.setAttribute("d", marks(p, h));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of parts) {
      draw(p, Math.max(0.6, tval(p.z, now)));
      if (!tdone(p.z, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  /** The section whose resting top holds the point: tested on each section's own rest height, front to back. */
  function hit([sx, sy]) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const [x, y] = unproj(C, sx, sy, p.h0);
      if (x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1) return i;
      const [gx, gy] = unproj(C, sx, sy, 0);
      if (gx >= p.x0 && gx <= p.x1 && gy >= p.y0 && gy <= p.y1) return i;
    }
    return -1;
  }

  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    parts.forEach((p, i) => {
      const to = a < 0 ? p.h0 : i === a ? LOW + rise : LOW + (rise < 8 ? rise * 0.85 : 0);
      tset(p.z, to, now, Math.abs(i - from) * 45);
    });
    const next = a < 0 ? 1 : a;
    if (next !== lit) { parts[lit].el.sil.classList.remove("hi"); lit = next; }
    parts[lit].el.sil.classList.add("hi");
    read.textContent = a < 0 ? "rest" : parts[a].name;
    B.wake();
  }

  parts[lit].el.sil.classList.add("hi");
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { rise = clamp(v, 0, 40); const a = act; act = -2; setActive(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "emphasis",
  means: "A page laid flat, each section as tall as it matters: point at one and it takes the focus while the rest settle.",
  rules: [1, 2, 4, 5],
  range: [3, 18, 34],
  tour: [[200, 120], [150, 190], [255, 205], null],
  mount,
});
