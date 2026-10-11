import { mixLab, oklab, rgba, type Lab } from "../color";
import type { Frame } from "../frame";
import { TAU, clamp, lerp, smooth } from "../math";
import { DAWN, DUSK, GLOW_AM, GLOW_NOON, GLOW_PM } from "../palette";

const VENUS = oklab("#eea4b9"); // the rose band
const EARTH_SHADOW = oklab("#4a5a8c"); // slate blue below it

/* The sky itself, kept deliberately clean — every layer is a smooth ramp,
   nothing blotchy:
     · the gradient, whose band boundaries breathe
     · a slow tide of light drifting across it, so it is never quite still
     · the bright rim at the horizon
     · the glow that travels with the sun, and the warm wash of dawn and dusk
     · at twilight, the belt of Venus: a pink band opposite the sun over the
       blue-grey shadow of the earth — warm on one side, rose and slate on
       the other, which is what makes a real evening sky interesting */

/** Gradient stops sampled per frame. Canvas blends stops in sRGB, so many
    close stops sampled in OKLab keep the gradient clean — no muddy
    midpoints, no visible kinks where bands meet. */
const SAMPLES = 14;

const lighten = (c: Lab, dL: number): Lab => [c[0] + dL, c[1], c[2]];

/**
 * Monotone cubic (Fritsch–Carlson) through the four band colours, per OKLab
 * channel: smooth through every band without overshooting between them.
 */
function sampleBands(bands: Lab[], xs: number[], u: number): Lab {
  const n = xs.length;
  let k = 0;
  while (k < n - 2 && u > xs[k + 1]) k++;
  const h = xs[k + 1] - xs[k];
  const s = clamp((u - xs[k]) / h, 0, 1);
  const out: Lab = [0, 0, 0];
  for (let ch = 0; ch < 3; ch++) {
    const y = bands.map((b) => b[ch]);
    const d = y.slice(0, -1).map((v, i) => (y[i + 1] - v) / (xs[i + 1] - xs[i]));
    const m = y.map((_, i) => {
      if (i === 0) return d[0];
      if (i === n - 1) return d[n - 2];
      return d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    });
    const s2 = s * s;
    const s3 = s2 * s;
    out[ch] =
      (2 * s3 - 3 * s2 + 1) * y[k] +
      (s3 - 2 * s2 + s) * h * m[k] +
      (-2 * s3 + 3 * s2) * y[k + 1] +
      (s3 - s2) * h * m[k + 1];
  }
  return out;
}

/** Runs `paint` with the canvas squashed vertically around y (for elliptical glows). */
function squashed(ctx: CanvasRenderingContext2D, y: number, k: number, paint: () => void) {
  ctx.save();
  ctx.translate(0, y);
  ctx.scale(1, k);
  ctx.translate(0, -y);
  paint();
  ctx.restore();
}

