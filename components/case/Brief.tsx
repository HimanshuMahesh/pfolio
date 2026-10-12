import Image from "next/image";
import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { BrowserIcon } from "@phosphor-icons/react/dist/ssr/Browser";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { UserFocusIcon } from "@phosphor-icons/react/dist/ssr/UserFocus";
import { CoverVideo } from "@/components/ui/CoverVideo";
import { SectionHead } from "@/components/ui/SectionHead";
import { CaseRail, type RailItem } from "@/components/case/CaseRail";
import { TechMark, type Tech } from "@/components/case/tech";
import { cx, place } from "@/lib/grid";
import s from "./Case.module.css";

/*
 * The short case-study format: a technical brief rather than a design story.
 * Intro, the screens, how the product works, the stack.
 * The long design write-ups live on the studio site.
 */

type Icon = ComponentType<IconProps>;
export type Point = { icon: Icon; title: string; text: ReactNode };
export type Screen = { src: string; alt: string; caption: ReactNode; wide?: boolean };
export type StackRow = { icon: Icon; label: string; items: Tech[] };

/** The page shell: grid, the section rail, the article column, and the end links. */
export function BriefPage({ rail, accent, next, children }: {
  rail: RailItem[];
  /** Lights the rail's active icon in the product's own colour. */
  accent: string;
  next: { href: string; name: string };
  children: ReactNode;
}) {
  return (
    <div className={cx("wrap", "grid", s.page)} style={{ "--case-accent": accent } as CSSProperties}>
      <CaseRail items={rail} />
      <article style={place({ m: "1 / -1", d: "3 / 12" })}>
        {children}
        <nav className={cx("t-label", s.end)} aria-label="Case study">
          <Link href="/#work">
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> All work
          </Link>
          <Link href={next.href}>
            Next: {next.name} <ArrowRightIcon weight="bold" aria-hidden="true" />
          </Link>
        </nav>
      </article>
    </div>
  );
}

export function BriefHeader({ kicker, title, lede, role, timeline, platform, stack, cover, coverBg, link, metric }: {
  kicker: string;
  title: string;
  lede: ReactNode;
  role: string;
  timeline: string;
  platform: string;
  stack: string;
  cover: { src: string; poster: string };
  /** The cover film's own backdrop, shown while it loads. */
  coverBg: string;
  /** `live` turns the link into the "Live" key: the product is out there, go use it. */
  link?: { href: string; label: string; live?: boolean };
  /** One real number, set beside the link, e.g. { value: "10,000+", label: "learners" }. */
  metric?: { value: string; label: string };
}) {
  const meta = [
    { icon: UserFocusIcon, dt: "Role", dd: role },
    { icon: CalendarBlankIcon, dt: "Timeline", dd: timeline },
    { icon: BrowserIcon, dt: "Platform", dd: platform },
    { icon: StackIcon, dt: "Stack", dd: stack },
  ];
  return (
    <>
      <header data-reveal="load">
        <p className={cx("t-label", s.label)}>
          <span className="idx">(Case study)</span>{kicker}
        </p>
        <h1 className={cx("t-display", s.title)}>{title}</h1>
        <p className={s.lede}>{lede}</p>
        {(link?.live || metric) && (
          <div className={s.keys}>
            {link?.live && (
              <a className={s.live} href={link.href} target="_blank" rel="noreferrer">
                <span className={s.liveDot} aria-hidden="true" />
                <span className={s.liveTag}>Live</span>
                <span className={s.liveUrl}>{link.label}</span>
                <ArrowUpRightIcon weight="bold" aria-hidden="true" />
              </a>
            )}
            {metric && (
              <p className={s.metric}>
                <strong>{metric.value}</strong> {metric.label}
              </p>
            )}
          </div>
        )}
        {link && !link.live && (
          <a className={cx("t-label", s.visit)} href={link.href} target="_blank" rel="noreferrer">
            {link.label} <ArrowUpRightIcon weight="bold" aria-hidden="true" />
          </a>
        )}
        <dl className={s.meta}>
          {meta.map(({ icon: I, dt, dd }) => (
            <div key={dt}>
              <dt className="t-label"><I weight="duotone" aria-hidden="true" />{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div
        className={s.cover}
        data-reveal="load"
        style={{ "--reveal-delay": "120ms", background: coverBg } as CSSProperties}
      >
        <CoverVideo src={cover.src} poster={cover.poster} />
      </div>
    </>
  );
}

/** A section: the site's "(01) Label" row, a headline, then whatever follows. */
export function Section({ id, n, label, aside, title, children }: {
  id: string; n: string; label: string; aside?: ReactNode; title: ReactNode; children?: ReactNode;
}) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <SectionHead index={n} label={label} aside={aside} />
      <h2 id={`${id}-h`} className={s.h2} data-reveal>{title}</h2>
      {children}
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className={s.prose}>{children}</div>;
}

export function Points({ items }: { items: Point[] }) {
  return (
    <ul className={cx(s.list, s.cols2)}>
      {items.map(({ icon: I, title, text }) => (
        <li key={title} className={s.item} data-reveal>
          <I className={s.icon} weight="duotone" aria-hidden="true" />
          <strong className={s.itemTitle}>{title}</strong>
          <p className={s.itemText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}


/**
 * The screens, as plates: each image already carries the product's own
 * backdrop, so they sit frameless in a two-up mosaic, wide ones spanning both.
 */
export function Screens({ items, ratio = "4 / 3" }: { items: Screen[]; ratio?: string }) {
  return (
    <div className={s.plates}>
      {items.map((it, i) => (
        <figure
          key={it.src}
          className={cx(s.plate, it.wide && s.plateWide)}
          data-reveal
          style={{ "--plate-ratio": ratio } as CSSProperties}
        >
          <div className={s.plateImg}>
            <Image
              src={it.src}
              alt={it.alt}
              fill
              sizes={it.wide ? "(min-width: 1200px) 70vw, 100vw" : "(min-width: 1200px) 35vw, (min-width: 768px) 50vw, 100vw"}
            />
          </div>
          <figcaption className={s.caption}>
            <span className={s.plateNum}>{String(i + 1).padStart(2, "0")}</span>
            {it.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** The stack, one layer per row, each tool a tag with its logo. */
export function Stack({ rows }: { rows: StackRow[] }) {
  return (
    <dl className={s.stack}>
      {rows.map(({ icon: I, label, items }) => (
        <div key={label} className={s.stackRow} data-reveal>
          <dt className={cx("t-label", s.stackLabel)}>
            <I weight="duotone" aria-hidden="true" />{label}
          </dt>
          <dd className={s.tags}>
            {items.map((it) => (
              <span key={it} className={s.tag}>
                <TechMark name={it} className={s.tagMark} />
                {it}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
