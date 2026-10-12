import type { Metadata } from "next";
import { CloudIcon } from "@phosphor-icons/react/dist/ssr/Cloud";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PlayCircleIcon } from "@phosphor-icons/react/dist/ssr/PlayCircle";
import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { TreeIcon } from "@phosphor-icons/react/dist/ssr/Tree";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack,
} from "@/components/case/Brief";
import { Video } from "@/components/case/Video";

export const metadata: Metadata = {
  title: `TaskLearn · ${site.name}`,
  description:
    "TaskLearn, an AI learning platform where you do real work and get it reviewed. Product design and AI engineering by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "how", label: "How it works", icon: <ListChecksIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
  { id: "v1", label: "First version", icon: <PlayCircleIcon weight="duotone" /> },
];

export default function TaskLearnCaseStudy() {
  return (
    <BriefPage rail={rail} accent="#8b6cf0" next={{ href: "/work/visume", name: "Visume" }}>
      <BriefHeader
        kicker="AI · Edtech · 2025–26"
        title="TaskLearn"
        lede="An AI learning platform where you learn by doing the job. Pick a task written like a brief from a real team, ship the work, and get it reviewed the way a senior would review it. Everything you pass lands on a public portfolio."
        link={{ href: "https://tasklearn.app", label: "tasklearn.app", live: true }}
        role="Early team at GridRnD. Product design, AI engineering, full-stack"
        timeline="2025 to 2026, live"
        platform="Web app"
        stack="React 19, Express, Prisma, Postgres"
        cover={{ src: "/work/tasklearn.mp4", poster: "/work/tasklearn-poster.jpg" }}
        coverBg="radial-gradient(120% 70% at 50% 120%, #7c5cf0 0%, #2a1470 40%, #000 75%)"
        metric={{ value: "10,000+", label: "learners" }}
      />

      <Section id="overview" n="01" label="Overview" title="A certificate proves you watched something. TaskLearn asks you to make something.">
        <Prose>
          <p>
            Courses end in a quiz, and a quiz can&rsquo;t tell anyone whether you can write a PRD, design a flow or ship
            an app. So every task on TaskLearn ends in a real deliverable: a repo, a deck, a prototype. A model reviews
            it against the task&rsquo;s own rubric, and the result is something you can show, not just a badge.
          </p>
        </Prose>
      </Section>

      <Section id="screens" n="02" label="Screens" title="Dark, a little tactile, and violet where it counts.">
        <Screens
          items={[
            { src: "/work/tasklearn/explore.jpg", wide: true, alt: "TaskLearn's Explore page: recommended tasks filtered by track, each card showing a preview of the thing you'll build.", caption: "Explore. Tasks picked for your interests, each cover showing the thing you'll make." },
            { src: "/work/tasklearn/journey.jpg", alt: "A task's journey: four steps with time estimates, three ticked off, and an Ask Lumo box.", caption: "A task breaks into timed steps. Lumo, the assistant, sits under each one." },
            { src: "/work/tasklearn/deliverables.jpg", alt: "Required deliverables: three PDF files, one uploaded and one uploading at 50%.", caption: "Deliverables are named up front, so a submission is a checklist, not a guess." },
            { src: "/work/tasklearn/score.jpg", alt: "Lumo review: a dial reading 86 out of 100, marked passed.", caption: "The review: one score out of 100, then the rubric that built it." },
            { src: "/work/tasklearn/annotated.jpg", alt: "A submitted screen map with numbered review notes pinned to parts of the design.", caption: "Notes pinned to the work itself, numbered, instead of a wall of text." },
            { src: "/work/tasklearn/portfolio.jpg", wide: true, alt: "The learner's portfolio: stats, a skill score dial, an activity heatmap and growth milestones from Sapling to Forest.", caption: "The portfolio: activity, milestones and skills, built only from work that passed review." },
          ]}
        />
      </Section>

      <Section id="how" n="03" label="How it works" title="Pick a brief, do the work, get a real review.">
        <Points
          items={[
            { icon: CompassIcon, title: "Tasks written like briefs", text: "Every task reads like a request from a real team: what to make, who it's for, and what done looks like. Explore suggests tasks for the tracks you pick, and each card shows the thing you'll build." },
            { icon: SparkleIcon, title: "Steps, with help on hand", text: "A task breaks into timed steps. Lumo, the built-in assistant, sits under each one to unblock you without doing the work for you." },
            { icon: SealCheckIcon, title: "Reviewed like a senior would", text: "Hand in the named deliverables, a repo, a deck or a prototype, and get a score out of 100 against the task's own rubric, with notes pinned to the exact part of the work they're about." },
            { icon: TreeIcon, title: "A portfolio that proves it", text: "Only work that passes review lands on your public portfolio, with your activity, skill scores and milestones from Sapling to Forest." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Interface", items: ["React", "Vite", "Tailwind", "Zustand", "GSAP", "Lenis", "dnd-kit", "isomorphic-git"] },
            { icon: HardDrivesIcon, label: "Server", items: ["Node.js", "Express", "Prisma", "Postgres", "Better Auth"] },
            { icon: CloudIcon, label: "Files + infra", items: ["Cloudflare R2", "Cloudinary", "Docker", "Postgres backups"] },
          ]}
        />
      </Section>

      <Section id="v1" n="05" label="First version" title="Where it started.">
        <Video
          id="7UYfeezeYx0"
          title="TaskLearn v1 demo"
          caption="The first TaskLearn demo. Almost everything in it has since been redesigned or rebuilt, which is the point of showing it."
          note="Fair warning: it’s old, and I shot it like an amateur."
        />
      </Section>
    </BriefPage>
  );
}
