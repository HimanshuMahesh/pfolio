import type { Frame } from "../frame";
import { RAD, TAU, clamp, lerp, rand, seeded, smooth } from "../math";

/* Night: breathing stars, a constellation that gathers near the cursor,
   figures that quietly trace themselves across deep night, and now and
   then a shooting star. */

type Star = { x: number; y: number; r: number; a: number; period: number; ph: number };
export type Pointer = { x: number; y: number; on: boolean };

/** A passing constellation: stars joined in the order they were reached. */
type Figure = { stars: number[]; edges: [number, number][]; t0: number; hold: number };

const STAR_SEED = 20260925;
const CONSTELLATION_RADIUS = 120;

const FIGURE_EDGE_MS = 650; // each line draws in over this long, one after another
const FIGURE_FADE_MS = 2200;
const FIGURE_MAX = 2;

export class Stars {
  private stars: Star[] = [];
  private glow = 0;
  private figures: Figure[] = [];
  private nextFigure = performance.now() + rand(1500, 3500);

  resize(W: number, H: number) {
    const rnd = seeded(STAR_SEED); // same sky every resize
    this.figures = [];
    const count = clamp(Math.round((W * H) / 6000), 24, 80);
    this.stars = Array.from({ length: count }, () => {
      const bright = rnd() < 0.12;
      return {
        x: rnd() * W,
        y: 4 + Math.pow(rnd(), 1.2) * H * 0.8,
        r: bright ? 0.9 + rnd() * 0.35 : 0.45 + rnd() * 0.35,
        a: bright ? 0.9 : 0.35 + rnd() * 0.35,
        period: 4 + rnd() * 6,
        ph: rnd() * TAU,
      };
    });
  }

