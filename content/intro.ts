import type { StaticImageData } from "next/image";
import tasklearnOg from "@/assets/og/tasklearn.png";
import olaLogo from "@/assets/startups/ola-electric.png";
import triplespeedLogo from "@/assets/startups/triplespeed.png";
import cortekzMark from "@/assets/startups/cortekz-mark.svg";
import visumeOg from "@/assets/og/visume.png";

/* The people and products named in the hero introduction. */

export type Startup = {
  name: string;
  /** Official logo, from the company's own site. Rendered monochrome (white on dark, black on light). */
  logo: StaticImageData;
  /** Display height in px, tuned per logo so they read at an even optical size. */
  height: number;
  /** Text set beside the logo, for a symbol-only mark or to complete the name. */
  wordmark?: string;
  /** Wordmark size in px (default 20). */
  wordmarkSize?: number;
};

/** Startups Spacered works with — shown when hovering "deep-tech and fast-moving startups". */
export const startups: Startup[] = [
  { name: "Ola Electric", logo: olaLogo, height: 20, wordmark: "Electric", wordmarkSize: 14 },
  { name: "TripleSpeed", logo: triplespeedLogo, height: 24 },
  { name: "Cortekz", logo: cortekzMark, height: 24, wordmark: "Cortekz" },
];

export type SideQuest = {
  /** Aspect ratio of the frame, e.g. "4 / 5". */
  ratio: string;
  /** Add a photo here; until then the frame shows empty. */
  image?: StaticImageData;
  alt?: string;
};

/** Frames that fan out when hovering "creative side-quest". */
export const sideQuests: SideQuest[] = [{ ratio: "4 / 5" }, { ratio: "3 / 2" }, { ratio: "1 / 1" }];

export type Venture = {
  name: string;
  href: string;
  /** Display form of the URL. */
  domain: string;
  tagline: string;
  og: StaticImageData;
};

/** What I'm building — each shows its OG card on hover. */
export const ventures: Venture[] = [
  {
    name: "TaskLearn",
    href: "https://tasklearn.app",
    domain: "tasklearn.app",
    tagline: "Master any skill, one task at a time",
    og: tasklearnOg,
  },
  {
    name: "Visume",
    href: "https://visume.co.in",
    domain: "visume.co.in",
    tagline: "Ending the era of soulless hiring",
    og: visumeOg,
  },
];
