import Image from "next/image";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/ssr/DotsThree";
import type { CSSProperties, ReactNode } from "react";
import { site } from "@/content/site";
import { enjoying } from "@/content/about";
import { cx } from "@/lib/grid";
import { AirDropWidget } from "./AirDropWidget";
import { Turntable } from "./Turntable";
import styles from "./Bento.module.css";

/** Cells rise in one after another on load. */
const stagger = (step: number) => ({ "--reveal-delay": `${step * 70}ms` }) as CSSProperties;

/** An inline bracketed tag: [ Bengaluru, India ] */
function Tag({ children }: { children: ReactNode }) {
  return <span className={styles.tag}>[ {children} ]</span>;
}

/**
 * The intro: a bento of objective, description (in a window), a photo,
 * the resume (as an incoming AirDrop), a note of things I enjoy and a
 * record player. Every cell is styled as an Apple widget.
 */
export function Bento() {
  return (
    <section className={styles.bento} aria-labelledby="about-heading">
      <h1 id="about-heading" className="sr-only">
        About
      </h1>

      <div className={cx(styles.cell, styles.objective)} data-reveal="load" style={stagger(0)}>
        <p className={styles.objectiveText}>
          “Ever since I was a kid, I knew I wanted to <span className={styles.serif}>visualize complex data</span> to{" "}
          <span className={styles.serif}>increase shareholder value</span>
          <span className={styles.acc}>.</span>”
        </p>
      </div>

      <div className={cx(styles.cell, styles.desc)} data-reveal="load" style={stagger(2)}>
        <div className={styles.titlebar} aria-hidden="true">
          <span className={styles.lights}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.tab}>about.txt</span>
        </div>
        <div className={styles.body}>
          <p>
            <Tag>tl;dr</Tag> I’m Himanshu Mahesh. I build AI things, design the parts people actually touch, and can’t
            really leave anything half-shipped. Based in{" "}
            <Tag>
              {site.location.city}, {site.location.country}
            </Tag>
            .
          </p>
          <p>
            Off the clock I’m usually halfway through a book, deep in some movie or pop culture rabbit hole, or up way
            too late for an <Tag>F1</Tag> race. I also save corners of the internet before they vanish, and I’ll take
            any excuse to travel.
          </p>
          <p>
            I’m an AI engineer at <Tag>Tavant</Tag>. Before that I helped take TaskLearn (10k+ learners) and Visume (1k+
            interviews) from zero to launch at GridRnD, and I run Spacered, a small design studio, on the side.
          </p>
        </div>
      </div>

      <div className={cx(styles.cell, styles.photo)} data-reveal="load" style={stagger(1)}>
        <Image
          src="/about/beach.jpg"
          alt="Himanshu on a beach at dusk, looking back over his shoulder at the waves"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      <div className={cx(styles.cell, styles.cta)} data-reveal="load" style={stagger(3)}>
        <AirDropWidget />
      </div>

      <div className={styles.lists}>
        <div className={cx(styles.cell, styles.notes)} data-reveal="load" style={stagger(4)}>
          <div className={styles.notesBar} aria-hidden="true">
            <span>
              <CaretLeftIcon weight="bold" />
              Notes
            </span>
            <i>
              <DotsThreeIcon weight="bold" />
            </i>
          </div>
          <p className={styles.notesTitle}>Things I currently enjoy</p>
          <ul className={styles.notesList}>
            {enjoying.map((item) => (
              <li key={item.label}>
                {item.label} {item.note && <span className={styles.note}>[ {item.note} ]</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className={cx(styles.cell, styles.turntable)} data-reveal="load" style={stagger(5)}>
          <Turntable />
        </div>
      </div>
    </section>
  );
}
