/**
 * Hima evals (docs/hima-ai-plan.md §10).
 *
 *   npm run ask:eval              retrieval only: offline, instant, free
 *   npm run ask:eval -- --live    also asks the model (uses free quota, ~35 calls)
 */
import { bannedTerms, cases } from "../content/ask-evals";
import { contextFor, earlyNav, retrieve } from "../lib/ask/retrieve";

const LIVE = process.argv.includes("--live");
const pct = (n: number, d: number) => `${Math.round((n / Math.max(d, 1)) * 100)}%`;

async function main() {
  let top1 = 0, answerable = 0, navRight = 0, navChecked = 0, wrongJump = 0;
  const fails: string[] = [];

  for (const c of cases) {
    const hits = retrieve(c.q, c.history ?? [], c.route);
    const best = hits[0]?.section.id.split("#")[0];
    const nav = earlyNav(hits, c.route)?.id ?? null;
    const wanted = c.best.map((b) => b.split("#")[0]);
    if (c.best.length) {
      answerable++;
      if (best && wanted.includes(best)) top1++;
      else fails.push(`top-1  "${c.q}" (${c.route}) → ${best ?? "nothing"}; wanted ${c.best.join(" | ")}`);
    }
    if (c.nav !== undefined) {
      navChecked++;
      if (nav === c.nav) navRight++;
      else fails.push(`nav    "${c.q}" (${c.route}) → ${nav ?? "stay"}; wanted ${c.nav ?? "stay"}`);
    }
    if (nav && nav !== c.nav && !wanted.includes(nav)) wrongJump++;
  }

  console.log(`Retrieval top-1     ${pct(top1, answerable)}  (${top1}/${answerable})   target ≥ 90%`);
  console.log(`Early nav correct   ${pct(navRight, navChecked)}  (${navRight}/${navChecked})`);
  console.log(`Wrong early jumps   ${wrongJump}              target 0`);
  if (fails.length) console.log(`\n${fails.join("\n")}`);

  if (!LIVE) return;
  const { answer } = await import("../lib/ask/answer");
  console.log("\nLive:");
  let tagRight = 0, tagChecked = 0, mentionOk = 0, mentionChecked = 0, banned = 0, ungrounded = 0;
  const ttft: number[] = [];
  for (const c of cases) {
    // Pace like real visitors so the free per-minute token limit isn't the thing being tested
    await new Promise((r) => setTimeout(r, 2500));
    const t0 = performance.now();
    let text = "", primary: string | null = null, first = 0, error = "";
    for await (const e of answer({ question: c.q, history: c.history ?? [], route: c.route }, new AbortController().signal)) {
      if (e.t === "text") {
        if (!first) first = performance.now() - t0;
        text += e.v;
      } else if (e.t === "cite" && e.primary) primary = e.source.id;
      else if (e.t === "error") error = e.code;
    }
    if (first) ttft.push(first);
    if (error) {
      console.log(`  ✗ "${c.q}" → error ${error}`);
      continue;
    }
    const issues: string[] = [];
    tagChecked++;
    if (c.best.length ? primary && c.best.some((b) => b.split("#")[0] === primary) : !primary) tagRight++;
    else issues.push(`tag ${primary ?? "none"}`);
    if (c.mentions) {
      mentionChecked++;
      const missing = c.mentions.filter((m) => !text.toLowerCase().includes(m.toLowerCase()));
      if (!missing.length) mentionOk++;
      else issues.push(`missing ${missing.join(", ")}`);
    }
    if (bannedTerms.some((t) => text.toLowerCase().includes(t))) {
      banned++;
      issues.push("BANNED TERM");
    }
    // Every number in the answer must appear in what the model was shown
    const shown = contextFor(retrieve(c.q, c.history ?? [], c.route)).map((s) => s.text).join(" ").replace(/,/g, "");
    const nums = (text.replace(/,/g, "").match(/\d+(\.\d+)?/g) ?? []).filter((n) => !shown.includes(n));
    if (nums.length) {
      ungrounded++;
      issues.push(`ungrounded ${nums.join(" ")}`);
    }
    console.log(`  ${issues.length ? "✗" : "✓"} ${Math.round(first)}ms "${c.q}" ${issues.join("; ")}\n      ${text.slice(0, 160)}`);
  }
  ttft.sort((a, b) => a - b);
  console.log(`\nPrimary tag correct ${pct(tagRight, tagChecked)}   target ≥ 90%`);
  console.log(`Mentions present    ${pct(mentionOk, mentionChecked)}`);
  console.log(`Banned / ungrounded ${banned} / ${ungrounded}   target 0 / 0`);
  console.log(`First token p50     ${Math.round(ttft[Math.floor(ttft.length / 2)] ?? 0)}ms   target < 400ms (dev, incl. retrieval)`);
}

main();
