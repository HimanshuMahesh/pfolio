/**
 * Visitor stubs: a ticket drawn on a canvas with checker-block pixel art in a
 * random colour, the visitor's place / device / time and a quote. The canvas is
 * both what's shown and what's downloaded.
 */

/* ---- storage (every access can throw: private mode, blocked site data) ---- */
const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : (JSON.parse(v) as T);
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

/* ---- random helpers ---- */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ---- palettes: bright hues only, lightness kept high enough to never go brown ---- */
export type Hue = { name: string; h: number; s: number; l: [number, number]; ink: string; btnL: number };
export const HUES: Hue[] = [
  { name: "green", h: 146, s: 62, l: [30, 80], ink: "#fff", btnL: 44 },
  { name: "red", h: 356, s: 76, l: [40, 82], ink: "#fff", btnL: 52 },
  { name: "orange", h: 26, s: 95, l: [50, 84], ink: "#fff", btnL: 52 },
  { name: "yellow", h: 46, s: 96, l: [54, 88], ink: "#3b2f00", btnL: 58 },
  { name: "lilac", h: 268, s: 78, l: [56, 90], ink: "#fff", btnL: 62 },
  { name: "blue", h: 222, s: 84, l: [38, 84], ink: "#fff", btnL: 52 },
];
const shades = (p: Hue) =>
  Array.from({ length: 5 }, (_, i) => `hsl(${p.h + i * 4} ${p.s}% ${p.l[0] + ((p.l[1] - p.l[0]) * i) / 4}%)`);

/* ---- quotes: sitcoms + superheroes, [line, who] ---- */
const QUOTES: Array<[string, string]> = [
  // Friends
  ["How you doin’?", "Joey, Friends"],
  ["We were on a break!", "Ross, Friends"],
  ["Pivot! Pivot! Pivot!", "Ross, Friends"],
  ["Joey doesn’t share food!", "Joey, Friends"],
  ["It’s a moo point.", "Joey, Friends"],
  ["Unagi.", "Ross, Friends"],
  ["They don’t know that we know they know we know!", "Phoebe, Friends"],
  // Modern Family
  ["Why the face?", "Phil, Modern Family"],
  ["Watch a sunrise at least once a day.", "Phil’s-osophy, Modern Family"],
  // The Big Bang Theory
  ["Bazinga!", "Sheldon, The Big Bang Theory"],
  ["I’m not crazy. My mother had me tested.", "Sheldon, The Big Bang Theory"],
  ["That’s my spot.", "Sheldon, The Big Bang Theory"],
  ["Penny. Penny. Penny.", "Sheldon, The Big Bang Theory"],
  // Superheroes
  ["With great power comes great responsibility.", "Spider-Man"],
  ["Anyone can wear the mask.", "Miles Morales"],
  ["I can do this all day.", "Captain America"],
  ["Avengers, assemble.", "Captain America"],
  ["It’s not who I am underneath, but what I do that defines me.", "Batman"],
  ["Why do we fall? So we can learn to pick ourselves up.", "Alfred, Batman Begins"],
  ["Part of the journey is the end.", "Iron Man"],
  ["I am Groot.", "Groot"],
  ["Wakanda forever!", "Black Panther"],
  ["Up, up and away!", "Superman"],
  ["That’s my secret. I’m always angry.", "Hulk"],
  ["Whatever it takes.", "The Avengers"],
  ["Excelsior!", "Stan Lee"],
];
/** A random quote that never repeats the previous stub's. */
function randomQuote(): [string, string] {
  const last = store.get("hm-stub-lastq", -1);
  let i = Math.floor(Math.random() * QUOTES.length);
  if (i === last) i = (i + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
  store.set("hm-stub-lastq", i);
  return QUOTES[i];
}

/* ---- visitor metadata ---- */
function device() {
  const ua = navigator.userAgent;
  let os = "Device";
  if (/iPhone/.test(ua)) os = "iPhone";
  else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) os = "iPad";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "Mac";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";
  let br = "";
  if (/Edg\//.test(ua)) br = "Edge";
  else if (/OPR\//.test(ua)) br = "Opera";
  else if (/Firefox|FxiOS/.test(ua)) br = "Firefox";
  else if (/CriOS|Chrome/.test(ua)) br = "Chrome";
  else if (/Safari/.test(ua)) br = "Safari";
  return br ? `${os} · ${br}` : os;
}
function place() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const fix: Record<string, string> = { Calcutta: "Kolkata", Kiev: "Kyiv", Saigon: "Ho Chi Minh" };
    let city = (tz.split("/").pop() || "").replace(/_/g, " ");
    city = fix[city] || city;
    const off =
      new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value || "";
    return city ? (off ? `${city} · ${off}` : city) : "Somewhere";
  } catch {
    return "Somewhere";
  }
}

/* ---- the stub ---- */
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]] as const;

