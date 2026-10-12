/** Run with: npx tsx --test lib/ask/tags.test.ts */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createTagStripper, type TagEvent } from "./tags";

function run(deltas: string[]) {
  const s = createTagStripper();
  const events: TagEvent[] = [...deltas.flatMap((d) => s.push(d)), ...s.flush()];
  return {
    text: events.filter((e) => e.kind === "text").map((e) => (e as { v: string }).v).join(""),
    tags: events.filter((e) => e.kind === "tag").map((e) => (e as { id: string }).id),
  };
}

const SAMPLE = "[[about.experience.tavant]] He builds agents at Tavant [[home.hero]]. Arrays like a[0] stay, and [x] too.";
const TEXT = "He builds agents at Tavant. Arrays like a[0] stay, and [x] too.";

test("whole string", () => {
  assert.deepEqual(run([SAMPLE]), { text: TEXT, tags: ["about.experience.tavant", "home.hero"] });
});

test("split at every possible point", () => {
  for (let i = 0; i <= SAMPLE.length; i++) {
    assert.deepEqual(run([SAMPLE.slice(0, i), SAMPLE.slice(i)]), { text: TEXT, tags: ["about.experience.tavant", "home.hero"] }, `split at ${i}`);
  }
});

test("one character at a time", () => {
  assert.deepEqual(run([...SAMPLE]), { text: TEXT, tags: ["about.experience.tavant", "home.hero"] });
});

test("unclosed tag at the end comes back as text", () => {
  assert.deepEqual(run(["Hi [[about.exp"]), { text: "Hi [[about.exp", tags: [] });
});

test("a newline inside brackets means it was never a tag (its stray ]] still goes)", () => {
  assert.deepEqual(run(["see [[note\nthis]] ok"]), { text: "see [[note\nthis ok", tags: [] });
});

test("[[none]] is reported like any tag (the route drops it)", () => {
  assert.deepEqual(run(["[[none]]   Hmm, not on this site."]), { text: "Hmm, not on this site.", tags: ["none"] });
});

test("a stray ]] is dropped, a lone ] is kept", () => {
  assert.deepEqual(run(["Done.]", "] And a] b"]), { text: "Done. And a] b", tags: [] });
});

test("a tag between words keeps one space", () => {
  assert.deepEqual(run(["He builds [[a.b]] agents"]), { text: "He builds agents", tags: ["a.b"] });
});
