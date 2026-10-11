export type Project = {
  slug: string;
  /** Shown in the notch cut into the cover. */
  name: string;
  title: string;
  meta: string;
  href: string;
  /** Placeholder cover art (a CSS background). Replaced by `image` when set. */
  cover: string;
  /** 4:3 cover image, e.g. `/images/work/tasklearn.jpg`. */
  image?: string;
  /** 4:3 looping cover film (muted), e.g. `/work/tasklearn.mp4`. Takes precedence over `image`. */
  video?: { src: string; poster: string };
  /** Tapes the cover off with "work in progress" tape. */
  wip?: boolean;
};

// Studio OS is still in progress and points back to the list.
export const projects: Project[] = [
  {
    slug: "tasklearn",
    name: "TaskLearn",
    title: "AI learning platform: do real work, earn badges",
    meta: "10,000+ learners",
    href: "/work/tasklearn",
    cover:
      "radial-gradient(120% 90% at 20% 110%, #f6a04d 0%, transparent 60%), radial-gradient(90% 80% at 85% 10%, #c9b6f2 0%, transparent 60%), linear-gradient(160deg, #f7c59f, #f08a4b 55%, #e9a9c9)",
    // Rendered in remotion-work/ (npm run render:tasklearn), then re-encoded for the web.
    video: { src: "/work/tasklearn.mp4", poster: "/work/tasklearn-poster.jpg" },
  },
  {
    slug: "visume",
    name: "Visume",
    title: "Resume screening, replaced by a 5-minute AI interview",
    meta: "1,000+ interviews",
    href: "/work/visume",
    cover:
      "radial-gradient(80% 50% at 50% 60%, #1e6bff 0%, transparent 70%), linear-gradient(180deg, #041233, #06205c 60%, #020a1f)",
    // Rendered in remotion-work/ (npm run render:visume), then re-encoded for the web.
    video: { src: "/work/visume.mp4", poster: "/work/visume-poster.jpg" },
  },
  {
    slug: "xython-pm",
    name: "Smriti Operations",
    title: "AI-enabled project management for Xython Biotech",
    meta: "Biotech",
    href: "/work/smriti",
    cover: "linear-gradient(158deg, #060d2e 0%, #0b1a4d 34%, #13297a 66%, #1f3fae 100%)",
    // Rendered in remotion-work/ (npm run render:smriti), then re-encoded for the web.
    video: { src: "/work/smriti.mp4", poster: "/work/smriti-poster.jpg" },
  },
  {
    slug: "personal-finance-agents",
    name: "North: Personal Finance",
    title: "Upload a bank CSV, ask anything, answered by a team of agents",
    meta: "Fintech",
    href: "/work/north",
    cover: "linear-gradient(160deg, #effaec 0%, #c6ebbd 38%, #86d484 72%, #45b048 100%)",
    // Rendered in remotion-work/ (npm run render:north), then re-encoded for the web.
    video: { src: "/work/north.mp4", poster: "/work/north-poster.jpg" },
  },
  {
    slug: "spacered",
    name: "Spacered",
    title: "Positioning, services and identity for a design studio",
    meta: "Brand",
    href: "/work/spacered",
    cover:
      "radial-gradient(135% 78% at 50% 122%, #ff5a3c 0%, #f3160f 9%, #b8070f 23%, #640409 40%, #2a0205 60%, transparent 82%), #060102",
    // Rendered in remotion-work/ (npm run render:spacered) from recordings of spacered.studio, then re-encoded for the web.
    video: { src: "/work/spacered.mp4", poster: "/work/spacered-poster.jpg" },
  },
  {
    slug: "studio-os",
    name: "Studio OS",
    title: "The internal system that runs the studio",
    meta: "Spacered • Internal",
    href: "#work",
    cover:
      "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.22) 0 1px, transparent 1px 14px), #050505",
    wip: true,
  },
];
