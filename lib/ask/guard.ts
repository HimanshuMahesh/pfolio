/**
 * Front door for /api/ask: who may ask, how much, and how often. Keeps one
 * visitor from spending the free model quotas for everyone.
 * See docs/hima-ai-plan.md §9.1.
 */
import type { AskRequest, ChatMessage } from "./protocol";

/* Each visitor gets a few questions a minute and a day's allowance, like any
   chat with a person. Past that, Hima says to come back later. */
export const LIMITS = { question: 400, turns: 6, turnChars: 600, perMinute: 4, perDay: 15 };
const ROUTES = /^\/(about)?$/;

/** Parses and trims a request body. Returns null if it isn't a valid question. */
export function readRequest(body: unknown): AskRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const question = typeof b.question === "string" ? b.question.trim() : "";
  if (!question || question.length > LIMITS.question) return null;
  const route = typeof b.route === "string" && ROUTES.test(b.route) ? b.route : "/";
  const history: ChatMessage[] = (Array.isArray(b.history) ? b.history : [])
    .filter(
      (m): m is ChatMessage =>
        !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-LIMITS.turns)
    // Tags are the server's to write; never accept them back
    .map((m) => ({ role: m.role, content: m.content.replace(/\[\[[^\]]*\]\]/g, "").slice(0, LIMITS.turnChars) }));
  return { question, route, history };
}

/** Requests from this site only (plus localhost in dev). A speed bump, not auth: the rate limit is the real guard. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    const o = new URL(origin);
    if (o.host === host) return true;
    return process.env.NODE_ENV === "development" && (o.hostname === "localhost" || o.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

/* A token bucket per visitor, in memory. Per server instance, so approximate,
   which is plenty for a portfolio. */
type Bucket = { minute: number; minuteAt: number; day: number; dayAt: number };
const buckets = new Map<string, Bucket>();

/** The visitor's IP. On Vercel both headers are set by the platform, which overwrites anything a client sends. */
export function clientKey(req: Request): string {
  return (req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local").trim();
}

export type Allowance = { ok: true; left: number } | { ok: false; scope: "minute" | "day"; retry: number };

/** Takes one question from this visitor's allowance, or says when they can ask again. */
export function allow(key: string, now = Date.now()): Allowance {
  if (buckets.size > 5000) buckets.clear(); // never grow without bound
  const b = buckets.get(key) ?? { minute: 0, minuteAt: now, day: 0, dayAt: now };
  if (now - b.minuteAt > 60_000) Object.assign(b, { minute: 0, minuteAt: now });
  if (now - b.dayAt > 86_400_000) Object.assign(b, { day: 0, dayAt: now });
  buckets.set(key, b);
  if (b.day >= LIMITS.perDay) return { ok: false, scope: "day", retry: Math.ceil((b.dayAt + 86_400_000 - now) / 1000) };
  if (b.minute >= LIMITS.perMinute) return { ok: false, scope: "minute", retry: Math.ceil((b.minuteAt + 60_000 - now) / 1000) };
  b.minute++;
  b.day++;
  return { ok: true, left: LIMITS.perDay - b.day };
}
