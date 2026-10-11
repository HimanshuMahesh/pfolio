export const TAU = Math.PI * 2;
export const RAD = Math.PI / 180;
export const DEG = 180 / Math.PI;

/** Modulo that is always positive. */
export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

/** Hermite smoothstep of x between edges a and b. */
export function smooth(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Deterministic PRNG (Park–Miller), so the starfield is stable across resizes. */
export function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
