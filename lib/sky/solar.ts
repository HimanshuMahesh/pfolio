import { DEG, RAD, mod } from "./math";

/* Time and the sun over Bengaluru. Times of day are expressed as minutes
   after local midnight (0–1440), which is what the scrubber works in. */

export const PLACE = { lat: 12.9716, lon: 77.5946, utcOffsetMinutes: 330 } as const;
export const MINUTES_PER_DAY = 1440;

/** A Date whose UTC fields read as Bengaluru wall-clock time. */
const localNow = () => new Date(Date.now() + PLACE.utcOffsetMinutes * 60_000);

export function minutesNow(): number {
  const d = localNow();
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
}

/** The real instant at `minutes` past local midnight today. */
export function dateAtMinutes(minutes: number): Date {
  const d = localNow();
  const midnightUtc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - PLACE.utcOffsetMinutes * 60_000;
  return new Date(midnightUtc + minutes * 60_000);
}

/** Parses `HH:MM` (e.g. from `?sky=18:30`) into minutes, or null. */
export function parseClock(value: string | null): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function formatClock(minutes: number): string {
  const m = mod(Math.round(minutes), MINUTES_PER_DAY);
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export type Sun = {
  /** Altitude above the horizon, degrees. */
  alt: number;
  /** Hour angle, degrees: negative before solar noon, positive after. */
  ha: number;
};

/** Low-precision solar ephemeris — plenty for colouring a sky. */
export function sunAt(date: Date): Sun {
  const d = date.getTime() / 86_400_000 + 2440587.5 - 2451545.0;
  const g = mod(357.529 + 0.98560028 * d, 360) * RAD;
  const q = mod(280.459 + 0.98564736 * d, 360);
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) * DEG;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const ha = mod(mod(280.46061837 + 360.98564736629 * d, 360) + PLACE.lon - ra + 180, 360) - 180;
  const lat = PLACE.lat * RAD;
  const alt = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha * RAD)) * DEG;
  return { alt, ha };
}

/** Minutes past midnight of today's solar noon, near `around`. */
export function solarNoon(around: number): number {
  return around - (sunAt(dateAtMinutes(around)).ha / 15) * 60;
}

export function phaseName({ alt, ha }: Sun): string {
  const rising = ha < 0;
  if (alt < -18) return "Night";
  if (alt < -6) return rising ? "First light" : "Dusk";
  if (alt < -0.8) return "Blue hour";
  if (alt < 2) return rising ? "Sunrise" : "Sunset";
  if (alt < 10) return "Golden hour";
  if (Math.abs(ha) < 22) return "Midday";
  return rising ? "Morning" : "Afternoon";
}