export type Stub = {
  now: Date;
  from: string;
  on: string;
  at: string;
  quote: [string, string];
  hue: Hue;
  dir: number;
};

export function newStub(): Stub {
  const now = new Date();
  const r = rng(hash(navigator.userAgent + ":" + now.getTime()));
  return {
    now,
    from: place(),
    on: device(),
    at:
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) +
      " · " +
      now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    quote: randomQuote(),
    hue: HUES[Math.floor(r() * HUES.length)],
    dir: Math.floor(r() * DIRS.length),
  };
}

export function stubFilename(s: Stub) {
  const d = s.now;
  const p = (n: number) => String(n).padStart(2, "0");
  return `stub-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.png`;
}

/* ---- drawing ---- */
const W = 280;
const CELL = 14;
const COLS = 20;
const ROWS = 11;
const ART = CELL * ROWS;
const H = ART + 182;
const R = 14;
const NOTCH = 11;

/** Flat checker blocks shaded along a random direction. */
export function paintPixels(ctx: CanvasRenderingContext2D, s: Pick<Stub, "hue" | "dir">, cols: number, rows: number, cell: number) {
  const pal = shades(s.hue);
  const [dx, dy] = DIRS[s.dir];
  const span = Math.abs(dx) * (cols - 1) + Math.abs(dy) * (rows - 1) || 1;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const along = ((dx < 0 ? cols - 1 - x : x) * Math.abs(dx) + (dy < 0 ? rows - 1 - y : y) * Math.abs(dy)) / span;
      const i = Math.max(0, Math.min(4, Math.round(along * 3) + ((x + y) % 2)));
      ctx.fillStyle = pal[i];
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
}

/** The site's next/font families, resolved so the canvas can use them. */
function fonts() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    sans: `${v("--font-zalando") || '"Zalando Sans SemiExpanded"'}, system-ui, sans-serif`,
    mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace',
  };
}

export async function loadStubFonts() {
  const f = fonts();
  try {
    await Promise.all([
      document.fonts.load(`500 19px ${f.sans}`),
    ]);
  } catch {}
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

export function drawStub(canvas: HTMLCanvasElement, s: Stub, scale = 3) {
  const f = fonts();
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  roundRect(ctx, 0, 0, W, H, R);
  ctx.clip();
  ctx.fillStyle = "#fdfcf9";
  ctx.fillRect(0, 0, W, H);
  paintPixels(ctx, s, COLS, ROWS, CELL);

  // FROM / ON / AT
  const y0 = ART + 16;
  const rows: Array<[string, string]> = [["FROM", s.from], ["ON", s.on], ["AT", s.at]];
  rows.forEach(([k, v], i) => {
    const y = y0 + 20 + i * 21;
    ctx.fillStyle = "#9097a6";
    ctx.font = `500 10px ${f.mono}`;
    ctx.fillText(k, 18, y);
    ctx.fillStyle = "#20263a";
    ctx.font = `500 11px ${f.mono}`;
    let t = v.toUpperCase();
    while (ctx.measureText(t).width > W - 84 && t.length > 4) t = t.slice(0, -2) + "…";
    ctx.fillText(t, 66, y);
  });

  // quote
  ctx.strokeStyle = "#e6e8ee";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, y0 + 76);
  ctx.lineTo(W - 18, y0 + 76);
  ctx.stroke();
  const [text, who] = s.quote;
  const wrap = (size: number) => {
    ctx.font = `500 ${size}px ${f.sans}`;
    const lines: string[] = [];
    let line = "";
    for (const w of `“${text}”`.split(" ")) {
      const t = line ? line + " " + w : w;
      if (ctx.measureText(t).width > W - 36 && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    return [...lines, line];
  };
  let size = 19;
  let lines = wrap(size);
  if (lines.length > 2) {
    size = 16;
    lines = wrap(size);
  }
  ctx.fillStyle = "#20263a";
  lines.forEach((l, i) => ctx.fillText(l, 18, y0 + 100 + i * (size + 2)));
  ctx.fillStyle = "#8b91a1";
  ctx.font = `500 9px ${f.mono}`;
  ctx.fillText(`— ${who.toUpperCase()}`, 18, y0 + 100 + (lines.length - 1) * (size + 2) + 20);

  // hairline edge
  ctx.strokeStyle = "rgba(0,0,0,.08)";
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, R);
  ctx.stroke();
  ctx.restore();

  // perforation + transparent notches
  ctx.save();
  ctx.strokeStyle = "#cfd3dc";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 4]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(NOTCH + 8, ART);
  ctx.lineTo(W - NOTCH - 8, ART);
  ctx.stroke();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(0, ART, NOTCH, 0, Math.PI * 2);
  ctx.arc(W, ART, NOTCH, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function downloadStub(canvas: HTMLCanvasElement, s: Stub) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: stubFilename(s) });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}
