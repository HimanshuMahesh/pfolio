/**
 * Hima: Himanshu's little bot, who lives in the homepage's ask panel. For
 * now Hima answers from this file, not a model: each topic has the words
 * that point to it and an answer, in Hima's voice (Himanshu is "he").
 * Answers take two kinds of markup: [label](href) links and blank lines
 * between paragraphs. Everything here restates copy that's already on the
 * site; keep it that way.
 */
import { site } from "./site";

export const askName = "Hima";

/** Shown in the empty panel, in this order. */
export const starters = [
  "What does he do at Tavant?",
  "What is Spacered?",
  "Tell me about TaskLearn and Visume",
  "How does he mix design and engineering?",
];

export type Topic = {
  id: string;
  /** Lower-case words or phrases; each one found in the question scores a point. */
  keys: string[];
  answer: string;
  /** Up to two questions offered under the answer. */
  next: string[];
};

export const topics: Topic[] = [
  {
    id: "hello",
    keys: ["hi", "hello", "hey", "yo", "sup", "who is himanshu", "who is he", "about him", "introduce"],
    answer:
      "Hi! I’m Hima, Himanshu’s little bot. He’s an AI engineer and product designer in Bengaluru: he builds agents at Tavant, runs a design studio called Spacered, and is building TaskLearn and Visume on the side.\n\nAsk me about any of it.",
    next: ["What does he do at Tavant?", "What is Spacered?"],
  },
  {
    id: "tavant",
    keys: ["tavant", "job", "day job", "work at", "agents", "agent", "mcp", "claude code", "plugin", "enterprise"],
    answer:
      "He’s an AI engineer at Tavant, on enterprise AI platform engineering, and has built roughly 40 production agents across data science automation and Ad Ops.\n\nRight now he’s building an agent builder that ships with the Tavant platform: a Claude Code plugin that turns a spec into a production-ready agent, with tools, evals and guardrails wired in from the start instead of bolted on afterwards. Along the way he wrote MCP servers so agents reach internal tools through one interface, and eval harnesses to test behaviour before release.",
    next: ["How does he think about evals?", "How does he mix design and engineering?"],
  },
  {
    id: "evals",
    keys: ["eval", "evals", "evaluation", "guardrail", "guardrails", "testing agents", "fail", "confidence", "llm"],
    answer:
      "His rule: evals before vibes. If you can’t say how an agent fails, you haven’t finished building it.\n\nSo the evals go in at the start, next to the tools and guardrails, not after the demo works. He also thinks what an agent shows when it isn’t confident is a design problem, not a model problem. I agree, for the record.",
    next: ["What does he do at Tavant?", "Tell me about North"],
  },
  {
    id: "spacered",
    keys: ["spacered", "studio", "agency", "clients", "ola", "triplespeed", "cortekz", "branding", "brand"],
    answer:
      "Spacered is the design studio he runs. It works with deep-tech and fast-moving startups, Ola Electric, TripleSpeed and Cortekz among them.\n\nHe set up the studio’s positioning, service structure and identity, and built a 10-agent internal stack that runs the whole client lifecycle, from lead intake and proposals through delivery, invoicing and case studies, so output doesn’t scale with headcount. [See the case study](/work/spacered).",
    next: ["What is Studio OS?", "Tell me about TaskLearn and Visume"],
  },
  {
    id: "studio-os",
    keys: ["studio os", "internal", "operating system"],
    answer:
      "Studio OS is the internal system that runs Spacered: the agents behind proposals, delivery, invoicing and case studies. It’s still a work in progress, so it’s taped off on the homepage for now.",
    next: ["What is Spacered?", "How does he think about evals?"],
  },
  {
    id: "tasklearn",
    keys: ["tasklearn", "task learn", "learning", "learners", "badges", "edtech"],
    answer:
      "TaskLearn is an AI learning platform where you learn a skill by doing real tasks and earning badges. It’s at 10,000+ learners.\n\nHe joined GridRnD early and carried it to launch, owning the product design and user flows, and building wherever something needed building. [Read the case study](/work/tasklearn) or try it at [tasklearn.app](https://tasklearn.app).",
    next: ["What about Visume?", "How does he mix design and engineering?"],
  },
  {
    id: "visume",
    keys: ["visume", "hiring", "interview", "interviews", "resume screening", "recruit", "video"],
    answer:
      "Visume replaces resume screening with a 5-minute AI video interview. More than 1,000 interviews have been taken on it so far.\n\nHe owned the product design and flows, and worked on the candidate scoring logic and the interview experience itself. [Read the case study](/work/visume) or visit [visume.co.in](https://visume.co.in).",
    next: ["Tell me about TaskLearn", "What does he do at Tavant?"],
  },
  {
    id: "gridrnd",
    keys: ["gridrnd", "grid rnd", "early team", "building", "side projects", "products", "startup", "startups"],
    answer:
      "Outside the day job he’s building two products with GridRnD, an early-stage product studio: TaskLearn and Visume. He joined early and carried both to launch.",
    next: ["Tell me about TaskLearn", "What about Visume?"],
  },
  {
    id: "north",
    keys: ["north", "finance", "fintech", "csv", "bank", "money"],
    answer:
      "North is personal finance you can talk to. Upload a bank CSV, ask anything, and a team of agents answers it. A bit like me, but with money. [Read the case study](/work/north).",
    next: ["How does he think about evals?", "What else has he worked on?"],
  },
  {
    id: "smriti",
    keys: ["smriti", "xython", "biotech", "project management"],
    answer:
      "Smriti Operations is AI-enabled project management, made for Xython Biotech. [Read the case study](/work/smriti).",
    next: ["What else has he worked on?", "What is Spacered?"],
  },
  {
    id: "work",
    keys: ["projects", "portfolio", "work", "worked on", "case study", "case studies", "selected"],
    answer:
      "The selected work on this page: [TaskLearn](/work/tasklearn), [Visume](/work/visume), [Smriti Operations](/work/smriti) for Xython Biotech, [North](/work/north), and the identity for [Spacered](/work/spacered). Studio OS is still in progress.",
    next: ["Tell me about North", "What is Spacered?"],
  },
  {
    id: "craft",
    keys: ["design and engineering", "designer", "design", "engineer", "skills", "pixels", "craft", "both", "product designer", "mix"],
    answer:
      "He’s an engineer who cares way too much about pixels. He works both sides: product design and user flows, and the engineering under them, from agents and evals to frontends.\n\nBeing on both sides means fewer handoffs. What he designs is something he knows can be built, and what he builds gets the care a design deserves. He drew my eyes too.",
    next: ["How does he think about evals?", "What else has he worked on?"],
  },
  {
    id: "education",
    keys: ["college", "university", "degree", "study", "studied", "education", "dsatm", "cgpa", "student", "hackathon", "hackathons"],
    answer:
      "B.E. in Computer Science at Dayananda Sagar Academy of Technology and Management, Bengaluru, 2022 to 2026, with a 9.0 CGPA. That ran alongside two products, two national hackathons and a design studio. [More on the about page](/about).",
    next: ["What does he do at Tavant?", "What does he do for fun?"],
  },
  {
    id: "fun",
    keys: ["fun", "hobby", "hobbies", "free time", "interests", "f1", "formula", "movies", "read", "reading", "travel", "side-quest"],
    answer:
      "He reads a lot, watches every Formula 1 race, and likes movies, pop culture and internet archiving. He travels whenever he can, and he’s always wrapped up in some creative side-quest. [The fun page](/fun) has the evidence.",
    next: ["Where is he based?", "How was this site made?"],
  },
  {
    id: "where",
    keys: ["where", "based", "location", "city", "bengaluru", "bangalore", "india", "timezone", "time zone", "sky"],
    answer:
      "Bengaluru, India, on IST. The sky at the top of this page is the real sky over Bengaluru right now, sun and all. Hover it to scrub through the day.",
    next: ["How can I reach him?", "How was this site made?"],
  },
  {
    id: "contact",
    keys: ["contact", "email", "reach", "hire", "hiring him", "available", "freelance", "collaborate", "work together", "say hi", "linkedin"],
    answer: `Email is best: [${site.email}](mailto:${site.email}). Or hit [Say hi](/#contact) at the bottom of the page. He’s in Bengaluru, so replies come on IST.`,
    next: ["What is Spacered?", "What does he do at Tavant?"],
  },
  {
    id: "site",
    keys: ["this site", "website", "built", "made", "stack", "next", "font", "typeface", "blueprint"],
    answer:
      "Next.js, set in Zalando Sans with a pixel face for the keys. The sky is drawn live for Bengaluru’s real sun, and on first visit the page draws itself as a blueprint before it inks in.\n\nI’m the newest part. I mostly look around.",
    next: ["Who are you?", "Where is he based?"],
  },
  {
    id: "meta",
    keys: ["who are you", "are you real", "are you an ai", "actually an ai", "chatbot", "bot", "hima", "gpt", "model", "trained", "your name"],
    answer:
      "I’m Hima, Himanshu’s little bot. I know what’s on this site and not much else yet, so I’m best on his work, his studio and his side-quests. A proper brain comes later.",
    next: ["What does he do at Tavant?", "What does he do for fun?"],
  },
];

