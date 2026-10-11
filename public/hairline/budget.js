/**
 * Budget: a chessboard of 64 tiles in a framed tray. Each tile's height is how
 * much of the engine's search lands on that square. The pointer is projected
 * onto the board and stands for the line the engine finds promising: tiles
 * near it rise on their own springs, falling off to a low floor, so the effort
 * piles up in one place instead of spreading evenly. At rest the board is a
 * main line with a smaller second thought. Dark squares carry an inlay ring.
 * The slider is the reach of the search, in squares: narrow is aggressive pruning.
 */
const {
  Cam, clamp, facing, fit, prism, proj, rings, unproj, spring, stepS, open, ringAt, run,
  flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const N = 8, CELL = 14, FOOT = 12, HMAX = 54, EXT = N * CELL, PB = 6, RIM = 5;
const FILES = "abcdefgh";

/** Share of full height at u reaches from the line: 1 → .3 at 40% → a floor of .06. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.4 ? 1 - (u / 0.4) * 0.7 : u <= 1 ? 0.3 - ((u - 0.4) / 0.6) * 0.24 : 0.06;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.66);
  const E0 = -RIM - 2, E1 = EXT + RIM + 2;
  fit(C, [[E0, E0, -PB], [E1, E1, -PB], [E1, E0, -PB], [E0, E1, -PB], [0, 0, HMAX * 0.8]], 200, 166);
  const P = proj(C), front = facing(C);
  let R = value * CELL, over = null;

  const g = mk("g", {}, svg), tiles = [];
  // the tray: a plinth, then a raised rim whose inner edge frames the squares
  const [pr, pi] = rings(E0, E0, E1, E1, 8, 2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));
  const [fr] = rings(-1.5, -1.5, EXT + 1.5, EXT + 1.5, 3, 1);
  mk("path", { d: open(ringAt(P, run(fr, (q) => !front(q)), 0)), class: "nf lo" }, g);

  // Diagonal by diagonal from the far corner, so appending paints back to front.
  for (let s = 0; s <= 2 * (N - 1); s++) for (let i = 0; i < N; i++) {
    const j = s - i;
    if (j < 0 || j >= N) continue;
    const u = i / (N - 1), v = j / (N - 1);
    // the main line runs through the centre; a second, smaller idea sits on the queenside
    const h0 = 3 + 30 * Math.exp(-((u - 0.55) ** 2 + (v - 0.45) ** 2) / 0.05) + 13 * Math.exp(-((u - 0.12) ** 2 + (v - 0.85) ** 2) / 0.03);
    const x0 = i * CELL + (CELL - FOOT) / 2, y0 = j * CELL + (CELL - FOOT) / 2;
    const [ring, inner] = rings(x0, y0, x0 + FOOT, y0 + FOOT, 2.2, 0.8);
    const dark = (i + j) % 2 === 1;
    const [inlay] = dark ? rings(x0 + 3, y0 + 3, x0 + FOOT - 3, y0 + FOOT - 3, 1.4, 0.5) : [null];
    const el = solid(g);
    const ink = dark ? mk("path", { class: "nf lo" }, el.g) : null;
    tiles.push({ i, j, h0, ring, inner, inlay, ink, sp: spring(h0, { eps: 0.04 }), el, drawn: NaN });
  }

  // the near rim, painted over the front row's feet
  mk("path", { d: open(ringAt(P, run(fr, front), 0)), class: "nf lo" }, g);

  // The mark: three dots in a row on the lid of one tile, the move the engine would play.
  const mark = mk("g", {}, g), md = [];
  for (let k = 0; k < 3; k++) md.push(flatDot(mark, C, 0.65, k === 1 ? "dot" : "dot m"));
  const peak = tiles.reduce((a, b) => (b.h0 > a.h0 ? b : a));
  const byCell = new Map();
  tiles.forEach((t) => byCell.set(t.i + "," + t.j, t));
  let mt = null, want = peak;

  function drawMark() {
    if (want !== mt) { mt = want; mt.el.g.after(mark); }
    const cx = (mt.i + 0.5) * CELL, cy = (mt.j + 0.5) * CELL, h = Math.max(0.6, mt.sp.x);
    md.forEach((el, k) => place(el, P(cx + (k - 1) * 2.6, cy - (k - 1) * 2.6, h)));
  }
  // A tile whose spring hasn't moved keeps its paths.
  function drawTile(t) {
    const h = Math.max(0.6, t.sp.x);
    if (h === t.drawn) return;
    t.drawn = h;
    put(t.el, prism(P, front, t.ring, t.inner, 0, h));
    if (t.ink) t.ink.setAttribute("d", "M" + ringAt(P, t.inlay, h).map((p) => p.join(" ")).join("L") + "Z");
    t.el.sil.classList.toggle("hi", t === want);
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const t of tiles) { if (stepS(t.sp, dt)) m = true; drawTile(t); }
    drawMark();
    return m;
  });
  bag.add(B.unregister);

  function retarget() {
    const before = want;
    if (over) {
      const i = clamp(Math.floor(over[0] / CELL), 0, N - 1), j = clamp(Math.floor(over[1] / CELL), 0, N - 1);
      want = byCell.get(i + "," + j);
      read.textContent = FILES[i] + (N - j);
    } else { want = peak; read.textContent = "rest"; }
    for (const t of tiles) {
      if (!over) { t.sp.t = t.h0; continue; }
      const dx = (t.i + 0.5) * CELL - over[0], dy = (t.j + 0.5) * CELL - over[1];
      t.sp.t = HMAX * falloff(Math.hypot(dx, dy) / R);
    }
    if (before !== want) { before.drawn = NaN; want.drawn = NaN; }
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => {
      const w = unproj(C, p[0], p[1], 0);
      over = w[0] < -RIM || w[1] < -RIM || w[0] > EXT + RIM || w[1] > EXT + RIM ? null : [clamp(w[0], 0, EXT - 0.01), clamp(w[1], 0, EXT - 0.01)];
      retarget();
    },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v * CELL; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "budget",
  means: "A chessboard where each square rises with the search spent on it: the effort piles up around the line that looks promising.",
  rules: [1, 3, 5, 9],
  range: [1.5, 2.6, 4.5],
  tour: [[200, 150], [130, 190], [265, 190], null],
  mount,
});
