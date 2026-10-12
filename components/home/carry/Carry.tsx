import { Architects_Daughter } from "next/font/google";
import type { CSSProperties } from "react";
import { cx } from "@/lib/grid";
import { CARRY_FIGURES } from "./figures";
import styles from "./Carry.module.css";

type Figure = (typeof CARRY_FIGURES)[number];

/* Handwriting for the margin notes only. */
const hand = Architects_Daughter({ weight: "400", subsets: ["latin"], display: "swap" });

/** A margin note per object, in the voice of a desk scrawl. */
const NOTES: Record<Figure["name"], string> = {
  camera: "weekend street walks. most shots never leave the card",
  iphone: "three lenses, still shoots everything on 1×",
  iems: "the off switch for an open office",
  switch: "pokémon, mostly. still chasing a shiny, 400 resets in",
  watch: "set two minutes fast. fools no one",
};

/** One object on its plinth: a still and a live drawing per theme. CSS shows the
    theme's still, and crossfades to its live drawing (with the motion baked in) on hover. */
function Item({ figure, decorative }: { figure: Figure; decorative: boolean }) {
  const size = { "--w": figure.width, "--h": figure.height } as CSSProperties;
  const variants = [
    { theme: styles.dark, src: `/carry/${figure.name}-dark.svg`, live: false },
    { theme: styles.light, src: `/carry/${figure.name}-light.svg`, live: false },
    { theme: styles.dark, src: `/carry/${figure.name}-dark-live.svg`, live: true },
    { theme: styles.light, src: `/carry/${figure.name}-light-live.svg`, live: true },
  ];
  return (
    <li className={styles.item} style={size}>
      <div className={styles.art}>
        <div className={styles.frame}>
      {variants.map(({ theme, src, live }) => (
        // Plain <img>: the drawings are pre-built SVGs with their theme baked in, so there is nothing to optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          className={live ? `${theme} ${styles.live}` : theme}
          src={src}
          alt={decorative || live ? "" : figure.label}
          width={figure.width}
          height={figure.height}
          loading="lazy"
          decoding="async"
        />
      ))}
        </div>
      </div>
      <p className={`${styles.note} ${hand.className}`}>
        {NOTES[figure.name]}
      </p>
    </li>
  );
}

/**
 * Between Work and Notes: the things on the desk (camera, phone, IEMs,
 * console, watch), isometric drawings built by scripts/carry/build.mjs, drifting
 * past as a marquee. The track holds the set twice so the loop is seamless;
 * the copy is hidden from assistive tech.
 */
/** The tallest drawing sets the shelf height, so every plinth stands on one line. */
const SHELF = { "--shelf": Math.max(...CARRY_FIGURES.map((f) => f.height)) } as CSSProperties;

export function Carry() {
  return (
    <section
      className={cx("wrap", styles.strip)}
      style={SHELF}
      id="carry"
      data-section="carry"
      data-section-title="Everyday carry"
      aria-label="Everyday carry: a camera, a phone's triple camera, in-ear monitors, a handheld console and a watch"
    >
      <div className={styles.viewport}>
      <div className={styles.track}>
        {[false, true].map((copy) => (
          <ul key={String(copy)} className={styles.set} aria-hidden={copy || undefined}>
            {CARRY_FIGURES.map((figure) => (
              <Item key={figure.name} figure={figure} decorative={copy} />
            ))}
          </ul>
        ))}
      </div>
      </div>
    </section>
  );
}
