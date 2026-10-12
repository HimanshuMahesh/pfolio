/**
 * Pulls [[section.id]] tags out of a model's streamed text. Deltas can split a
 * tag anywhere ("[", "[about.exp", "erience.tavant]]"), so this is a small
 * state machine fed one delta at a time. Text outside tags passes straight
 * through; a complete tag is reported through onTag and never reaches the
 * reader. See docs/hima-ai-plan.md §6.5.
 */
export type TagEvent = { kind: "text"; v: string } | { kind: "tag"; id: string };

const MAX_TAG = 96;

export function createTagStripper() {
  let buf = "";       // held back: a "[" that may start a tag, or a tag in progress
  let inTag = false;
  let started = false; // nothing visible sent yet: trim the space after a leading tag
  let ws = "";         // trailing spaces held back until we know what follows them
  let tagged = false;  // a tag was removed since the held spaces

  const emitText = (out: TagEvent[], v: string) => {
    if (!started) {
      v = v.replace(/^\s+/, "");
      if (!v) return;
      started = true;
    }
    // "Tavant [[x]]." would leave "Tavant ." — drop the space before punctuation
    let lead = tagged && /^[.,;:!?)]/.test(v) ? "" : ws;
    if (tagged && /^\s/.test(v)) lead = "";
    tagged = false;
    const body = v.replace(/\s+$/, "");
    ws = v.slice(body.length);
    if (lead + body) out.push({ kind: "text", v: lead + body });
    else ws = lead + ws;
  };

  function push(delta: string): TagEvent[] {
    const out: TagEvent[] = [];
    let text = "";
    for (const ch of delta) {
      if (inTag) {
        buf += ch;
        if (buf.endsWith("]]")) {
          const id = buf.slice(2, -2).trim();
          buf = "";
          inTag = false;
          if (text) {
            emitText(out, text);
            text = "";
          }
          tagged = true;
          out.push({ kind: "tag", id });
        } else if (ch === "\n" || buf.length > MAX_TAG) {
          // Not a tag after all: give it back as text
          text += buf;
          buf = "";
          inTag = false;
        }
      } else if (buf === "]") {
        // A stray "]]" (the model fumbled a tag) is dropped; a lone "]" is text
        if (ch === "]") {
          buf = "";
        } else if (ch === "[") {
          text += "]";
          buf = "[";
        } else {
          text += "]" + ch;
          buf = "";
        }
      } else if (buf === "[") {
        if (ch === "[") {
          buf = "[[";
          inTag = true;
        } else {
          text += buf + ch;
          buf = "";
        }
      } else if (ch === "[" || ch === "]") {
        buf = ch;
      } else {
        text += ch;
      }
    }
    if (text) emitText(out, text);
    return out;
  }

  /** End of stream: anything still held back was never a tag. */
  function flush(): TagEvent[] {
    const out: TagEvent[] = [];
    if (buf) emitText(out, buf);
    buf = "";
    inTag = false;
    return out;
  }

  return { push, flush };
}
