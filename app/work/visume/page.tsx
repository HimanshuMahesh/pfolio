import type { Metadata } from "next";
import { BracketsCurlyIcon } from "@phosphor-icons/react/dist/ssr/BracketsCurly";
import { CloudIcon } from "@phosphor-icons/react/dist/ssr/Cloud";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FilmStripIcon } from "@phosphor-icons/react/dist/ssr/FilmStrip";
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/ssr/SpeakerHigh";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/ssr/ChatsCircle";
import { WaveformIcon } from "@phosphor-icons/react/dist/ssr/Waveform";
import { WrenchIcon } from "@phosphor-icons/react/dist/ssr/Wrench";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack, Stats,
} from "@/components/case/Brief";

export const metadata: Metadata = {
  title: `Visume — ${site.name}`,
  description:
    "Visume replaces resume screening with a five-minute AI video interview. Product design and AI engineering by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "notes", label: "Build notes", icon: <WrenchIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
];

export default function VisumeCaseStudy() {
  return (
    <BriefPage rail={rail} accent="#3b82f6" next={{ href: "/work/smriti", name: "Smriti" }}>
      <BriefHeader
        kicker="AI · Hiring · 2025–26"
        title="Visume"
        lede="Resume screening, replaced by a five-minute AI interview. Candidates record once. Hiring teams get a ranked shortlist with the video, the transcript and a score for each person."
        link={{ href: "https://visume.co.in", label: "visume.co.in", live: true }}
        role="Early team at GridRnD. Product design, AI engineering, full-stack"
        timeline="2025 to 2026, live"
        platform="Web app, desktop and mobile"
        stack="React, Express, Prisma, MySQL"
        cover={{ src: "/work/visume.mp4", poster: "/work/visume-poster.jpg" }}
        coverBg="radial-gradient(80% 50% at 50% 60%, #1e6bff 0%, transparent 70%), linear-gradient(180deg, #041233, #06205c 60%, #020a1f)"
      />

      <Section id="overview" n="01" label="Overview" title="A PDF tells you where someone worked. Five minutes of them talking tells you the rest.">
        <Prose>
          <p>
            Recruiters skim hundreds of near-identical resumes and decide on formatting. Visume swaps the stack of PDFs
            for a short interview the candidate takes once, whenever suits them. An AI interviewer asks the questions,
            follows up on the answers, and scores what it hears. The hiring team starts from a ranked list instead of a
            pile.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "1,000+", label: "interviews taken" },
            { value: "2", label: "sides of the hiring table, served by one product" },
            { value: "60s", label: "between checks that a real person is still there" },
          ]}
        />
      </Section>

      <Section id="screens" n="02" label="Screens" title="Light, calm and blue, because hiring is stressful enough.">
        <Screens
          items={[
            { src: "/work/visume/dashboard.jpg", wide: true, alt: "The employer dashboard: counts for shortlisted, unlocked, interviews and offers sent, above a table of active job postings.", caption: "The hiring team's home: shortlisted, unlocked, interviewed, offered." },
            { src: "/work/visume/jd.jpg", alt: "The new job description form with skills as removable tags, experience range and locations.", caption: "A job description in a minute: role, skills as tags, experience, locations." },
            { src: "/work/visume/search.jpg", alt: "Find your next hire: a search by role and location, with candidates listed alongside their interview skill scores.", caption: "Search by role and place. Every result carries a score from the interview." },
            { src: "/work/visume/profile.jpg", alt: "A candidate profile with the interview video playing and the current question shown beneath it.", caption: "A candidate: the recording, the question being answered, the transcript beside it." },
            { src: "/work/visume/scores.jpg", alt: "Scores: a 65% skills ring, a communication radar chart, and an AI summary with a Shortlist Candidate button.", caption: "Skills and communication scores, an AI summary, and one button to shortlist." },
          ]}
        />
      </Section>

      <Section id="notes" n="03" label="Build notes" title="Most of the work was making a browser behave like a studio.">
        <Points
          items={[
            { icon: SpeakerHighIcon, title: "The question is in the recording", text: "Questions are spoken with Amazon Polly, and that audio is mixed into the candidate's recording. A reviewer hears the question and the answer in one take, not a face talking to silence." },
            { icon: WaveformIcon, title: "Transcripts while they talk", text: "Answers stream to AssemblyAI over a socket as the candidate speaks, so the transcript is ready the moment they stop." },
            { icon: ChatsCircleIcon, title: "Questions that follow up", text: "Each question is written from the resume, the role and every answer so far. Two candidates for the same job don't get the same interview." },
            { icon: EyeIcon, title: "Is anyone there?", text: "Once a minute a webcam frame goes to Gemini to check a person is in shot. Miss twice and the interview pauses rather than ends, so a bad connection doesn't cost anyone their attempt." },
            { icon: BracketsCurlyIcon, title: "Scores as data, not prose", text: "Scoring asks the model for JSON that matches a schema, with OpenRouter behind Gemini if it fails. The UI never has to parse an essay." },
            { icon: FilmStripIcon, title: "Videos you can scrub", text: "Browsers record WebM without a duration, so seeking breaks. Each recording is patched before upload, so the player's timeline works." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Interface", items: ["React 18", "Vite", "Tailwind", "Zustand", "Framer Motion", "ApexCharts", "Monaco"] },
            { icon: HardDrivesIcon, label: "Server", items: ["Node", "Express", "Prisma", "MySQL", "JWT + Google sign-in"] },
            { icon: CloudIcon, label: "Infra", items: ["Cloudflare R2", "Netlify"] },
          ]}
        />
      </Section>
    </BriefPage>
  );
}
