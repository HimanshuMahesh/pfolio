export type Note = {
  slug: string;
  category: string;
  /** Catalogue number shown top-right, e.g. "04.1". */
  number: string;
  title: string;
  description: string;
  /** ISO date. */
  date: string;
  readMinutes: number;
  href: string;
};

/** Every note, listed under Blogs on /about. */
export const notesIndexHref = "/about#blogs";

// Newest first: the home page shows the first three, /about lists them all.
export const notes: Note[] = [
  {
    slug: "death-of-the-blank-canvas",
    category: "Design",
    number: "04.1",
    title: "Death of the Blank Canvas: designing with AI",
    description:
      "AI can make a polished interface in a minute, so why do so many of them feel off? How design tools got here, what they still miss, and what it means to be a designer now.",
    date: "2026-10-12",
    readMinutes: 10,
    href: "/notes/death-of-the-blank-canvas",
  },
  {
    slug: "how-to-build-a-mind-that-plays-chess",
    category: "AI",
    number: "04.2",
    title: "How to Build a Mind That Plays Chess",
    description:
      "I binge-watched GothamChess, got curious about the engine bar, and went down the rabbit hole. Search, evaluation, AlphaZero, and what it all has to do with building agents.",
    date: "2026-10-11",
    readMinutes: 15,
    href: "/notes/how-to-build-a-mind-that-plays-chess",
  },
];
