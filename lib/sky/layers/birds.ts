import type { Frame } from "../frame";
import { TAU, clamp, lerp, rand, smooth } from "../math";

/* Birds, from late morning (once the blossom has gone) until sunset. Not a screensaver V every few seconds: a lone bird, a
   pair, a loose scatter, sometimes a proper skein — at random depths, on
   meandering paths, at irregular intervals. Every bird keeps its own pace,
   wanders a little within the group, and flaps in its own bursts between
   glides. */

type Kind = "solo" | "pair" | "loose" | "skein";

type Bird = {
  ox: number; oy: number;          // place in the group
  lag: number;                     // drift from its own pace, px
  pace: number;                    // speed multiplier
  wx: number; wy: number; wf: number; wph: number;  // wander
  hz: number; flapPh: number;      // wing-beat
  burstHz: number; burstPh: number; // flap ↔ glide rhythm
  span: number;
};

type Flock = {
  dir: 1 | -1;
  depth: number;
  x: number;
  y0: number;
  climb: number;                   // px/s, drifting up or down over the crossing
  meander: { amp: number; hz: number; ph: number };
  speed: number;
  age: number;
  birds: Bird[];
};

const KINDS: Array<[Kind, number]> = [
  ["solo", 0.25],
  ["pair", 0.2],
  ["loose", 0.35],
  ["skein", 0.2],
];

function pickKind(): Kind {
  let r = Math.random();
  for (const [k, w] of KINDS) if ((r -= w) <= 0) return k;
  return "loose";
}

function formation(kind: Kind, gap: number): Array<[number, number]> {
  switch (kind) {
    case "solo":
      return [[0, 0]];
    case "pair":
      return [[0, 0], [-gap * rand(0.8, 1.6), gap * rand(-0.6, 0.6)]];
    case "loose": {
      const n = 3 + Math.floor(Math.random() * 5);
      return Array.from({ length: n }, (_, i) =>
        i === 0 ? [0, 0] : [-rand(0.4, 3.2) * gap, rand(-1.2, 1.2) * gap],
      );
    }
    case "skein": {
      const n = 5 + Math.floor(Math.random() * 5);
      const long = Math.random() < 0.5 ? 1 : -1; // which arm of the V runs longer
      const pts: Array<[number, number]> = [[0, 0]];
      for (let i = 1; i < n; i++) {
        const arm = (i % 2 ? 1 : -1) * (i > n * 0.6 ? long : 1);
        const k = Math.ceil(i / 2);
        pts.push([-k * gap * rand(0.9, 1.15), arm * k * gap * rand(0.42, 0.55)]);
      }
      return pts;
    }
  }
}

export class Birds {
  private flocks: Flock[] = [];
  private next = performance.now() + rand(1500, 4500);

  draw(f: Frame) {
    // The blossom has the morning; birds take the rest of the day, until sunset.
    const vis = smooth(-2, 3, f.sun.alt) * smooth(-22, -12, f.sun.ha);
    if (!f.motion || vis <= 0.05) {
      this.flocks = [];
      return;
    }
    const max = f.W > 900 ? 2 : 1;
    if (f.now > this.next && this.flocks.length < max) {
      this.spawn(f);
      this.next = f.now + rand(4000, 15000) * (Math.random() < 0.2 ? 2 : 1); // now and then, a long quiet
    }

    const { ctx, t, dt } = f;
    const s = dt / 1000;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(250,252,255,${(0.88 * vis).toFixed(3)})`;

    for (const fl of this.flocks) {
      fl.age += s;
      fl.x += fl.dir * fl.speed * s;
      const y =
        fl.y0 + fl.climb * fl.age + fl.meander.amp * Math.sin(fl.age * TAU * fl.meander.hz + fl.meander.ph);
      ctx.globalAlpha = lerp(0.5, 1, fl.depth);
      ctx.lineWidth = lerp(0.75, 1.3, fl.depth);

      for (const b of fl.birds) {
        b.lag += (b.pace - 1) * fl.speed * s;
        const x = fl.x + fl.dir * (b.ox + b.lag) + b.wx * Math.sin(t * TAU * b.wf + b.wph);
        const by = clamp(y + b.oy + b.wy * Math.sin(t * TAU * b.wf * 1.3 + b.wph * 1.7), 4, f.H * 0.7);

        // flap in bursts, glide in between (wings held in a shallow V)
        const burst = smooth(-0.1, 0.45, Math.sin(t * TAU * b.burstHz + b.burstPh));
        const flap = Math.sin(t * TAU * b.hz + b.flapPh);
        const sp = b.span;
        const tip = lerp(-sp * 0.22, -sp * 0.85 * flap, burst);
        ctx.beginPath();
        ctx.moveTo(x - sp, by + tip * 0.9 + sp * 0.12);
        ctx.quadraticCurveTo(x - sp * 0.45, by - sp * 0.32 + tip * 0.35, x, by);
        ctx.quadraticCurveTo(x + sp * 0.45, by - sp * 0.32 + tip * 0.35, x + sp, by + tip * 0.9 + sp * 0.12);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    const margin = 260;
    this.flocks = this.flocks.filter((fl) => (fl.dir > 0 ? fl.x - margin < f.W : fl.x + margin > 0));
  }

  private spawn(f: Frame) {
    const kind = pickKind();
    const depth = kind === "skein" ? rand(0.55, 1) : rand(0.2, 1);
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const gap = lerp(10, 20, depth);
    const loose = kind === "loose" || kind === "pair";
    const hz = rand(2.1, 3.1);

    this.flocks.push({
      dir,
      depth,
      x: dir > 0 ? -120 : f.W + 120,
      y0: rand(0.14, 0.55) * f.H,
      climb: rand(-2.5, 2.5),
      meander: { amp: rand(3, 12), hz: rand(0.04, 0.11), ph: rand(0, TAU) },
      speed: lerp(14, 44, depth) * rand(0.85, 1.15),
      age: 0,
      birds: formation(kind, gap).map(([ox, oy]) => ({
        ox,
        oy,
        lag: 0,
        pace: loose ? rand(0.95, 1.05) : rand(0.99, 1.01),
        wx: loose ? rand(1, 5) : rand(0.3, 1.2),
        wy: loose ? rand(1.5, 5) : rand(0.4, 1.4),
        wf: rand(0.05, 0.18),
        wph: rand(0, TAU),
        hz: kind === "skein" ? hz * rand(0.95, 1.05) : rand(2, 3.2),
        flapPh: rand(0, TAU),
        burstHz: rand(0.08, 0.2),
        burstPh: rand(0, TAU),
        span: lerp(2.6, 6, depth) * rand(0.88, 1.12),
      })),
    });
  }
}
