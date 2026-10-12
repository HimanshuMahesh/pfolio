import type { Metadata } from "next";
import { BrainIcon } from "@phosphor-icons/react/dist/ssr/Brain";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { FileCsvIcon } from "@phosphor-icons/react/dist/ssr/FileCsv";
import { FolderSimpleIcon } from "@phosphor-icons/react/dist/ssr/FolderSimple";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PrinterIcon } from "@phosphor-icons/react/dist/ssr/Printer";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack,
} from "@/components/case/Brief";

export const metadata: Metadata = {
  title: `Smriti — ${site.name}`,
  description:
    "Smriti, project management for Xython Biotech's R&D team. Product design and engineering by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "how", label: "How it works", icon: <ListChecksIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
];

export default function SmritiCaseStudy() {
  return (
    <BriefPage rail={rail} accent="#4f6bff" next={{ href: "/work/north", name: "North" }}>
      <BriefHeader
        kicker="AI · Biotech operations · 2026"
        title="Smriti"
        lede="Project management for Xython Biotech's R&D team: projects, milestones, tasks, a calendar and status reports that print. Smriti is Sanskrit for memory, which is most of the job."
        link={{ href: "https://spacered.studio/work/xython-biotech", label: "Xython's brand and site, on spacered.studio" }}
        role="Product design and full-stack"
        timeline="2026, in use"
        platform="Internal web app"
        stack="React, TypeScript, Supabase, Gemini"
        cover={{ src: "/work/smriti.mp4", poster: "/work/smriti-poster.jpg" }}
        coverBg="linear-gradient(158deg, #060d2e 0%, #0b1a4d 34%, #13297a 66%, #1f3fae 100%)"
      />

      <Section id="overview" n="01" label="Overview" title="A lab runs on spreadsheets until someone asks what's overdue.">
        <Prose>
          <p>
            Xython&rsquo;s scientists were tracking assay runs and validation work across sheets and chats. Smriti gives
            them one place: every project with its milestones and tasks, who owns what, and a report a lead can print
            and take into a meeting. It&rsquo;s deliberately a project tool, not a lab notebook, and it says so.
          </p>
        </Prose>
      </Section>

      <Section id="screens" n="02" label="Screens" title="Quiet and dense, readable at the end of a long lab day.">
        <Screens
          items={[
            { src: "/work/smriti/dashboard.jpg", wide: true, alt: "Smriti's dashboard: projects in progress, overdue tasks, milestones due, a list of all projects with progress, and latest updates.", caption: "Home: what's in progress, what's overdue, and what changed since you last looked." },
            { src: "/work/smriti/board.jpg", alt: "Projects board grouped into Planning, On hold and Completed, each card showing priority, funding type and progress.", caption: "Projects by status, each card with its funding, priority and progress." },
            { src: "/work/smriti/project.jpg", alt: "The Biomarker Assay Validation project: 29% progress, 3 open tasks, 1 of 3 milestones done, and tabs for overview, tasks, milestones, team and activity.", caption: "One project: progress, open tasks and milestones, then the detail in tabs." },
            { src: "/work/smriti/polish.jpg", alt: "The Add Task dialog: a rough description and, beneath it, a suggested rewrite with Use this and Discard buttons.", caption: "Polish turns a rushed note into a clear task. You decide whether to use it." },
            { src: "/work/smriti/tasks.jpg", alt: "A project's tasks with assignee, status and priority, including one blocked task.", caption: "Tasks with owner, status and priority, all editable in place." },
          ]}
        />
      </Section>

      <Section id="how" n="03" label="How it works" title="One place for the work, and nothing a lab has to worry about.">
        <Points
          items={[
            { icon: FolderSimpleIcon, title: "Every project in one place", text: "Each project holds its milestones, tasks and team. The board groups them by status, and every card shows funding, priority and progress at a glance." },
            { icon: WarningCircleIcon, title: "See what's slipping", text: "Home opens on what's in progress, what's overdue and which milestones are due, plus what changed since you last looked." },
            { icon: ShieldCheckIcon, title: "People see their own projects", text: "Access follows project membership, and it's enforced by the database itself, not just hidden in the interface." },
            { icon: SparkleIcon, title: "Polish, when you want it", text: "Type a rushed note and Smriti suggests a clearer task. The AI stays off until the company turns it on, and projects marked confidential are never sent to it." },
            { icon: FileCsvIcon, title: "Set up from a spreadsheet", text: "A whole project, with its milestones and tasks, can come in from a CSV, so moving off the old sheets takes minutes." },
            { icon: PrinterIcon, title: "Reports that print", text: "Status reports print cleanly to PDF, so a lead can take one into a meeting on paper." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Interface", items: ["React", "TypeScript", "Vite", "Tailwind", "shadcn/ui", "Radix", "TanStack Query", "React Hook Form", "Zod"] },
            { icon: DatabaseIcon, label: "Backend", items: ["Supabase", "Postgres", "Row-level security", "Deno"] },
            { icon: BrainIcon, label: "AI", items: ["Gemini"] },
          ]}
        />
      </Section>
    </BriefPage>
  );
}