  draw(f: Frame, pointer: Pointer) {
    const vis = f.sky.stars;
    if (vis <= 0.01) {
      this.glow = 0;
      return;
    }
    const { ctx, t } = f;
    for (const s of this.stars) {
      const a = vis * s.a * (0.76 + 0.24 * Math.sin((t * TAU) / s.period + s.ph));
      ctx.fillStyle = `rgba(232,237,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    this.drawFigures(f, vis, pointer);
    if (vis > 0.3) this.drawConstellation(f, vis, pointer);
  }

  /* ---- passing figures: deep night only ------------------------------------ */
  private drawFigures(f: Frame, vis: number, pointer: Pointer) {
    const night = smooth(0.75, 0.95, vis);
    if (!f.motion || night <= 0.01) {
      this.figures = [];
      return;
    }
    const life = (g: Figure) => g.edges.length * FIGURE_EDGE_MS + g.hold + FIGURE_FADE_MS;
    this.figures = this.figures.filter((g) => f.now - g.t0 < life(g));
    if (f.now > this.nextFigure) {
      if (this.figures.length < FIGURE_MAX) this.spawnFigure(f, pointer);
      this.nextFigure = f.now + rand(6000, 13000);
    }

    const { ctx } = f;
    ctx.save();
    ctx.lineWidth = 0.6;
    ctx.lineCap = "round";
    for (const g of this.figures) {
      const el = f.now - g.t0;
      const traced = g.edges.length * FIGURE_EDGE_MS;
      const k = vis * night * (1 - smooth(traced + g.hold, traced + g.hold + FIGURE_FADE_MS, el));

      g.edges.forEach(([i, j], n) => {
        const p = smooth(0, 1, (el - n * FIGURE_EDGE_MS) / FIGURE_EDGE_MS);
        if (p <= 0) return;
        const a = this.stars[i];
        const b = this.stars[j];
        const g2 = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        const alpha = (0.3 * k).toFixed(3);
        g2.addColorStop(0, `rgba(200,215,255,${alpha})`);
        g2.addColorStop(1, `rgba(200,215,255,${(0.3 * k * 0.7).toFixed(3)})`);
        ctx.strokeStyle = g2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(lerp(a.x, b.x, p), lerp(a.y, b.y, p));
        ctx.stroke();
      });

      // each star brightens softly as its line arrives
      g.stars.forEach((idx, n) => {
        const s = this.stars[idx];
        const lit = n === 0 ? smooth(0, 400, el) : smooth((n - 0.3) * FIGURE_EDGE_MS, n * FIGURE_EDGE_MS, el);
        const a = 0.5 * k * lit;
        if (a < 0.01) return;
        const R = s.r * 4.5;
        const rg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
        rg.addColorStop(0, `rgba(235,240,255,${a.toFixed(3)})`);
        rg.addColorStop(1, "rgba(235,240,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, R, 0, TAU);
        ctx.fill();
      });
    }
    ctx.restore();
  }

  /** Picks a free patch of sky and joins 4–6 neighbouring stars into a tree (Prim's), grown from one star. */
  private spawnFigure(f: Frame, pointer: Pointer) {
    const reach = clamp(Math.min(f.W, f.H) * 0.32, 110, 200);
    const busy = new Set(this.figures.flatMap((g) => g.stars));
    const clear = (s: Star) =>
      !(pointer.on && Math.hypot(s.x - pointer.x, s.y - pointer.y) < CONSTELLATION_RADIUS * 1.5) &&
      this.figures.every((g) => g.stars.every((i) => Math.hypot(this.stars[i].x - s.x, this.stars[i].y - s.y) > reach));

    for (let attempt = 0; attempt < 6; attempt++) {
      const seed = Math.floor(Math.random() * this.stars.length);
      const o = this.stars[seed];
      if (busy.has(seed) || !clear(o) || o.x < 24 || o.x > f.W - 24) continue;
      const size = 4 + Math.floor(Math.random() * 3);
      const pool = this.stars
        .map((s, i) => ({ i, d: Math.hypot(s.x - o.x, s.y - o.y) }))
        .filter((n) => n.d < reach && !busy.has(n.i))
        .sort((a, b) => a.d - b.d)
        .slice(0, size)
        .map((n) => n.i);
      if (pool.length < 4) continue;

      const stars = [pool[0]];
      const edges: [number, number][] = [];
      const rest = pool.slice(1);
      while (rest.length) {
        let best = { from: 0, to: 0, d: Infinity };
        for (const a of stars)
          rest.forEach((b, r) => {
            const d = Math.hypot(this.stars[a].x - this.stars[b].x, this.stars[a].y - this.stars[b].y);
            if (d < best.d) best = { from: a, to: r, d };
          });
        const [to] = rest.splice(best.to, 1);
        edges.push([best.from, to]);
        stars.push(to);
      }
      this.figures.push({ stars, edges, t0: f.now, hold: rand(3500, 6000) });
      return;
    }
  }

  /** Stars near the cursor find each other: each links to its nearest earlier neighbour. */
  private drawConstellation(f: Frame, vis: number, pointer: Pointer) {
    const { ctx } = f;
    this.glow = lerp(this.glow, pointer.on ? 1 : 0, 1 - Math.exp(-f.dt / 260));
    if (this.glow < 0.02) return;

    const near = this.stars
      .map((s) => ({ s, d: Math.hypot(s.x - pointer.x, s.y - pointer.y) }))
      .filter((n) => n.d < CONSTELLATION_RADIUS)
      .map((n) => ({ ...n, k: 1 - n.d / CONSTELLATION_RADIUS }))
      .sort((a, b) => a.d - b.d);
    if (!near.length) return;

    const pts = near.slice(0, 6);
    ctx.lineWidth = 0.6;
    for (let i = 1; i < pts.length; i++) {
      let best = pts[0];
      let bestD = Infinity;
      for (let j = 0; j < i; j++) {
        const d = Math.hypot(pts[i].s.x - pts[j].s.x, pts[i].s.y - pts[j].s.y);
        if (d < bestD) {
          bestD = d;
          best = pts[j];
        }
      }
      const a = vis * this.glow * 0.32 * Math.min(pts[i].k, best.k);
      ctx.strokeStyle = `rgba(200,215,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(best.s.x, best.s.y);
      ctx.lineTo(pts[i].s.x, pts[i].s.y);
      ctx.stroke();
    }
    for (const n of near) {
      const a = vis * this.glow * 0.6 * n.k;
      const R = n.s.r * 5;
      const g = ctx.createRadialGradient(n.s.x, n.s.y, 0, n.s.x, n.s.y, R);
      g.addColorStop(0, `rgba(235,240,255,${a.toFixed(3)})`);
      g.addColorStop(1, "rgba(235,240,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.s.x, n.s.y, R, 0, TAU);
      ctx.fill();
    }
  }
}

type Meteor = {
  t0: number; dur: number; x: number; y: number; dx: number; dy: number;
  len: number; travel: number; width: number;
};

export class Meteors {
  private meteor: Meteor | null = null;
  private next = performance.now() + rand(2000, 5000);

  draw(f: Frame) {
    const vis = f.sky.stars;
    if (!f.motion || vis <= 0.6) {
      this.meteor = null;
      return;
    }
    if (!this.meteor && f.now > this.next) this.spawn(f);
    if (this.meteor) this.paint(f, smooth(0.6, 0.95, vis));
  }

  private spawn(f: Frame) {
    const ltr = Math.random() < 0.7;
    const big = Math.random() < 0.2;
    const ang = rand(10, 24) * RAD;
    this.meteor = {
      t0: f.now,
      dur: big ? rand(1100, 1400) : rand(700, 1000),
      x: (ltr ? rand(0.06, 0.6) : rand(0.4, 0.94)) * f.W,
      y: rand(0.05, 0.35) * f.H,
      dx: Math.cos(ang) * (ltr ? 1 : -1),
      dy: Math.sin(ang),
      len: big ? rand(150, 200) : rand(80, 130),
      travel: big ? rand(260, 340) : rand(150, 230),
      width: big ? 1.7 : 1.2,
    };
    this.next = f.now + rand(5000, 12000);
  }

  private paint(f: Frame, visibility: number) {
    const m = this.meteor!;
    const { ctx } = f;
    const p = (f.now - m.t0) / m.dur;
    if (p >= 1) {
      this.meteor = null;
      return;
    }
    const e = 1 - Math.pow(1 - p, 2.4);
    const hx = m.x + m.dx * m.travel * e;
    const hy = m.y + m.dy * m.travel * e;
    const len = m.len * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(p * 1.1, 1)));
    const tx = hx - m.dx * len;
    const ty = hy - m.dy * len;
    const nx = -m.dy;
    const ny = m.dx;
    const w = m.width / 2;
    const a = visibility * smooth(0, 0.1, p) * (1 - smooth(0.6, 1, p));

    ctx.save();
    ctx.shadowColor = `rgba(160,190,255,${(0.9 * a).toFixed(3)})`;
    ctx.shadowBlur = 10;
    const g = ctx.createLinearGradient(tx, ty, hx, hy);
    g.addColorStop(0, "rgba(190,210,255,0)");
    g.addColorStop(0.7, `rgba(220,232,255,${(0.45 * a).toFixed(3)})`);
    g.addColorStop(1, `rgba(250,252,255,${(0.95 * a).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx + nx * w, hy + ny * w);
    ctx.lineTo(hx - nx * w, hy - ny * w);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 4);
    hg.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`);
    hg.addColorStop(0.4, `rgba(210,225,255,${(0.35 * a).toFixed(3)})`);
    hg.addColorStop(1, "rgba(210,225,255,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, TAU);
    ctx.fill();
  }
}
