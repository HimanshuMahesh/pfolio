import { mixLab, oklab, toRgb, type Lab } from "../color";
import type { Frame } from "../frame";
import { lerp, seeded, smooth } from "../math";
import { DAWN, DUSK } from "../palette";

/* Cirrus, procedurally. A small, domain-warped fractal-noise field —
   stretched sideways into wind-combed streaks — is recomputed a few times a
   second: the warp slowly evolves, so the wisps form, thin, stretch and
   re-form, while the whole field flows with the shared breeze. It's
   rendered at low resolution and upscaled smoothly, which is exactly the
   softness cirrus wants. White by day, lit from below at dawn and dusk,
   barely there at night; kept to the upper sky so the horizon stays clean. */

const CELL = 6; // CSS px per field sample
const STEP_MS = 50; // field refresh interval (~20 fps; the motion is slow)
const SCALE_X = 230; // px per noise unit horizontally…
const SCALE_Y = 52; // …and vertically: the stretch makes streaks
const EVOLVE = 0.03; // how fast the shapes re-form (noise units / s)
const PEAK_ALPHA = 0.6;
const WHITE = oklab("#ffffff");

/* ---- value noise + fBm ----------------------------------------------------- */
const PERM = (() => {
  const rnd = seeded(7331);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from([...p, ...p]);
})();

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const X = xi & 255;
  const Y = yi & 255;
  const a = PERM[PERM[X] + Y];
  const b = PERM[PERM[X + 1] + Y];
  const c = PERM[PERM[X] + Y + 1];
  const d = PERM[PERM[X + 1] + Y + 1];
  const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
  const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) / 255;
}

/** Fractal noise; each octave rotated so no grid direction shows through. */
function fbm(x: number, y: number, octaves: number) {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x, y);
    norm += amp;
    const nx = 1.6 * x + 1.2 * y;
    y = -1.2 * x + 1.6 * y;
    x = nx;
    amp *= 0.5;
  }
  return sum / norm;
}

export class Wisps {
  private buf: HTMLCanvasElement | null = null;
  private img: ImageData | null = null;
  private bw = 0;
  private bh = 0;
  private drift = 0; // noise units travelled on the wind
  private since = Infinity; // ms since the field was last computed
  private key = "";

  resize(W: number, H: number) {
    this.bw = Math.max(8, Math.ceil(W / CELL));
    this.bh = Math.max(4, Math.ceil(H / CELL));
    this.buf = document.createElement("canvas");
    this.buf.width = this.bw;
    this.buf.height = this.bh;
    this.img = this.buf.getContext("2d")!.createImageData(this.bw, this.bh);
    this.since = Infinity;
  }

  draw(f: Frame) {
    if (!this.buf || !this.img) return;
    const { ctx, t, sun, sky } = f;
    const { alt } = sun;

    // colour and presence for this light
    const twilight = smooth(-10, -3, alt) * (1 - smooth(3, 14, alt));
    const night = 1 - smooth(-12, -5, alt);
    let col: Lab = mixLab(WHITE, sky.bands[3], 0.15);
    col = mixLab(col, mixLab(mixLab(DAWN, DUSK, sky.pm), WHITE, 0.2), twilight);
    col = mixLab(col, [sky.bands[2][0] + 0.05, sky.bands[2][1], sky.bands[2][2]], night);
    // Morning and evening are the gradient's moment: the sky clears, so it can show.
    const lowSun = smooth(-12, -2, alt) * (1 - smooth(18, 45, alt));
    const presence = lerp(0.14, 1, 1 - night) * (1 - 0.6 * lowSun);

    if (f.motion) this.drift += (f.wind * f.dt) / 1000 / SCALE_X;
    this.since += f.dt;

    const [r, g, b] = toRgb(col);
    const key = `${r},${g},${b}`;
    if (this.since >= STEP_MS || key !== this.key || !f.motion) {
      this.compute(t, r, g, b, lowSun);
      this.since = 0;
      this.key = key;
    }

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalAlpha = Math.min(1, presence);
    ctx.drawImage(this.buf, 0, 0, this.bw * CELL, this.bh * CELL);
    ctx.restore();
  }

  private compute(t: number, r: number, g: number, b: number, clear: number) {
    const { bw, bh } = this;
    const data = this.img!.data;
    // the sky clears and thickens over minutes; low sun clears it further
    const coverage = 0.5 + 0.05 * Math.sin(t / 47) + 0.1 * clear;
    const e = t * EVOLVE;

    for (let j = 0; j < bh; j++) {
      const v = j / (bh - 1);
      // upper sky only: fade in under the very top, out well before the horizon
      const band = smooth(0, 0.12, v) * (1 - smooth(0.5, 0.85, v));
      const py = (j * CELL) / SCALE_Y;
      for (let i = 0; i < bw; i++) {
        const idx = (j * bw + i) * 4;
        if (band <= 0) {
          data[idx + 3] = 0;
          continue;
        }
        const px = (i * CELL) / SCALE_X - this.drift;
        // domain warp: the field bends itself, and the bend drifts over time
        const qx = fbm(px * 0.7 + e, py * 0.7, 3);
        const qy = fbm(px * 0.7 + 5.2, py * 0.7 - e * 0.8, 3);
        let n = fbm(px + 1.5 * qx, py + 1.1 * qy + e * 0.5, 4);
        // fine fibres along the wind
        n += 0.08 * (noise(px * 4 + qx * 2, py * 11) - 0.5);
        const density = smooth(coverage, coverage + 0.22, n) * band;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = density * PEAK_ALPHA * 255;
      }
    }
    this.buf!.getContext("2d")!.putImageData(this.img!, 0, 0);
  }
}
