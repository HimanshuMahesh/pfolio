/**
 * The free model chain: Groq's free tier gives each model its own quota, so
 * three Groq models come first, then Cloudflare Workers AI when configured.
 * All speak the OpenAI chat-completions shape. A provider that's rate-limited
 * or failing is skipped until its reset time. Server only.
 * See docs/hima-ai-plan.md §6.2.
 */
import type { Turn } from "./protocol";

// Keys live in server env only; this module must never reach a browser bundle.
if (typeof window !== "undefined") throw new Error("lib/ask/providers is server-only");

type Provider = {
  name: string;
  url: string;
  key: string;
  model: string;
  /** Model-specific knobs (reasoning off or low, so tokens go to the answer). */
  extra: Record<string, unknown>;
};

const GROQ = "https://api.groq.com/openai/v1/chat/completions";

function chain(): Provider[] {
  const out: Provider[] = [];
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    const models = (process.env.GROQ_MODELS ?? "qwen/qwen3.8-27b,openai/gpt-oss-20b,openai/gpt-oss-120b").split(",");
    for (const model of models.map((m) => m.trim()).filter(Boolean)) {
      const extra = model.startsWith("openai/gpt-oss")
        ? { reasoning_effort: "low", include_reasoning: false, max_completion_tokens: 900 }
        : model.startsWith("qwen/")
          ? { reasoning_effort: "none", max_completion_tokens: 400 }
          : { max_completion_tokens: 400 };
      out.push({ name: `groq:${model}`, url: GROQ, key: groq, model, extra });
    }
  }
  const cfAccount = process.env.CF_ACCOUNT_ID;
  const cfToken = process.env.CF_API_TOKEN;
  if (cfAccount && cfToken) {
    out.push({
      name: "cloudflare:gpt-oss-20b",
      url: `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/v1/chat/completions`,
      key: cfToken,
      model: "@cf/openai/gpt-oss-20b",
      extra: { max_tokens: 900 },
    });
  }
  return out;
}

/** Until when each provider is benched (ms since epoch), per server instance. */
const benched = new Map<string, number>();

/** "1m26.4s", "922ms", "7.66s" or plain seconds → ms. */
function parseReset(v: string | null): number | null {
  if (!v) return null;
  if (/^\d+(\.\d+)?$/.test(v)) return parseFloat(v) * 1000;
  let ms = 0;
  for (const [, n, u] of v.matchAll(/(\d+(?:\.\d+)?)(ms|h|m|s)/g)) {
    ms += parseFloat(n) * ({ ms: 1, s: 1000, m: 60_000, h: 3_600_000 } as const)[u as "ms" | "s" | "m" | "h"];
  }
  return ms || null;
}

/** First token must arrive within this, or the next provider gets a turn. */
const FIRST_TOKEN_MS = 3500;
/** Whole answer cap. */
const TOTAL_MS = 15000;
/** If every model is rate-limited but one resets within this, wait rather than fall back. */
const MAX_WAIT_MS = 2500;

/**
 * Streams answer text from the first provider that responds. Yields text
 * deltas; throws "rate_limited" or "exhausted" when every provider failed
 * before answering.
 * Once text has started, it's committed to that provider.
 */
export async function* streamAnswer(messages: Turn[], signal: AbortSignal, temperature = 0.3): AsyncGenerator<string> {
  const providers = chain();
  if (!providers.length) throw new Error("exhausted");
  let lastStatus = 0;

  // Everyone benched, but someone's back within a moment: worth the wait
  const soonest = Math.min(...providers.map((p) => benched.get(p.name) ?? 0)) - Date.now();
  if (soonest > 0 && soonest <= MAX_WAIT_MS) await new Promise((r) => setTimeout(r, soonest + 50));
  const now = Date.now();

  for (const p of providers) {
    if ((benched.get(p.name) ?? 0) > now) continue;

    const ctrl = new AbortController();
    const abort = () => ctrl.abort();
    signal.addEventListener("abort", abort, { once: true });
    let firstTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(abort, FIRST_TOKEN_MS);
    const totalTimer = setTimeout(abort, TOTAL_MS);
    let started = false;

    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: p.model, messages, stream: true, temperature, ...p.extra }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        lastStatus = res.status;
        const reset =
          parseReset(res.headers.get("retry-after")) ??
          parseReset(res.headers.get("x-ratelimit-reset-tokens")) ??
          (res.status === 429 ? 20_000 : 30_000);
        benched.set(p.name, Date.now() + reset);
        console.warn(`[ask] ${p.name} → ${res.status}, benched ${Math.round(reset / 1000)}s`);
        continue;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") return;
          let delta: string | undefined;
          try {
            delta = JSON.parse(data).choices?.[0]?.delta?.content;
          } catch {
            continue;
          }
          if (!delta) continue;
          if (!started) {
            started = true;
            clearTimeout(firstTimer);
            firstTimer = undefined;
          }
          yield delta;
        }
      }
      return;
    } catch (e) {
      if (signal.aborted) return; // the reader left; nothing to do
      if (started) return;        // cut off mid-answer: keep what was sent
      benched.set(p.name, Date.now() + 15_000);
      console.warn(`[ask] ${p.name} → ${e instanceof Error ? e.name : "error"} before first token`);
    } finally {
      clearTimeout(firstTimer);
      clearTimeout(totalTimer);
      signal.removeEventListener("abort", abort);
    }
  }
  throw new Error(lastStatus === 429 ? "rate_limited" : "exhausted");
}