export const fallback = {
  answer: `Hmm, I don’t know that one. I only know what’s on this site, so I’m best on his work, the studio and side-quests. For anything else, [email Himanshu](mailto:${site.email}).`,
  next: ["What else has he worked on?", "What is Spacered?"],
};

const words = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9.+@\s-]/g, " ").replace(/\s+/g, " ")} `;

/**
 * The best topic for a question: every key found (as whole words) scores
 * its length in words, so "studio os" beats "studio". Two topics tied at the
 * top ("TaskLearn and Visume") are answered together.
 */
export function answerFor(question: string): { answer: string; next: string[] } {
  const best = rank(question);
  if (!best.length) return fallback;
  // Offer follow-ups that lead somewhere new, not back to what was just answered.
  const next = [...new Set(best.flatMap((t) => t.next))].filter((n) => !best.includes(rank(n)[0])).slice(0, 2);
  return { answer: best.map((t) => t.answer).join("\n\n"), next };
}

/** The top-scoring topics for a question: one, or two when tied. */
function rank(question: string): Topic[] {
  const q = words(question);
  const scored = topics
    .map((t) => ({ t, score: t.keys.reduce((n, k) => (q.includes(` ${k} `) ? n + k.split(" ").length : n), 0) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score === scored[0].score).slice(0, 2).map((s) => s.t);
}

/** What Hima says when a visitor has asked enough for now (see lib/ask/guard.ts). */
export const resting = {
  minute: "Phew, that’s a lot of questions at once. Give me a minute to catch my breath, then ask away.",
  day: `That’s all the questions I can answer today. I’m a small bot on a free plan, so come back tomorrow! Or skip me and email Himanshu at [${site.email}](mailto:${site.email}).`,
  /** Under the field while resting. */
  placeholder: { minute: "Catching my breath…", day: "Hima’s resting. Back tomorrow." },
  /** Under the field when few are left. */
  left: (n: number) => (n === 0 ? "That was my last answer for today." : `${n} question${n === 1 ? "" : "s"} left today.`),
};

/** Shown when the models are down and Hima answers from the scripted topics above. */
export const offlineNote = "Quick answer: my bigger brain is napping.";
