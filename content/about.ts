/**
 * Copy for /about: the bento intro, experience and gallery.
 * Details follow Himanshu_Resume_New.html.
 */

export const resumeHref = "/resume.pdf";
/** File name the resume saves under when downloaded. */
export const resumeFileName = "Himanshu K Mahesh · Resume.pdf";

export const enjoying: Array<{ label: string; note?: string }> = [
  { label: "Reading", note: "avid" },
  { label: "Movies & pop culture" },
  { label: "Formula 1", note: "every race" },
  { label: "Internet archiving" },
  { label: "Travel", note: "whenever I can" },
];

/** How an entry's logo key is drawn. */
export type EntryMark =
  | { kind: "tavant" }
  | { kind: "spacered" }
  | { kind: "text"; text: string; color?: string };

export type Entry = {
  /** Anchor for the row (#experience-<slug>) and its section id for Hima. */
  slug: string;
  /** Words people use for this entry that its copy doesn't, for Hima's search. */
  aliases?: string[];
  title: string;
  date: string;
  sub: string;
  description: string;
  mark: EntryMark;
  /** Screens (paths in public/) fanned out under the entry on hover. */
  assets?: string[];
  /** Until there are screens: this many line-patterned cards in the fan. */
  placeholders?: number;
};

export const experiencePeriod = "2022 — 2026";

export const experience: Entry[] = [
  {
    slug: "tavant",
    aliases: ["day job", "current job", "ai engineer", "agents", "production agents", "agent builder", "claude code", "mcp", "evals"],
    title: "AI Engineer Intern",
    date: "Jan 2026 — Jul 2026",
    sub: "Tavant · Enterprise AI platform engineering",
    mark: { kind: "tavant" },
    assets: [
      "/about/tavant/cafe.jpg",
      "/about/tavant/agent.jpg",
      "/about/tavant/karpathy.jpg",
      "/about/tavant/atrium.jpg",
    ],
    description:
      "Built roughly 40 production agents across data science automation and Ad Ops. Building an agent builder that ships as part of the Tavant platform: a Claude Code plugin that turns a spec into a production-ready agent, with tools, evals and guardrails wired in from the start instead of bolted on afterwards. Wrote MCP servers so agents reach internal tools through one interface, built eval harnesses to test behaviour before release, and ran studies on new models, agent frameworks and protocols to see what actually holds up in production.",
  },
  {
    // TODO: confirm title — resume says "Designer"; he now runs the studio
    slug: "spacered",
    aliases: ["studio", "agency", "design studio", "clients", "ola electric", "triplespeed", "cortekz", "abhi", "avi"],
    title: "Designer",
    date: "Jan 2026 — Present",
    sub: "Spacered · New-age design agency",
    mark: { kind: "spacered" },
    assets: [
      "/work/spacered/hero.jpg",
      "/work/spacered/services.jpg",
      "/work/spacered/process.jpg",
      "/work/spacered/warp.jpg",
      "/work/spacered/booking.jpg",
    ],
    description:
      "A design agency, built and run with Abhi and Avi, working with deep-tech and fast-moving startups, including Ola Electric, TripleSpeed and Cortekz. Set up the studio’s positioning, service structure and visual identity system, and built a 10-agent internal stack covering the full client lifecycle, from lead intake and proposals through delivery, invoicing and case studies, so output does not scale linearly with headcount.",
  },
  {
    slug: "gridrnd",
    aliases: ["tasklearn", "visume", "product studio", "side projects", "tejas", "ruhi"],
    title: "Early Team Member",
    date: "Feb 2025 — May 2026",
    sub: "GridRnD · Early-stage product studio",
    mark: { kind: "text", text: "GR" },
    assets: [
      "/work/tasklearn/explore.jpg",
      "/work/visume/dashboard.jpg",
      "/work/tasklearn/score.jpg",
      "/work/visume/scores.jpg",
      "/work/tasklearn/journey.jpg",
    ],
    description:
      "Joined early and built two products with Tejas, Dev and Ruhi, carrying both to launch: TaskLearn, an AI learning platform now at 10,000+ learners, and Visume, an AI video-interview screener with 1,000+ interviews taken. Owned product design and user flows across both, and worked the stack as a generalist wherever something needed building: frontend, candidate scoring logic, and the AI interview experience itself.",
  },
  {
    slug: "education",
    aliases: ["college", "university", "degree", "dsatm", "cgpa", "studied", "hackathons", "school"],
    title: "B.E. Computer Science and Engineering",
    date: "2022 — 2026",
    sub: "Dayananda Sagar Academy of Technology and Management · CGPA 9.0/10.0",
    mark: { kind: "text", text: "DS" },
    assets: [
      "/about/college/fest.jpg",
      "/about/college/boat.jpg",
      "/about/college/tree.jpg",
      "/about/college/lake.jpg",
      "/about/college/fest-2.jpg",
    ],
    description:
      "Four years of computer science in Bengaluru, alongside two products, two national hackathons and a design studio. Before that, Pre-University in Science at Deeksha PU College (2020 — 2022, 92%).",
  },
];

