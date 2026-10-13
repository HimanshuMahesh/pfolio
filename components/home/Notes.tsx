import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notes, notesIndexHref, type Note } from "@/content/notes";
import { CropMarks } from "@/components/ui/CropMarks";
import { SectionHead } from "@/components/ui/SectionHead";
import { cx, place } from "@/lib/grid";
import styles from "./Notes.module.css";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** Read length as a row of ticks, one per minute, like a ruler. */
const METER_TICKS = 12;
function ReadMeter({ minutes }: { minutes: number }) {
  return (
    <span className={styles.meter} aria-hidden="true">
      {Array.from({ length: METER_TICKS }, (_, i) => (
        <i key={i} className={cx(i < minutes && styles.on)} style={{ "--i": i } as CSSProperties} />
      ))}
    </span>
  );
}

/** Two-up on tablet and desktop, split like the Work grid; one column on phones. */
const COLUMNS = [
  { m: "1 / -1", t: "1 / 5", d: "1 / 7" },
  { m: "1 / -1", t: "5 / 9", d: "7 / 13" },
];

/** A text-only note card; a child of a `.grid`, alternating left and right columns. */
export function NoteRow({ note, index }: { note: Note; index: number }) {
  const column = index % 2;
  // The right-hand card of each pair rises a beat after the left.
  const delay = { "--reveal-delay": `${column * 80}ms` } as CSSProperties;
  return (
    <article className={styles.note} data-reveal style={place(COLUMNS[column], delay)}>
      <a className={styles.link} href={note.href}>
        <div className={styles.text}>
          <div className={cx("t-label", styles.top)}>
            <span className={styles.category}>{note.category}</span>
            <span className={styles.rule} aria-hidden="true" />
            <span>{note.number}</span>
          </div>
          <h3 className={styles.title}>{note.title}</h3>
          <p className={styles.desc}>{note.description}</p>
          <div className={styles.foot}>
            <span className={styles.meta}>
              <time dateTime={note.date}>{dateFormat.format(new Date(note.date))}</time>
              <ReadMeter minutes={note.readMinutes} />
              <span>{note.readMinutes} min</span>
            </span>
            <span className={styles.button}>
              Read note <ArrowUpRightIcon weight="duotone" className={styles.arrow} />
            </span>
          </div>
        </div>
      </a>
      <CropMarks />
    </article>
  );
}

/** (02) Writing — the latest notes as text-only cards, two to a row. */
export function Notes() {
  return (
    <section className={cx("wrap", "section")} id="writing" data-section="writing" data-section-title="Writing" data-section-aliases="written, writing, blog, blogs, articles, notes, essays, posts" aria-labelledby="writing-heading">
      <SectionHead
        index="02"
        label="Writing"
        aside={
          <Link href={notesIndexHref} className={styles.allNotes}>
            All notes <ArrowUpRightIcon weight="duotone" className={styles.arrow} />
          </Link>
        }
      />

      <div className={cx("grid", styles.intro)}>
        <h2 className="t-display" id="writing-heading" data-reveal style={place({ d: "1 / 8" })}>
          Notes
        </h2>
        <p className={styles.lede} data-reveal style={place({ t: "5 / 9", d: "9 / 13" })}>
          Things I’ve learned building products, written down so I don’t forget them.
        </p>
      </div>

      <div className={cx("grid", styles.list)}>
        {notes.slice(0, 3).map((note, i) => (
          <NoteRow key={note.slug} note={note} index={i} />
        ))}
      </div>
    </section>
  );
}
