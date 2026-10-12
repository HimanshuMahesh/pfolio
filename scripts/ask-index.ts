/**
 * Builds content/ask-index.json: every [data-section] on the site, crawled from
 * the rendered pages so the text is exactly what visitors see and every anchor
 * exists. See docs/hima-ai-plan.md §4.
 *
 *   npm run dev                 (or next start), then:
 *   npm run ask:index           write the index
 *   npm run ask:index -- --check   fail if the committed index is stale
 *
 * ASK_INDEX_ORIGIN overrides the server to crawl (default http://localhost:3000).
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { parse, type HTMLElement, type Node } from "node-html-parser";
import { projects } from "../content/projects";
import { notes } from "../content/notes";
import type { AskIndex, Section } from "../lib/ask/protocol";

const ORIGIN = process.env.ASK_INDEX_ORIGIN ?? "http://localhost:3000";
const OUT = new URL("../content/ask-index.json", import.meta.url);
const CHECK = process.argv.includes("--check");
/** Long sections are cut into parts of about this many words. */
const PART_WORDS = 320;

const routes = [
  "/",
  "/about",
  "/fun",
  ...projects.filter((p) => p.href.startsWith("/work/")).map((p) => p.href),
  ...notes.map((n) => n.href).filter((h) => h.startsWith("/notes/")),
];

/** "/" → "home", "/about" → "about", "/work/north" → "work.north". */
const pageKey = (route: string) => (route === "/" ? "home" : route.slice(1).replace(/\//g, "."));

const clean = (s: string) =>
  s
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;|&#x27;|&#39;/g, "’")
    .replace(/&ldquo;|&rdquo;|&quot;/g, "\"")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Visible text (plus screen-reader text), skipping hidden subtrees and nested sections. */
function textOf(el: HTMLElement, root = true): string {
  if (!root && el.getAttribute("data-section") !== undefined) return "";
  const tag = el.tagName?.toLowerCase();
  if (/^(script|style|svg|noscript|template|dialog|button|input|textarea)$/.test(tag ?? "")) return "";
  // Hidden things, and UI chrome marked data-ask-skip (time chips, hints)
  if (el.getAttribute("aria-hidden") === "true" || el.getAttribute("hidden") !== undefined) return "";
  if (el.getAttribute("data-ask-skip") !== undefined) return "";
  const block = /^(p|li|h[1-6]|div|section|article|header|figcaption|blockquote|dt|dd|tr)$/.test(tag ?? "");
  const inner = el.childNodes
    .map((n: Node) => (n.nodeType === 3 ? n.rawText : n.nodeType === 1 ? textOf(n as HTMLElement, false) : ""))
    .join("");
  return block ? ` ${inner} ` : inner;
}

function split(text: string): string[] {
  const words = text.split(" ");
  if (words.length <= PART_WORDS * 1.3) return [text];
  const parts: string[] = [];
  for (let i = 0; i < words.length; i += PART_WORDS) parts.push(words.slice(i, i + PART_WORDS).join(" "));
  return parts;
}

async function crawl(route: string): Promise<Section[]> {
  const res = await fetch(ORIGIN + route);
  if (!res.ok) throw new Error(`${route}: HTTP ${res.status}`);
  const doc = parse(await res.text());
  const key = pageKey(route);
  const page = clean(doc.querySelector("h1")?.text ?? "") || key;
  const title = clean(doc.querySelector("title")?.text ?? "").split(" — ")[0].split(" · ")[0];
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  const pageName = route === "/" ? "Home" : route === "/about" ? "About" : title || page;

  const out: Section[] = [
    // The page itself: its title and description, at the top of the page
    { id: key, route, anchor: null, page: pageName, title: pageName, aliases: [], text: clean(`${title}. ${description}`) },
  ];
  const seen = new Set<string>();
  for (const el of doc.querySelectorAll("[data-section]")) {
    const local = el.getAttribute("data-section")!;
    const anchor = el.getAttribute("id");
    if (!anchor) throw new Error(`${route}: [data-section="${local}"] has no id to scroll to`);
    if (seen.has(local)) throw new Error(`${route}: two sections are both "${local}"`);
    seen.add(local);
    const text = clean(textOf(el));
    if (!text) continue;
    const heading = clean(el.querySelector("h1, h2, h3")?.text ?? "");
    const own = clean(el.getAttribute("data-section-title") ?? "") || heading || local;
    // Case studies and notes reuse titles like "How it works": say whose
    const named = route === "/" || route === "/about" || own.includes(pageName) ? own : `${pageName} · ${own}`;
    const base: Omit<Section, "text" | "id"> = {
      route,
      anchor,
      page: pageName,
      title: named,
      aliases: (el.getAttribute("data-section-aliases") ?? "")
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean),
    };
    const parts = split(text);
    parts.forEach((t, i) => out.push({ ...base, id: `${key}.${local}${parts.length > 1 ? `#${i + 1}` : ""}`, text: t }));
  }
  return out;
}

async function main() {
  const sections: Section[] = [];
  for (const route of routes) {
    const found = await crawl(route);
    console.log(`${route.padEnd(44)} ${found.length} sections`);
    sections.push(...found);
  }
  const body = JSON.stringify(sections);
  const index: AskIndex = { version: createHash("sha256").update(body).digest("hex").slice(0, 10), sections };
  const json = `${JSON.stringify(index, null, 1)}\n`;

  if (CHECK) {
    let current = "";
    try {
      current = readFileSync(OUT, "utf8");
    } catch {}
    if (current !== json) {
      console.error("\ncontent/ask-index.json is stale. Run `npm run ask:index` (with the dev server up) and commit it.");
      process.exit(1);
    }
    console.log(`\nIndex is current (${index.version}, ${sections.length} sections).`);
    return;
  }
  writeFileSync(OUT, json);
  console.log(`\nWrote content/ask-index.json (${index.version}, ${sections.length} sections).`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