/* ---- Gallery ---------------------------------------------------------------
   Placeholder posts and frames. Give a frame an `image` (a path in public/)
   or a `video` to replace its gradient. */

export type GalleryKind = "post" | "photo" | "video";

export type GalleryItem =
  | {
      kind: "post";
      text: string;
      /** Hashtag or phrase in the text to set in the accent colour. */
      highlight?: string;
      /** Attach a 16:10 image to the post. */
      media?: { fill: string; image?: string };
      href: string;
    }
  | {
      kind: "photo" | "video";
      ratio: string;
      fill: string;
      image?: string;
      video?: string;
      /** Clip length, shown on videos, e.g. "0:14". */
      length?: string;
      title: string;
      tag: string;
    };

export const galleryFilters: Array<{ value: GalleryKind | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "post", label: "Posts" },
  { value: "photo", label: "Art & photos" },
  { value: "video", label: "Video" },
];

// TODO: real X handle (see socialLinks in content/site.ts)
export const xHandle = "@handle";

const fills = {
  earth: "linear-gradient(160deg, #3a3328, #6b5a40)",
  dusk: "radial-gradient(80% 70% at 30% 20%, #ffd6a8, transparent 70%), linear-gradient(200deg, #8aa3c7, #3d4f6e)",
  graphite: "linear-gradient(180deg, #1b1b1b, #3a3a3a)",
  forest: "radial-gradient(90% 80% at 70% 80%, #3f8a5c, transparent 70%), linear-gradient(160deg, #10241a, #1f4a33)",
  rose: "linear-gradient(135deg, #4a2330, #b56a5a)",
  slate: "radial-gradient(70% 60% at 50% 40%, #56708f, transparent 70%), linear-gradient(180deg, #151c27, #2c3a50)",
};

export const gallery: GalleryItem[] = [
  {
    kind: "post",
    text: "Evals before vibes. If you can’t say how an agent fails, you haven’t finished building it.",
    href: "#",
  },
  { kind: "photo", ratio: "4 / 5", fill: fills.dusk, title: "Album art", tag: "Independent artist" },
  { kind: "video", ratio: "1 / 1", fill: fills.graphite, length: "0:14", title: "Agent builder demo", tag: "Clip" },
  {
    kind: "post",
    text: "Rebuilt my portfolio this week. Floating nav, 4:3 everything, zero regrets. #buildinpublic",
    highlight: "#buildinpublic",
    media: { fill: fills.slate },
    href: "#",
  },
  { kind: "photo", ratio: "3 / 2", fill: fills.earth, title: "Event identity", tag: "Branding" },
  { kind: "photo", ratio: "3 / 4", fill: fills.forest, title: "Somewhere new", tag: "Travel" },
  {
    kind: "post",
    text: "What an agent shows when it isn’t confident is a design problem, not a model problem.",
    href: "#",
  },
  { kind: "video", ratio: "9 / 16", fill: fills.rose, length: "0:32", title: "Visume interview flow", tag: "Clip" },
  { kind: "photo", ratio: "1 / 1", fill: fills.dusk, title: "Album art", tag: "Independent artist" },
];
