import type { Frame } from "../frame";
import { TAU, clamp, lerp, rand, smooth } from "../math";

/* Cherry blossom on the morning breeze — a handful, not a snowstorm.
   Sakura pink, at different depths (far ones smaller, fainter, slower).
   Each falls like a real petal: swinging side to side like a pendulum,
   tilting into each swing and lifting slightly at its ends, turning over
   now and then. They ride the same wind as the clouds. */

type Petal = {
  x: number; y: number;
  depth: number;
  size: number;
  fall: number;
  swing: number; swingHz: number; ph: number;
  tilt: number;
  flipHz: number; flipPh: number;
  tint: number;
  alpha: number;
  born: number;
  vx: number; vy: number;
};

const FADE_IN_MS = 1500;

export class Petals {
  private petals: Petal[] = [];
  private nextGust = performance.now() + rand(8000, 16000);

  draw(f: Frame) {
    const { sun } = f;
    // from sunrise until late morning (~11am)
    const vis = smooth(-3, 2, sun.alt) * (1 - smooth(-22, -12, sun.ha));
    if (!f.motion || vis <= 0.02) {
      this.petals = [];
      return;
    }

    const want = Math.round(clamp(f.W / 80, 7, 18));
    while (this.petals.length < want) this.petals.push(this.make(f, this.petals.length < want / 2));
    if (f.now > this.nextGust) {
      // a small flurry off a branch somewhere to the left
      const y = rand(0.1, 0.5) * f.H;
      for (let i = 0; i < 6; i++) {
        this.petals.push({ ...this.make(f, false), x: rand(-60, -10), y: y + rand(-24, 24), vx: rand(40, 70), vy: rand(-12, 8) });
      }
      this.nextGust = f.now + rand(18000, 32000);
    }
    if (this.petals.length > want + 20) this.petals.splice(0, this.petals.length - want - 20);

    const { ctx, t, dt } = f;
    const s = dt / 1000;
    const drag = Math.exp(-dt / 900);

    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.x += (f.wind * lerp(0.6, 1.1, p.depth) + p.vx) * s;
      p.y += (p.fall + p.vy) * s;
      p.vx *= drag;
      p.vy *= drag;
      if (p.y > f.H + 12 || p.x > f.W + 24) {
        if (this.petals.length > want) this.petals.splice(i--, 1);
        else this.petals[i] = this.make(f, false);
        continue;
      }

      const phase = t * TAU * p.swingHz + p.ph;
      const sw = Math.sin(phase);
      const x = p.x + p.swing * sw;
      const y = p.y - p.swing * 0.18 * sw * sw; // lifts a little at the ends of each swing
      const rot = p.tilt + 0.55 * Math.cos(phase); // leans into the direction of travel
      const flip = Math.cos(t * TAU * p.flipHz + p.flipPh);
      const k = p.size;
      const fade = smooth(0, FADE_IN_MS, f.now - p.born);
      const face = flip > 0 ? 1 : 0.85; // the underside reads a touch deeper
      const a = p.alpha * vis * fade * lerp(0.6, 1, p.depth) * face;
      if (a < 0.01) continue;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(1, 0.3 + 0.7 * Math.abs(flip));
      const g = ctx.createLinearGradient(0, -k, 0, k);
      // blush at the tip deepening to sakura pink at the base
      g.addColorStop(0, `rgba(255,${Math.round(226 - 10 * p.tint)},${Math.round(234 - 8 * p.tint)},${a.toFixed(3)})`);
      g.addColorStop(1, `rgba(${Math.round(246 - 6 * p.tint)},${Math.round(160 - 22 * p.tint)},${Math.round(188 - 14 * p.tint)},${a.toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.beginPath(); // a blossom petal: round belly, notched tip
      ctx.moveTo(0, k);
      ctx.bezierCurveTo(k * 0.95, k * 0.55, k * 0.8, -k * 0.7, k * 0.22, -k);
      ctx.lineTo(0, -k * 0.78);
      ctx.lineTo(-k * 0.22, -k);
      ctx.bezierCurveTo(-k * 0.8, -k * 0.7, -k * 0.95, k * 0.55, 0, k);
      ctx.fill();
      ctx.restore();
    }
  }

  private make(f: Frame, anywhere: boolean): Petal {
    const depth = rand(0.3, 1);
    return {
      x: anywhere ? rand(-0.05, 0.95) * f.W : rand(-0.2, 0.05) * f.W,
      y: anywhere ? rand(-0.1, 0.9) * f.H : rand(-0.3, 0.15) * f.H,
      depth,
      size: rand(4.2, 6.4) * lerp(0.7, 1.15, depth),
      fall: rand(8, 14) * lerp(0.6, 1, depth),
      swing: rand(5, 12) * lerp(0.6, 1, depth),
      swingHz: rand(0.18, 0.32),
      ph: rand(0, TAU),
      tilt: rand(0, TAU),
      flipHz: rand(0.12, 0.3),
      flipPh: rand(0, TAU),
      tint: rand(0, 1),
      alpha: rand(0.75, 0.95),
      born: f.now,
      vx: 0,
      vy: 0,
    };
  }
}
