import type { Metadata } from "next";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/ssr/CalendarCheck";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { ImagesIcon } from "@phosphor-icons/react/dist/ssr/Images";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { PathIcon } from "@phosphor-icons/react/dist/ssr/Path";
import { PencilSimpleLineIcon } from "@phosphor-icons/react/dist/ssr/PencilSimpleLine";
import { RocketLaunchIcon } from "@phosphor-icons/react/dist/ssr/RocketLaunch";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { WrenchIcon } from "@phosphor-icons/react/dist/ssr/Wrench";
import { site } from "@/content/site";
import type { RailItem } from "@/components/case/CaseRail";
import {
  BriefHeader, BriefPage, Points, Prose, Screens, Section, Stack,
} from "@/components/case/Brief";

export const metadata: Metadata = {
  title: `Spacered · ${site.name}`,
  description:
    "spacered.studio, the site and CMS for Spacered, a design studio. Designed and built by Himanshu K Mahesh.",
};

const rail: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "screens", label: "Screens", icon: <ImagesIcon weight="duotone" /> },
  { id: "how", label: "How it works", icon: <ListChecksIcon weight="duotone" /> },
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
        role="Design and build. Runs the studio with Abhi and Avi"
        timeline="2026, live"
        platform="Website + CMS"
        stack="Next.js 16, Payload, Postgres, WebGL"
        cover={{ src: "/work/spacered.mp4", poster: "/work/spacered-poster.jpg" }}
        coverBg="radial-gradient(135% 78% at 50% 122%, #ff5a3c 0%, #f3160f 9%, #b8070f 23%, #640409 40%, #2a0205 60%, transparent 82%), #060102"
      />

      <Section id="overview" n="01" label="Overview" title="A studio site has one job: make someone want to book a call.">
        <Prose>
          <p>
            spacered.studio is the studio&rsquo;s front door. In a few scrolls it has to say what the studio does, show
            the standard of the work, and get the right visitor onto a call. And the studio has to be able to keep it
            current, adding case studies and pages, without waiting on a developer.
          </p>
        </Prose>
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

      <Section id="how" n="03" label="How it works" title="From first scroll to a booked call.">
        <Points
          items={[
            { icon: SparkleIcon, title: "A first screen that sets the tone", text: "The hero opens on a live particle field, the time and weather in Bengaluru, and the brands the studio works with, so a visitor knows who's behind it before they scroll." },
            { icon: ListIcon, title: "Services in one list", text: "Brand identity, product design, websites, spatial design and illustration, each row opening into exactly what's included." },
            { icon: PathIcon, title: "A process you can picture", text: "Discover, Define, Design, Deliver, each step with its own line drawing, so working with the studio feels mapped out before the first call." },
            { icon: RocketLaunchIcon, title: "Before and after, at warp", text: "The page jumps to light speed between \"before Spacered\" and \"after\". It's drawn live rather than played from a video, so it stays sharp on any screen." },
            { icon: CalendarCheckIcon, title: "Book without leaving", text: "A 30-minute discovery call is booked from a calendar right on the page. No form, no back-and-forth email." },
            { icon: PencilSimpleLineIcon, title: "The studio runs it", text: "A built-in CMS lets the studio publish case studies from text, image and design-system blocks, with images optimised on upload, so a new one needs no code." },
          ]}
        />
      </Section>

      <Section id="stack" n="04" label="Stack" title="What it runs on.">
        <Stack
          rows={[
            { icon: DesktopIcon, label: "Site", items: ["Next.js", "React", "Tailwind", "Motion", "Base UI", "WebGL"] },
            { icon: DatabaseIcon, label: "Content", items: ["Payload CMS", "Lexical", "Neon", "UploadThing", "AVIF in WebAssembly"] },
            { icon: WrenchIcon, label: "Tooling", items: ["Bun", "Oxc", "TypeScript", "Vercel", "PostHog", "Cal.com"] },
          ]}
        />
      </Section>
    </BriefPage>
  );
}
