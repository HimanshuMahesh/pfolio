import type { Metadata } from "next";
import { CloudIcon } from "@phosphor-icons/react/dist/ssr/Cloud";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { FeatherIcon } from "@phosphor-icons/react/dist/ssr/Feather";
import { GitBranchIcon } from "@phosphor-icons/react/dist/ssr/GitBranch";
import { HardDrivesIcon } from "@phosphor-icons/react/dist/ssr/HardDrives";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { LightningIcon } from "@phosphor-icons/react/dist/ssr/Lightning";
import { ScanIcon } from "@phosphor-icons/react/dist/ssr/Scan";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { WrenchIcon } from "@phosphor-icons/react/dist/ssr/Wrench";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack, Stats,
} from "@/components/case/Brief";

export const metadata: Metadata = {
  title: `TaskLearn — ${site.name}`,
  description:
    "TaskLearn, an AI learning platform where you do real work and get it reviewed. Product design and AI engineering by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "notes", label: "Build notes", icon: <WrenchIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
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
      />

      <Section id="overview" n="01" label="Overview" title="A certificate proves you watched something. TaskLearn asks you to make something.">
        <Prose>
          <p>
            Courses end in a quiz, and a quiz can&rsquo;t tell anyone whether you can write a PRD, design a flow or ship
            an app. So every task on TaskLearn ends in a real deliverable: a repo, a deck, a prototype. A model reviews
            it against the task&rsquo;s own rubric, and the result is something you can show, not just a badge.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "10k+", label: "learners on the platform" },
            { value: "6", label: "jobs handed to models, from reviewing work to writing the blog" },
            { value: "0", label: "servers involved in cloning your repo. It happens in your tab" },
          ]}
        />
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

      <Section id="notes" n="03" label="Build notes" title="The bits I'd point at in a code review.">
        <Points
          items={[
            { icon: GitBranchIcon, title: "Git, inside the browser", text: "Code tasks take a GitHub link. The repo is cloned in the tab with isomorphic-git into an in-browser file system, filtered, and only the files that matter are uploaded. The server never runs a clone." },
            { icon: ScanIcon, title: "Two passes, not one", text: "A cheap pass decides which files matter for this task. The expensive one reads only those. Reviews got quicker and stopped commenting on config files." },
            { icon: LightningIcon, title: "Every model call has a plan B", text: "If the first provider fails, the same prompt goes to a second one. Model choices live in a config the admin panel edits live, so swapping a model needs no deploy." },
            { icon: FeatherIcon, title: "An agent writes the blog", text: "A background agent drafts posts and their cover images in batches, each run tracked as a job in the database so a failed one can be picked up again." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Interface", items: ["React 19", "Vite", "Tailwind 4", "Zustand", "GSAP", "Lenis", "dnd-kit", "isomorphic-git"] },
            { icon: HardDrivesIcon, label: "Server", items: ["Node", "Express", "Prisma", "Postgres", "Better Auth"] },
            { icon: CloudIcon, label: "Files + infra", items: ["Cloudflare R2", "Cloudinary", "Docker", "Scheduled backups"] },
          ]}
        />
      </Section>
    </BriefPage>
  );
}
