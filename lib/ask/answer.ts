/**
 * One question in, a stream of AskEvents out: retrieve → maybe move the page
 * now → ask the model → turn its [[tags]] into checked citations. Shared by
 * /api/ask and the eval script. Server only (it reaches the model
 * keys through ./providers).
 */
import { buildMessages } from "./prompt";
import { streamAnswer } from "./providers";
import { contextFor, earlyNav, index, retrieve, toSource } from "./retrieve";
import { createTagStripper } from "./tags";
import type { AskEvent, AskRequest, Section } from "./protocol";

/* First questions repeat a lot (the starters above all), so finished answers
   to them are kept for a day per server instance and replayed for free. */
const CACHE_MS = 86_400_000;
const CACHE_MAX = 200;
const cache = new Map<string, { at: number; events: AskEvent[] }>();
const cacheKey = (req: AskRequest) =>
  `${index.version}|${req.route}|${req.question.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim()}`;

export async function* answer(req: AskRequest, signal: AbortSignal): AsyncGenerator<AskEvent> {
  const key = req.history.length ? null : cacheKey(req);
  const hit = key ? cache.get(key) : undefined;
  if (hit && Date.now() - hit.at < CACHE_MS) {
    yield* hit.events;
    return;
  }
  const kept: AskEvent[] = [];
  for await (const e of fresh(req, signal)) {
    kept.push(e);
    yield e;
  }
  if (key && kept.at(-1)?.t === "done") {
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), events: kept });
  }
}

async function* fresh(req: AskRequest, signal: AbortSignal): AsyncGenerator<AskEvent> {
  const hits = retrieve(req.question, req.history, req.route);
  const context = contextFor(hits);
  yield { t: "meta", sources: context.map(toSource), nav: earlyNav(hits, req.route) };

  // The model may only cite what it was shown; parts ("x#2") cite as their section.
  const allowed = new Map<string, Section>();
  for (const s of context) {
    const base = s.id.split("#")[0];
    if (!allowed.has(base)) allowed.set(base, { ...s, id: base });
  }

  const tags = createTagStripper();
  const cited = new Set<string>();
  let primary = true;
  function* events(evts: ReturnType<typeof tags.push>): Generator<AskEvent> {
    for (const e of evts) {
      if (e.kind === "text") {
        yield { t: "text", v: e.v };
        continue;
      }
      const section = allowed.get(e.id.split("#")[0]);
      const first = primary;
      primary = false;
      if (!section || cited.has(section.id)) continue;
      cited.add(section.id);
      yield { t: "cite", source: toSource(section), primary: first };
    }
  }

  try {
    const messages = buildMessages(req.question, req.history, context, req.route);
    for await (const delta of streamAnswer(messages, signal)) yield* events(tags.push(delta));
    yield* events(tags.flush());
    yield { t: "done" };
  } catch (e) {
    yield { t: "error", code: e instanceof Error && e.message === "rate_limited" ? "rate_limited" : "upstream" };
  }
}
