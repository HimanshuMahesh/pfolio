import { mixLab, oklab, type Lab } from "./color";
import { lerp, smooth } from "./math";
import type { Sun } from "./solar";

/* Sky colour keyed to the sun's altitude. Morning and evening are different
   skies: dawn is lilac and milky, the afternoon turns champagne and then
   honey. Midday is the deep one.

   Each stop: altitude (deg), then four bands top → bottom (zenith, upper,
   lower, horizon), then star visibility 0–1. */
type Stop = [alt: number, zenith: string, upper: string, lower: string, horizon: string, stars: number];

const NIGHT: Stop[] = [
  [-90, "#03050b", "#050814", "#08101f", "#0e1524", 1],
  [-16, "#04060e", "#070c1a", "#0c1428", "#151c32", 1],
];
const MIDDAY: Stop = [90, "#1552ab", "#2f7bd1", "#6fb0ea", "#c4e2f8", 0];

const MORNING: Stop[] = [
  ...NIGHT,
  [-11, "#060b1c", "#0d1735", "#1b2750", "#33385f", 0.7],
  [-7, "#0c1636", "#1f2d63", "#474e8a", "#9a7a9e", 0.3], // lilac first light
  [-4, "#13224c", "#34487f", "#8a86b0", "#e0a5a8", 0.06], // pink dawn
  [-1.5, "#1b3163", "#4f6aa3", "#c3a3b8", "#f8c3a4", 0],
  [1, "#22427e", "#6687bd", "#d6bcc4", "#fbd7b5", 0], // pastel sunrise
  [5, "#2a5596", "#7098cb", "#c9c9d6", "#f3e2cf", 0], // milky morning haze
  [15, "#2c63a8", "#5a93cf", "#a3c4e3", "#e0ebf3", 0],
  [35, "#1b5cb4", "#3a86d8", "#84bdee", "#d6ecfb", 0], // crisp, cool, clear
  MIDDAY,
];

const EVENING: Stop[] = [
  ...NIGHT,
  [-11, "#060b1c", "#0c1633", "#17224a", "#2b2f56", 0.7],
  [-7, "#0a1330", "#17245a", "#34397a", "#6c5088", 0.3], // violet dusk
  [-4, "#0f1c44", "#243676", "#5d5b9b", "#c27b8d", 0.06],
  [-1.5, "#15275a", "#3a4f8e", "#9b7ba6", "#f09b79", 0], // coral sunset
  [1, "#1c3a73", "#4e69a5", "#c89ba7", "#f6b37f", 0],
  [5, "#23508d", "#5a84bd", "#c3b2bb", "#f4cf9f", 0], // golden hour
  [15, "#2a5a8e", "#5d8cbc", "#b7c3cc", "#f0d9b8", 0], // honey late afternoon
  [35, "#1d5e9e", "#3f88c2", "#93bcd6", "#e6dfd2", 0], // soft afternoon, champagne haze
  MIDDAY,
];

type Band = { alt: number; colors: Lab[]; stars: number };
const prepare = (stops: Stop[]): Band[] =>
  stops.map(([alt, ...rest]) => ({ alt, colors: (rest.slice(0, 4) as string[]).map(oklab), stars: rest[4] as number }));

const SKY_AM = prepare(MORNING);
const SKY_PM = prepare(EVENING);

function lookup(table: Band[], alt: number) {
  let i = 0;
  while (i < table.length - 2 && alt > table[i + 1].alt) i++;
  const A = table[i];
  const B = table[i + 1];
  const k = smooth(0, 1, (alt - A.alt) / (B.alt - A.alt));
  return { colors: A.colors.map((c, j) => mixLab(c, B.colors[j], k)), stars: lerp(A.stars, B.stars, k) };
}

export type SkyColors = {
  /** Four bands, zenith → horizon. */
  bands: Lab[];
  stars: number;
  /** 0 in the morning, 1 in the evening, crossing at solar noon. */
  pm: number;
};

export function skyAt({ alt, ha }: Sun): SkyColors {
  const pm = smooth(-10, 10, ha);
  const a = lookup(SKY_AM, alt);
  const b = lookup(SKY_PM, alt);
  return { bands: a.colors.map((c, j) => mixLab(c, b.colors[j], pm)), stars: lerp(a.stars, b.stars, pm), pm };
}

/* Light sources */
export const DAWN = oklab("#f4b3a6");
export const DUSK = oklab("#f2a77f");
export const GLOW_AM = oklab("#fff1dc");
export const GLOW_NOON = oklab("#ffffff");
export const GLOW_PM = oklab("#ffe2b8");
