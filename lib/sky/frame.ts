import type { SkyColors } from "./palette";
import type { Sun } from "./solar";

/** Everything a layer needs to paint one frame. */
export type Frame = {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS pixels. */
  W: number;
  H: number;
  /** Performance clock, ms — for spawn timers. */
  now: number;
  /** Animation time in seconds; frozen at 0 when motion is off. */
  t: number;
  /** Milliseconds since the last frame; 0 for still redraws. */
  dt: number;
  motion: boolean;
  sun: Sun;
  sky: SkyColors;
  /** Where the sun sits horizontally, px (edges = midnight, centre = noon). */
  sunX: number;
  /** One breeze for the whole sky, px/s (positive = rightwards). */
  wind: number;
};
