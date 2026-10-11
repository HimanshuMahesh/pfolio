/**
 * Site-wide facts: who, where, how to reach. Anything that appears in more
 * than one place on the site belongs here.
 */
export const site = {
  name: "Himanshu K Mahesh",
  shortName: "Himanshu",
  role: "AI Engineer + Product Designer",
  description:
    "Himanshu K Mahesh is an AI engineer at Tavant and runs Spacered, a new-age design agency in Bengaluru. He is also building TaskLearn and Visume.",
  email: "himanshukm1109@gmail.com",
  location: {
    city: "Bengaluru",
    country: "India",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    latitude: "12.97° N",
  },
} as const;

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
  { label: "LinkedIn", handle: "in/himanshumahesh", href: "https://www.linkedin.com/in/himanshumahesh/" },
  { label: "GitHub", handle: "@HimanshuMahesh", href: "https://github.com/HimanshuMahesh" },
  { label: "Spacered", handle: "spacered.studio", href: "https://spacered.studio" },
  // TODO: real X handle and URL
  { label: "X", handle: "@himanshu", href: "#" },
];
