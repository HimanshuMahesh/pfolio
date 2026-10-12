/**
 * Site-wide facts: who, where, how to reach. Anything that appears in more
 * than one place on the site belongs here.
 */
export const site = {
  name: "Himanshu K Mahesh",
  shortName: "Himanshu",
  role: "AI Engineer + Product Designer",
  /**
   * Canonical origin, used to make share-image and page URLs absolute.
   * Set NEXT_PUBLIC_SITE_URL once the domain is live; on Vercel the production URL is picked up automatically.
   */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  description:
    "Himanshu K Mahesh is an AI engineer at Tavant and runs Spacered, a new-age design agency in Bengaluru. He is also building TaskLearn and Visume.",
  email: "himanshu@spacered.studio",
  location: {
    city: "Bengaluru",
    country: "India",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    latitude: "12.97° N",
  },
} as const;

/**
 * Open Graph fields every page shares. A page that sets its own `openGraph` replaces the
 * layout's whole object, so it spreads this back in to keep the share image and site name.
 */
export const sharedOpenGraph = {
  siteName: site.name,
  locale: "en_IN",
  images: [
    {
      url: "/opengraph-image.jpg",
      width: 1200,
      height: 630,
      alt: "Himanshu K Mahesh: Building at the intersection of technology and art. Tech, AI, Design.",
    },
  ],
};

export type NavItem = {
  label: string;
  href: string;
  /** `data-spy` id of a homepage section that marks this item active while in view. */
  spy?: string;
};

export const navItems: NavItem[] = [
  { label: "Work", href: "/#work", spy: "work" },
  { label: "About", href: "/about" },
  { label: "Fun", href: "/fun" },
];

export type SocialLink = { label: string; handle: string; href: string };

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", handle: "in/himanshu-mahesh", href: "https://www.linkedin.com/in/himanshu-mahesh/" },
  { label: "GitHub", handle: "@HimanshuMahesh", href: "https://github.com/HimanshuMahesh" },
  { label: "Spacered", handle: "spacered.studio", href: "https://spacered.studio" },
  // TODO: real X handle and URL
  { label: "X", handle: "@himanshu", href: "#" },
];
