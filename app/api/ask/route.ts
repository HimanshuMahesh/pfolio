/**
 * POST /api/ask — Hima's brain. Streams NDJSON AskEvents (lib/ask/protocol).
 * See docs/hima-ai-plan.md §7.
 */
import { answer } from "@/lib/ask/answer";
import { allow, clientKey, readRequest, sameOrigin } from "@/lib/ask/guard";
import type { AskEvent } from "@/lib/ask/protocol";

const MAX_BODY = 8 * 1024;
/** Tell the visitor how many questions are left once it's this few. */
const WARN_AT = 3;

/** The answer, then (when running low) how many questions are left. */
async function* withQuota(events: AsyncGenerator<AskEvent>, left: number): AsyncGenerator<AskEvent> {
  yield* events;
  if (left <= WARN_AT) yield { t: "quota", left };
}

const json = (e: AskEvent, status: number) =>
  new Response(`${JSON.stringify(e)}\n`, { status, headers: { "Content-Type": "application/x-ndjson" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ t: "error", code: "bad_request" }, 403);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) return json({ t: "error", code: "bad_request" }, 413);

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ t: "error", code: "bad_request" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ t: "error", code: "bad_request" }, 400);
  }
  const ask = readRequest(body);
  if (!ask) return json({ t: "error", code: "bad_request" }, 400);
  const allowance = allow(clientKey(req));
  if (!allowance.ok) return json({ t: "limit", scope: allowance.scope, retry: allowance.retry }, 429);

  const enc = new TextEncoder();
  const events = withQuota(answer(ask, req.signal), allowance.left);
  const stream = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      try {
        const { value, done } = await events.next();
        if (done) return ctrl.close();
        ctrl.enqueue(enc.encode(`${JSON.stringify(value)}\n`));
      } catch {
        ctrl.enqueue(enc.encode(`${JSON.stringify({ t: "error", code: "upstream" } satisfies AskEvent)}\n`));
        ctrl.close();
      }
    },
    async cancel() {
      await events.return(undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
