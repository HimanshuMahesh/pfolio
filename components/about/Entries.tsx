import Image from "next/image";
import type { CSSProperties } from "react";
import type { Entry } from "@/content/about";
import { SectionHead } from "@/components/ui/SectionHead";
import { EntryMark } from "./EntryMark";
import styles from "./Entries.module.css";

type Props = {
  id: string;
  /** Section number, e.g. "01". */
  index: string;
  title: string;
  note: string;
  entries: Entry[];
};

/**
 * Screens fanned out like a hand of cards, rising out of a blur. Each card
 * knows its offset from the middle (--o) and its distance from it (--a), so
 * the CSS can spread, tilt and stagger them. A null slot is a placeholder
 * card, drawn in lines.
 */
function Fan({ assets }: { assets: Array<string | null> }) {
  const mid = (assets.length - 1) / 2;
  return (
    <div className={styles.reveal} aria-hidden="true">
      <div className={styles.revealInner}>
        <div className={styles.fan}>
          {assets.map((src, i) => (
            <span
              key={src ?? i}
              className={styles.card}
              style={{ "--o": i - mid, "--a": Math.abs(i - mid), "--i": i } as CSSProperties}
            >
              <span className={src ? styles.shot : `${styles.shot} ${styles.lines}`}>
                {src && <Image src={src} alt="" fill sizes="(min-width: 1200px) 230px, (min-width: 640px) 190px, 130px" />}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A titled list of roles: mark, title and date, a sub-line, then a
 * two-line description. A dotted line runs down from each mark to the next.
 * Hover (or tap / focus) opens a row: the full description, plus a fan of
 * screens when the entry has assets.
 */
export function Entries({ id, index, title, note, entries }: Props) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <SectionHead id={id} index={index} label={title} aside={note} />
      <ol className={styles.list}>
        {entries.map((entry, i) => {
          const fan = entry.assets ?? Array.from({ length: entry.placeholders ?? 0 }, () => null);
          return (
            <li
              key={entry.title}
              className={styles.item}
              data-reveal
              tabIndex={0}
              style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}
            >
              <EntryMark mark={entry.mark} />
              <div className={styles.main}>
                <div className={styles.top}>
                  <h3 className={styles.title}>{entry.title}</h3>
                  <span className={styles.date}>{entry.date}</span>
                </div>
                <p className={styles.sub}>{entry.sub}</p>
                <p className={styles.desc}>{entry.description}</p>
                {fan.length ? <Fan assets={fan} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
