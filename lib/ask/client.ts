/**
 * The browser side of /api/ask: posts a question and hands each NDJSON event
 * to a callback as it arrives.
 */
import type { AskEvent, AskRequest } from "./protocol";

export async function streamAsk(req: AskRequest, onEvent: (e: AskEvent) => void, signal: AbortSignal): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal,
    });
  } catch {
    if (!signal.aborted) onEvent({ t: "error", code: "upstream" });
    return;
  }
  if (!res.body) return onEvent({ t: "error", code: "upstream" });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let ended = false;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += value;
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const e = JSON.parse(line) as AskEvent;
          if (e.t === "done" || e.t === "error" || e.t === "limit") ended = true;
          onEvent(e);
        } catch {
          // a malformed line is skipped, never shown
        }
      }
    }
  } catch {
    // connection dropped
  }
  // The stream stopped without saying how it ended
  if (!ended && !signal.aborted) onEvent({ t: "error", code: "upstream" });
}
