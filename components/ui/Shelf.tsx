import { Architects_Daughter } from "next/font/google";
import type { CSSProperties } from "react";
import styles from "./Shelf.module.css";

/* Handwriting for the margin notes only. */
const hand = Architects_Daughter({ weight: "400", subsets: ["latin"], display: "swap" });

/** One pre-built drawing: its file name, size in drawing px, and what it shows. */
export type ShelfFigure = { readonly name: string; readonly width: number; readonly height: number; readonly label: string };

/** One object on its plinth: a still and a live drawing per theme. CSS shows the
    theme's still, and crossfades to its live drawing (with the motion baked in) on hover. */
function Item({ figure, dir, note, decorative }: { figure: ShelfFigure; dir: string; note: string; decorative: boolean }) {
  const size = { "--w": figure.width, "--h": figure.height } as CSSProperties;
  const variants = [
    { theme: styles.dark, src: `${dir}/${figure.name}-dark.svg`, live: false },
    { theme: styles.light, src: `${dir}/${figure.name}-light.svg`, live: false },
    { theme: styles.dark, src: `${dir}/${figure.name}-dark-live.svg`, live: true },
    { theme: styles.light, src: `${dir}/${figure.name}-light-live.svg`, live: true },
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
      <p className={`${styles.note} ${hand.className}`}>{note}</p>
    </li>
  );
}

/**
 * A shelf of isometric objects on plinths drifting past as a marquee, each with
 * a handwritten margin note. The track holds the set twice so the loop is
 * seamless; the copy is hidden from assistive tech. The tallest drawing sets
 * the shelf height, so every plinth stands on one line.
 */
export function Shelf({ figures, dir, notes }: { figures: readonly ShelfFigure[]; dir: string; notes: Record<string, string> }) {
  const shelf = { "--shelf": Math.max(...figures.map((f) => f.height)) } as CSSProperties;
  return (
    <div className={styles.viewport} style={shelf}>
      <div className={styles.track}>
        {[false, true].map((copy) => (
          <ul key={String(copy)} className={styles.set} aria-hidden={copy || undefined}>
            {figures.map((figure) => (
              <Item key={figure.name} figure={figure} dir={dir} note={notes[figure.name]} decorative={copy} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
