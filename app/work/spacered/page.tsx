import type { Metadata } from "next";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { CubeIcon } from "@phosphor-icons/react/dist/ssr/Cube";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr/Image";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { LightningIcon } from "@phosphor-icons/react/dist/ssr/Lightning";
import { PuzzlePieceIcon } from "@phosphor-icons/react/dist/ssr/PuzzlePiece";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { WrenchIcon } from "@phosphor-icons/react/dist/ssr/Wrench";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack, Stats,
} from "@/components/case/Brief";

export const metadata: Metadata = {
  title: `Spacered — ${site.name}`,
  description:
    "spacered.studio, the site and CMS for Spacered, a design studio. Designed and built by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "notes", label: "Build notes", icon: <WrenchIcon weight="duotone" /> },
  { id: "stack", label: "Stack", icon: <StackIcon weight="duotone" /> },
];

export default function SpaceredCaseStudy() {
  return (
    <BriefPage rail={rail} accent="#f3160f" next={{ href: "/work/tasklearn", name: "TaskLearn" }}>
      <BriefHeader
        kicker="Studio · Web · 2026"
        title="Spacered"
        lede="The site for my design studio. Its job is to sell the work, so it has to be the work too: a particle-field hero, a before-and-after that jumps to light speed, and a CMS the studio runs without me."
        link={{ href: "https://spacered.studio", label: "spacered.studio", live: true }}
        role="Design and build"
        timeline="2026, live"
        platform="Website + CMS"
        stack="Next.js 16, Payload, Postgres, WebGL"
        cover={{ src: "/work/spacered.mp4", poster: "/work/spacered-poster.jpg" }}
        coverBg="radial-gradient(135% 78% at 50% 122%, #ff5a3c 0%, #f3160f 9%, #b8070f 23%, #640409 40%, #2a0205 60%, transparent 82%), #060102"
      />

      <Section id="overview" n="01" label="Overview" title="A studio site has one job: make someone want to book a call.">
        <Prose>
          <p>
            The studio&rsquo;s client case studies live on spacered.studio. This page is about the site itself: how the
            site is built. It&rsquo;s one Next.js app that serves the pages and hosts the CMS, with the heavy visual
            moments drawn live in WebGL rather than played from video.
          </p>
        </Prose>
        <Stats
          items={[
            { value: "1", label: "app for the site and the CMS that edits it" },
            { value: "0", label: "JPEGs uploaded. Images become AVIF before they leave the browser" },
            { value: "30m", label: "discovery call, booked without leaving the page" },
          ]}
        />
      </Section>

      <Section id="screens" n="02" label="Screens" title="Black, red, and one big idea per screen.">
        <Screens
          ratio="16 / 10"
          items={[
            { src: "/work/spacered/hero.jpg", wide: true, alt: "spacered.studio's hero: 'Designing high-impact brands for companies ready to scale' over a dark red particle field, with Bengaluru time and weather chips.", caption: "The hero: a particle field, the time and weather in Bengaluru, then the brands we work with." },
            { src: "/work/spacered/services.jpg", alt: "The services list: Brand Identity, Digital Product Design, Website Design & Dev, Spatial Design, Illustration.", caption: "Services as one list, each row opening into what's included." },
            { src: "/work/spacered/process.jpg", alt: "The process: Discover, Define, Design and Deliver, each with a geometric line drawing.", caption: "Discover, Define, Design, Deliver, each with its own line drawing." },
            { src: "/work/spacered/warp.jpg", wide: true, alt: "'After Spacered' set over streaking stars, as if travelling at light speed.", caption: "Before Spacered, after Spacered. The page goes to warp in between." },
            { src: "/work/spacered/booking.jpg", alt: "An embedded booking calendar for a 30-minute discovery call.", caption: "Booking happens right on the page." },
            { src: "/work/spacered/footer.jpg", alt: "The footer: 'Design systems, identities, and websites with sharper edges' over a huge faded SPACERED wordmark.", caption: "The footer, with the wordmark set huge behind it." },
          ]}
        />
      </Section>

      <Section id="notes" n="03" label="Build notes" title="Small decisions that keep it fast and editable.">
        <Points
          items={[
            { icon: CubeIcon, title: "Shaders, not video", text: "The hero field and the warp are WebGL with hand-written GLSL. They stay sharp at any screen size and weigh a fraction of a video." },
            { icon: ImageIcon, title: "AVIF before upload", text: "Images added in the admin are encoded to AVIF in a Web Worker with a WASM encoder. Turbopack hung on the encoder's nested worker, so it imports the single-threaded build directly." },
            { icon: PuzzlePieceIcon, title: "Case studies from blocks", text: "Payload runs inside the Next.js app on its own admin route. A case study is a stack of text, image and design-system blocks, so a new one needs no code." },
            { icon: LightningIcon, title: "Checks that keep up", text: "Bun, oxlint, oxfmt, the React Compiler and the native TypeScript preview keep every check fast enough to run on each change." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Site", items: ["Next.js 16", "React 19", "React Compiler", "Tailwind 4", "Motion", "Base UI", "WebGL + GLSL"] },
            { icon: DatabaseIcon, label: "Content", items: ["Payload CMS 3", "Lexical", "Neon Postgres", "UploadThing", "jSquash AVIF"] },
            { icon: WrenchIcon, label: "Tooling", items: ["Bun", "oxlint", "oxfmt", "TypeScript native preview", "Vercel", "PostHog", "Cal.com"] },
          ]}
        />
      </Section>
    </BriefPage>
  );
}
