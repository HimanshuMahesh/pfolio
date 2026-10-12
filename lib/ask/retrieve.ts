/**
 * Finds the sections that answer a question: BM25 over each section's title,
 * aliases and text, weighted, with a nudge toward the page the reader is on
 * and a carry-over from the last question for short follow-ups. Runs in
 * process in well under a millisecond. See docs/hima-ai-plan.md §5.
 */
import indexJson from "@/content/ask-index.json";
import type { AskIndex, ChatMessage, Section, Source } from "./protocol";

export const index = indexJson as AskIndex;

const STOP = new Set(
  "a an the and or but of to in on at for with by from as is are was were be been being do does did has have had what which who whom whose how why when where can could would should will shall may might me my i you your he him his she her it its they them their this that these those there here about tell any some more most so than then just also into over out up down not no yes please give show know anything something everything thing things".split(
    " ",
  ),
);

/** Lower-case words, light stemming, numbers kept ("10,000" → "10000"). */
export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/(\d),(\d)/g, "$1$2")
    .replace(/[’']s\b/g, "")
    .split(/[^a-z0-9+]+/)
    .filter((w) => w && !STOP.has(w))
    .map((w) => (w.length > 4 ? w.replace(/ie[sd]$/, "y").replace(/(ing|ed|es|s)$/, "") : w));
}

const FIELDS = { title: 3, aliases: 3, text: 1 } as const;
type Field = keyof typeof FIELDS;
const K1 = 1.2;
/* Length normalisation per field: full for body text; none for aliases (a
   section with eight aliases isn't "longer" in any way that should cost it). */
const B: Record<Field, number> = { title: 0.3, aliases: 0, text: 0.75 };

type Doc = { section: Section; tf: Record<Field, Map<string, number>>; len: Record<Field, number> };

function count(words: string[]) {
  const m = new Map<string, number>();
  for (const w of words) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
}

// Built once per server instance.
const docs: Doc[] = index.sections.map((section) => {
  const f = { title: tokens(section.title), aliases: tokens(section.aliases.join(" ")), text: tokens(section.text) };
  return {
    section,
    tf: { title: count(f.title), aliases: count(f.aliases), text: count(f.text) },
    len: { title: f.title.length, aliases: f.aliases.length, text: f.text.length },
  };
});
const avg = Object.fromEntries(
  (Object.keys(FIELDS) as Field[]).map((k) => [k, docs.reduce((n, d) => n + d.len[k], 0) / docs.length || 1]),
) as Record<Field, number>;
const df = new Map<string, number>();
for (const d of docs) {
  const all = new Set([...d.tf.title.keys(), ...d.tf.aliases.keys(), ...d.tf.text.keys()]);
  for (const w of all) df.set(w, (df.get(w) ?? 0) + 1);
}
const idf = (w: string) => {
  const n = df.get(w) ?? 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};

function score(doc: Doc, query: Map<string, number>) {
  let s = 0;
  for (const [w, qw] of query) {
    const i = idf(w);
    for (const k of Object.keys(FIELDS) as Field[]) {
      const tf = doc.tf[k].get(w);
      if (!tf) continue;
      const norm = (tf * (K1 + 1)) / (tf + K1 * (1 - B[k] + B[k] * (doc.len[k] / avg[k])));
      s += FIELDS[k] * i * norm * qw;
    }
  }
  return s;
}

export type Hit = { section: Section; score: number };

const FOLLOW_UP = /\b(he|him|his|it|its|that|there|this|they|them|those|before|after|else|more)\b/i;

/**
 * Ranked sections for a question. A short or pronoun-led question also
 * carries the previous question at half weight ("and before that?").
 */
export function retrieve(question: string, history: ChatMessage[], route: string): Hit[] {
  const query = new Map<string, number>();
  const own = tokens(question);
  for (const w of own) query.set(w, 1);
  const prev = [...history].reverse().find((m) => m.role === "user");
  if (prev && (own.length < 4 || FOLLOW_UP.test(question))) {
    for (const w of tokens(prev.content)) if (!query.has(w)) query.set(w, 0.5);
  }
  if (!query.size) return [];

  return docs
    .map((d) => {
      let s = score(d, query);
      // A small tie-breaker for the page the reader is on
      if (s > 0 && d.section.route === route) s *= 1.1;
      return { section: d.section, score: s };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** Retrieval is sure enough to move the page before the model speaks. Tuned by `npm run ask:eval`. */
export const CONFIDENT = { min: 6, ratio: 1.35 };

/**
 * Where to take the reader right away, if anywhere: the best section on the
 * page they're on, when it's clearly the answer and not the page's top.
 */
export function earlyNav(hits: Hit[], route: string): Source | null {
  const here = hits.filter((h) => h.section.route === route && h.section.anchor);
  const [a, b] = here;
  if (!a || a.score < CONFIDENT.min) return null;
  // It must also be the best (or near-best) answer anywhere, not just the best on this page
  if (hits[0] && a.score < hits[0].score * 0.8) return null;
  if (b && a.score / b.score < CONFIDENT.ratio) return null;
  return toSource(a.section);
}

export const toSource = ({ id, route, anchor, page, title }: Section): Source => ({ id, route, anchor, page, title });

/** Sections that make the model's context: top hits, one part per section, under a word budget. */
export function contextFor(hits: Hit[], budgetWords = 700, max = 4): Section[] {
  const out: Section[] = [];
  let words = 0;
  for (const h of hits) {
    if (out.length >= max) break;
    const base = h.section.id.split("#")[0];
    if (out.some((s) => s.id.split("#")[0] === base)) continue;
    const n = h.section.text.split(" ").length;
    if (out.length && words + n > budgetWords) continue;
    out.push(h.section);
    words += n;
  }
  return out;
}
