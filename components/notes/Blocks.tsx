import type { ReactNode } from "react";
import Link from "next/link";
import { Architects_Daughter } from "next/font/google";
import { notesIndexHref } from "@/content/notes";
import { cx, place } from "@/lib/grid";
import { SectionHead } from "@/components/ui/SectionHead";
import s from "./Article.module.css";

/* The building blocks every long-form note shares: the page shell (rails,
   hatched margins, header, end links) and the blocks a note is written in. */

/* Handwriting for equations and pending notes, the same face as the homepage's margin notes. */
const hand = Architects_Daughter({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-hand" });

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const DUO = { weight: "duotone" } as const;

/** The page: a centred article between dashed rails, hatched margins, the header and the end links. */
export function NotePage({ number, category, date, minutes, title, subtitle, children }: {
  number: string;
  category: string;
  /** ISO date. */
  date: string;
  minutes: number;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("wrap", "grid", s.page, hand.variable)}>
      <article className={s.article} style={place({ m: "1 / -1", d: "2 / 12" })}>
        <i className={s.hatch} data-side="l" aria-hidden="true" />
        <i className={s.hatch} data-side="r" aria-hidden="true" />
        <header className={s.header}>
          <p className={cx("t-label", s.meta)}>
            <b>Note {number}</b>
            <span className={s.dot}>·</span>
            {category}
            <span className={s.dot}>·</span>
            <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
            <span className={s.dot}>·</span>
            {minutes} min read
          </p>
          <h1 className={s.title}>{title}</h1>
          <p className={s.subtitle}>{subtitle}</p>
        </header>
        {children}
        <nav className={cx("t-label", s.end)} aria-label="Note">
          <Link href={notesIndexHref}>← All notes</Link>
          <Link href="/#work">Work →</Link>
        </nav>
      </article>
    </div>
  );
}

/** A section: a dashed rule from rail to rail, a SectionHead row and a heading. */
export function Act({ n, label, aside, title, children }: { n: string; label: string; aside: string; title: string; children: ReactNode }) {
  return (
    <section className={s.act}>
      <SectionHead index={n} label={label} aside={aside} />
      <h2 className={s.h2}>{title}</h2>
      {children}
    </section>
  );
}

/** The opening line of a section: larger, and in ink. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className={s.lead}>{children}</p>;
}

/** A block: heading (and icon) on the left, a few short paragraphs on the right. */
export function Chunk({ n, icon, title, children }: { n?: string; icon?: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={s.chunk}>
      <h3 className={s.side}>
        {icon}
        {n && <span>{n}</span>}
        {title}
      </h3>
      <div className={s.body}>{children}</div>
    </div>
  );
}

/** A row of three blocks. */
export function Cards({ children }: { children: ReactNode }) {
  return <div className={s.cards}>{children}</div>;
}

export function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={s.card}>
      {icon}
      <h4>{title}</h4>
      <div>{children}</div>
    </div>
  );
}

/** A square figure beside its text (stacked below 1000px). */
export function Split({ figure, children }: { figure: ReactNode; children: ReactNode }) {
  return (
    <div className={s.split}>
      <div className={cx(s.splitText, s.body)}>{children}</div>
      <div className={s.splitFig}>{figure}</div>
    </div>
  );
}

/** An equation in the handwritten face, with what each symbol means. */
export function Formula({ math, terms }: { math: string; terms: [string, string][] }) {
  return (
    <div className={s.formula}>
      <code>{math}</code>
      <dl>
        {terms.map(([k, v]) => (
          <div key={k || v} style={{ display: "contents" }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A boxed aside with a small label, e.g. "Where I was wrong". */
export function Aside({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className={s.reflection}>
      <span className="t-label">{label}</span>
      {children}
    </p>
  );
}

/** A big line between rules: the question a note keeps returning to. */
export function Question({ children }: { children: ReactNode }) {
  return <p className={s.question}>{children}</p>;
}

/** Two-column rows with a bold term on the left. */
export function List({ items }: { items: [string, ReactNode][] }) {
  return (
    <ul className={s.list}>
      {items.map(([term, text]) => (
        <li key={term}><b>{term}</b><span>{text}</span></li>
      ))}
    </ul>
  );
}

export function Timeline({ items }: { items: { year: string; icon: ReactNode; children: ReactNode }[] }) {
  return (
    <ol className={s.timeline}>
      {items.map((it) => (
        <li key={it.year}>
          <time>{it.year}</time>
          {it.icon}
          <span>{it.children}</span>
        </li>
      ))}
    </ol>
  );
}

/** Body copy outside a block. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className={s.prose}>{children}</div>;
}

export { s as noteStyles };
