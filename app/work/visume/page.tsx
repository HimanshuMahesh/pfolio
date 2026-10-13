import type { Metadata } from "next";
import { BrainIcon } from "@phosphor-icons/react/dist/ssr/Brain";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/ssr/ChatsCircle";
import { CloudIcon } from "@phosphor-icons/react/dist/ssr/Cloud";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { NotePencilIcon } from "@phosphor-icons/react/dist/ssr/NotePencil";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/ssr/PlayCircle";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { VideoCameraIcon } from "@phosphor-icons/react/dist/ssr/VideoCamera";
import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr/WifiSlash";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack,
} from "@/components/case/Brief";
import { Video } from "@/components/case/Video";

export const metadata: Metadata = {
  title: `Visume · ${site.name}`,
  description:
    "Visume replaces resume screening with a five-minute AI video interview. Product design and AI engineering by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "how", label: "How it works", icon: <ListChecksIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
  { id: "v1", label: "First version", icon: <PlayCircleIcon weight="duotone" /> },
];

export default function VisumeCaseStudy() {
  return (
    <BriefPage rail={rail} accent="#3b82f6" next={{ href: "/work/smriti", name: "Smriti" }}>
      <BriefHeader
        kicker="AI · Hiring · 2025–26"
        title="Visume"
        lede="Resume screening, replaced by a five-minute AI interview. Candidates record once. Hiring teams get a ranked shortlist with the video, the transcript and a score for each person."
        link={{ href: "https://visume.co.in", label: "visume.co.in", live: true }}
        role="Early team at GridRnD, built with Tejas, Dev and Ruhi. Product design, AI engineering, full-stack"
        timeline="2025 to 2026, live"
        platform="Web app, desktop and mobile"
        stack="React, Express, Prisma, MySQL"
        cover={{ src: "/work/visume.mp4", poster: "/work/visume-poster.jpg" }}
        coverBg="radial-gradient(80% 50% at 50% 60%, #1e6bff 0%, transparent 70%), linear-gradient(180deg, #041233, #06205c 60%, #020a1f)"
        metric={{ value: "1,000+", label: "interviews taken" }}
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

      <Section id="how" n="03" label="How it works" title="One interview from the candidate. A ranked shortlist for the team.">
        <Points
          items={[
            { icon: NotePencilIcon, title: "Post a role in a minute", text: "The hiring team writes the job once: the role, skills as tags, the experience range and locations. That's what every interview is built around." },
            { icon: VideoCameraIcon, title: "Candidates interview once", text: "Each candidate records a five-minute interview from the browser, on desktop or phone, whenever suits them. The interviewer speaks every question aloud, so it feels like a conversation, not a form." },
            { icon: ChatsCircleIcon, title: "Questions that follow up", text: "Questions are written from the candidate's resume, the role and their answers so far, so two people applying for the same job don't get the same interview." },
            { icon: WifiSlashIcon, title: "Forgiving of a bad connection", text: "The interview checks that someone is still in front of the camera. If they drop out, it pauses rather than ends, so a flaky connection doesn't cost anyone their attempt." },
            { icon: BrainIcon, title: "Scored and summarised", text: "Every interview comes back with a skills score, a communication breakdown and a short AI summary, next to the recording and a transcript you can read along with." },
            { icon: ChartLineUpIcon, title: "Start from a ranked list", text: "Recruiters search by role and location and see candidates with their scores, then shortlist in a click. The dashboard tracks everyone from shortlisted to offer." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Interface", items: ["React", "Vite", "Tailwind", "Zustand", "Framer Motion", "ApexCharts", "Monaco"] },
            { icon: HardDrivesIcon, label: "Server", items: ["Node.js", "Express", "Prisma", "MySQL", "JWT", "Google sign-in"] },
            { icon: BrainIcon, label: "AI + voice", items: ["Gemini", "OpenRouter", "AssemblyAI", "Amazon Polly"] },
            { icon: CloudIcon, label: "Infra", items: ["Cloudflare R2", "Netlify"] },
          ]}
        />
      </Section>

      <Section id="v1" n="05" label="First version" title="Where it started.">
        <Video
          id="zHavn2c3aJo"
          title="Looking back at the first Visume prototype"
          caption="The first Visume prototype, from the demo we submitted to Accel. The product has moved a long way since."
          note="Fair warning: it’s old, and I shot it like an amateur."
        />
      </Section>
    </BriefPage>
  );
}
