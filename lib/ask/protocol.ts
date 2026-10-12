/**
 * Shapes shared by the indexer, the /api/ask route and the Hima panel.
 * See docs/hima-ai-plan.md.
 */

/** One navigable section of the site, as crawled into content/ask-index.json. */
export type Section = {
  /** Dot path, e.g. "about.experience.tavant". */
  id: string;
  /** Route the section lives on, e.g. "/about". */
  route: string;
  /** DOM id to scroll to; null means the top of the page. */
  anchor: string | null;
  /** Page name, e.g. "About". */
  page: string;
  title: string;
  aliases: string[];
  text: string;
};

export type AskIndex = { version: string; sections: Section[] };

/** What the panel shows as a source chip, and where a chip goes. */
export type Source = Pick<Section, "id" | "route" | "anchor" | "page" | "title">;

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** A message as sent to a model. */
export type Turn = { role: "system" | "user" | "assistant"; content: string };

export type AskRequest = {
  question: string;
  /** Earlier turns, oldest first, plain text (no tags). */
  history: ChatMessage[];
  /** The route the reader is on; Hima only moves the page within it. */
  route: string;
};

/** One line of the NDJSON stream from POST /api/ask. */
export type AskEvent =
  /** First: what retrieval found, and a section on this page to go to now if it's sure. */
  | { t: "meta"; sources: Source[]; nav: Source | null }
  /** The model named a section it used; the first one is its best answer. */
  | { t: "cite"; source: Source; primary: boolean }
  | { t: "text"; v: string }
  | { t: "done" }
  /** How many questions this visitor has left today (sent when it's getting low). */
  | { t: "quota"; left: number }
  /** This visitor has asked enough for now; Hima rests until `retry` seconds from now. */
  | { t: "limit"; scope: "minute" | "day"; retry: number }
  /** Something failed; the panel falls back to its scripted answers. */
  | { t: "error"; code: "rate_limited" | "bad_request" | "upstream" };