export function drawAtmosphere(f: Frame) {
  const { ctx, W, H, t, sky, sun, sunX } = f;
  const { alt } = sun;
  const horizon = sky.bands[3];

  // 1 · gradient — the inner band boundaries breathe on their own cycles
  const xs = [0, 0.34 + 0.045 * Math.sin((t * TAU) / 23), 0.7 + 0.035 * Math.sin((t * TAU) / 31 + 1.7), 1];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i <= SAMPLES; i++) {
    const u = i / SAMPLES;
    g.addColorStop(u, rgba(sampleBands(sky.bands, xs, u)));
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // 1b · tide — two wide, soft bands of light drifting across in opposite
  //      directions; horizontal ramps only, so they stay perfectly clean
  for (const [band, period, phase, dL, a] of [
    [1, 37, 0, 0.05, 0.1],
    [2, 53, Math.PI, 0.04, 0.07],
  ]) {
    const cx = (0.5 + 0.4 * Math.sin((t * TAU) / period + phase)) * W;
    const col = lighten(sky.bands[band], dL);
    const tide = ctx.createLinearGradient(cx - W * 0.45, 0, cx + W * 0.45, 0);
    tide.addColorStop(0, rgba(col, 0));
    tide.addColorStop(0.5, rgba(col, a));
    tide.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = tide;
    ctx.fillRect(0, 0, W, H);
  }

  // 2 · horizon rim — the thin luminous band of thick air at the horizon;
  //     brightest when the sun is low, faint and blue at night
  const low = smooth(-14, -1, alt) * (1 - 0.45 * smooth(12, 55, alt));
  const rimA = lerp(0.06, 0.3, low);
  const rim = ctx.createLinearGradient(0, H, 0, H * 0.7);
  const rimCol = lighten(horizon, 0.08);
  rim.addColorStop(0, rgba(rimCol, rimA));
  rim.addColorStop(0.3, rgba(rimCol, rimA * 0.4));
  rim.addColorStop(1, rgba(rimCol, 0));
  ctx.fillStyle = rim;
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  // 3a · daylight glow that travels with the sun — low and warm early, high and white at noon
  const day = smooth(0, 10, alt);
  if (day > 0.01) {
    const high = smooth(10, 70, alt);
    const col = mixLab(mixLab(GLOW_AM, GLOW_PM, sky.pm), GLOW_NOON, high);
    const sy = lerp(H * 1.05, -H * 0.25, high);
    const r = W * lerp(0.42, 0.3, high);
    const rg = ctx.createRadialGradient(sunX, sy, 0, sunX, sy, r);
    rg.addColorStop(0, rgba(col, 0.26 * day));
    rg.addColorStop(0.35, rgba(col, 0.1 * day));
    rg.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  // 3b · the warm wash of dawn and dusk, low on the sun's side
  const twilight = smooth(-9, -2, alt) * (1 - smooth(5, 16, alt));
  if (twilight > 0.01) {
    const col = mixLab(DAWN, DUSK, sky.pm);
    const cx = clamp(sunX / W, 0.15, 0.85) * W;
    const r = W * 0.8;
    const rg = ctx.createRadialGradient(cx, H, 0, cx, H, r);
    rg.addColorStop(0, rgba(col, 0.3 * twilight));
    rg.addColorStop(0.45, rgba(col, 0.09 * twilight));
    rg.addColorStop(1, rgba(col, 0));
    squashed(ctx, H, 0.45, () => {
      ctx.fillStyle = rg;
      ctx.fillRect(0, H - r, W, r * 2);
    });
  }

  // 3c · belt of Venus — around sunset (and, softer, sunrise), opposite the sun
  const belt = smooth(-8, -1.5, alt) * (1 - smooth(2, 9, alt)) * lerp(0.65, 1, sky.pm);
  if (belt > 0.01) {
    const ax = (((sunX + W / 2) % W) + W) % W;
    const r = W * 0.6;
    const rose = ctx.createRadialGradient(ax, H * 0.74, 0, ax, H * 0.74, r);
    rose.addColorStop(0, rgba(VENUS, 0.24 * belt));
    rose.addColorStop(0.5, rgba(VENUS, 0.08 * belt));
    rose.addColorStop(1, rgba(VENUS, 0));
    squashed(ctx, H * 0.74, 0.32, () => {
      ctx.fillStyle = rose;
      ctx.fillRect(0, H * 0.74 - r, W, r * 2);
    });
    // the earth's shadow rises beneath it as the sun sinks
    const shadow = belt * smooth(1, -5, alt);
    const sh = ctx.createRadialGradient(ax, H * 1.02, 0, ax, H * 1.02, r * 0.85);
    sh.addColorStop(0, rgba(EARTH_SHADOW, 0.26 * shadow));
    sh.addColorStop(0.55, rgba(EARTH_SHADOW, 0.08 * shadow));
    sh.addColorStop(1, rgba(EARTH_SHADOW, 0));
    squashed(ctx, H * 1.02, 0.24, () => {
      ctx.fillStyle = sh;
      ctx.fillRect(0, 0, W, H * 1.02 + r);
    });
  }
}
