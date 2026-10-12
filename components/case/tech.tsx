import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { BrowserIcon } from "@phosphor-icons/react/dist/ssr/Browser";
import { ChartBarIcon } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/ssr/CloudArrowUp";
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code";
import { DatabaseIcon } from "@phosphor-icons/react/dist/ssr/Database";
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/ssr/DotsSixVertical";
import { FilmSlateIcon } from "@phosphor-icons/react/dist/ssr/FilmSlate";
import { MouseScrollIcon } from "@phosphor-icons/react/dist/ssr/MouseScroll";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/ssr/SpeakerHigh";
import { TextAaIcon } from "@phosphor-icons/react/dist/ssr/TextAa";
import { WaveformIcon } from "@phosphor-icons/react/dist/ssr/Waveform";
import {
  siBetterauth, siBun, siCaldotcom, siCloudflare, siCloudinary, siDeno, siDocker, siExpress, siFramer, siGit,
  siGoogle, siGooglegemini, siGsap, siJsonwebtokens, siMysql, siNeon, siNetlify, siNextdotjs,
  siNodedotjs, siOpenrouter, siOxc, siPayloadcms, siPosthog, siPostgresql, siPrisma, siRadixui, siBaseui, siReact,
  siReacthookform, siShadcnui, siSupabase, siTailwindcss, siTanstack, siTypescript, siVercel, siVite, siWebassembly,
  siWebgl, siZod,
  type SimpleIcon,
} from "simple-icons";

/*
 * Every tool named in a case-study stack, with its mark. Brand logos come from
 * Simple Icons; tools without one get the Phosphor icon closest to what they do.
 */

type Phosphor = ComponentType<IconProps>;
type Mark = SimpleIcon | Phosphor;

const TECH = {
  // Interface
  "React": siReact,
  "Next.js": siNextdotjs,
  "Vite": siVite,
  "TypeScript": siTypescript,
  "Tailwind": siTailwindcss,
  "shadcn/ui": siShadcnui,
  "Radix": siRadixui,
  "Base UI": siBaseui,
  "TanStack Query": siTanstack,
  "React Hook Form": siReacthookform,
  "Zod": siZod,
  "Zustand": CodeIcon,
  "GSAP": siGsap,
  "Framer Motion": siFramer,
  "Motion": FilmSlateIcon,
  "Lenis": MouseScrollIcon,
  "dnd-kit": DotsSixVerticalIcon,
  "ApexCharts": ChartBarIcon,
  "Monaco": BrowserIcon,
  "isomorphic-git": siGit,
  "WebGL": siWebgl,
  // Server + data
  "Node.js": siNodedotjs,
  "Express": siExpress,
  "Prisma": siPrisma,
  "Postgres": siPostgresql,
  "MySQL": siMysql,
  "Supabase": siSupabase,
  "Deno": siDeno,
  "Neon": siNeon,
  "Payload CMS": siPayloadcms,
  "Lexical": TextAaIcon,
  "Better Auth": siBetterauth,
  "JWT": siJsonwebtokens,
  "Google sign-in": siGoogle,
  "Row-level security": ShieldCheckIcon,
  // AI + media
  "Gemini": siGooglegemini,
  "OpenRouter": siOpenrouter,
  "AssemblyAI": WaveformIcon,
  "Amazon Polly": SpeakerHighIcon,
  "AVIF in WebAssembly": siWebassembly,
  // Files, infra, tooling
  "Cloudflare R2": siCloudflare,
  "Cloudinary": siCloudinary,
  "UploadThing": CloudArrowUpIcon,
  "Docker": siDocker,
  "Netlify": siNetlify,
  "Vercel": siVercel,
  "Bun": siBun,
  "Oxc": siOxc,
  "PostHog": siPosthog,
  "Cal.com": siCaldotcom,
  "Postgres backups": DatabaseIcon,
} satisfies Record<string, Mark>;

export type Tech = keyof typeof TECH;

const isBrand = (m: Mark): m is SimpleIcon => typeof m === "object" && "path" in m;

/** A tool's mark at 14px, in the text colour: the brand logo, or a stand-in icon. */
export function TechMark({ name, className }: { name: Tech; className?: string }) {
  const mark: Mark = TECH[name];
  if (isBrand(mark)) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={mark.path} />
      </svg>
    );
  }
  const Icon = mark;
  return <Icon className={className} weight="duotone" aria-hidden="true" />;
}
