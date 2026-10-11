import type { Frame } from "./frame";
import { TAU, mod } from "./math";
import { skyAt } from "./palette";
import type { Sun } from "./solar";
import { drawAtmosphere } from "./layers/atmosphere";
import { Birds } from "./layers/birds";
import { Meteors, Stars, type Pointer } from "./layers/night";
import { Petals } from "./layers/petals";
import { Wisps } from "./layers/wisps";

export type { Pointer };

/* Paints the sky for a sun position. Layers, back to front:
     atmosphere   gradient, horizon rim, sun glow, twilight wash
     night        stars (and the cursor constellation), shooting stars
     wisps        high cirrus on the breeze
     birds        by day
     petals       cherry blossom through the morning
   With motion off, only the still layers are drawn. */

/** One breeze for everything that drifts: a steady westerly with slow gusts, px/s. */
const windAt = (t: number) =>
  11 + 5 * Math.sin((t * TAU) / 37) + 3 * Math.sin((t * TAU) / 13 + 1.3) + 1.5 * Math.sin((t * TAU) / 5.7 + 0.4);

export class SkyRenderer {
  private ctx: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private stars = new Stars();
  private meteors = new Meteors();
  private wisps = new Wisps();
  private birds = new Birds();
  private petals = new Petals();

  /** Cursor position in canvas pixels; set by the controller. */
  readonly pointer: Pointer = { x: 0, y: 0, on: false };

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = width;
    this.H = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.stars.resize(width, height);
    this.wisps.resize(width, height);
  }

  render(sun: Sun, now: number, dt: number, motion: boolean) {
    const { W, H } = this;
    if (!W || !H) return;
    const t = motion ? now / 1000 : 0;
    const f: Frame = {
      ctx: this.ctx,
      W,
      H,
      now,
      t,
      dt: motion ? dt : 0,
      motion,
      sun,
      sky: skyAt(sun),
      sunX: mod(0.5 + sun.ha / 360, 1) * W,
      wind: windAt(now / 1000),
    };

    drawAtmosphere(f);
    this.stars.draw(f, this.pointer);
    this.meteors.draw(f);
    this.wisps.draw(f);
    this.birds.draw(f);
    this.petals.draw(f);
  }
}
