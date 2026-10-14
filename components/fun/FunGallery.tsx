"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import { pieces, type Piece } from "@/content/fun";
import { CoverVideo } from "@/components/ui/CoverVideo";
import { cx } from "@/lib/grid";
import { StubButton } from "./StubButton";
import { Tilt } from "./Tilt";
import styles from "./FunGallery.module.css";

const SIZES = "(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw";

/** How far each polaroid sits off straight, in turn, so the wall looks pinned up by hand. */
const ROTATIONS = [-1.6, 1.1, -0.6, 1.8, -1.2, 0.7, -2, 1.4, -0.8, 0.4];

/** Columns at each width, matching the breakpoints in FunGallery.module.css. */
function useColumns() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const wide = matchMedia("(min-width: 1200px)");
    const mid = matchMedia("(min-width: 768px)");
    const update = () => setCols(wide.matches ? 4 : mid.matches ? 3 : 2);
    update();
    wide.addEventListener("change", update);
    mid.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      mid.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

/**
 * Deals the pieces, in order, onto whichever column is shortest so far, so
 * the wall reads newest first along each row. Heights come from the known
 * picture sizes, so nothing needs measuring.
 */
function deal(cols: number) {
  const columns: Array<Array<{ piece: Piece; step: number }>> = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  pieces.forEach((piece, step) => {
    const c = heights.indexOf(Math.min(...heights));
    columns[c].push({ piece, step });
    heights[c] += piece.height / piece.width;
  });
  return columns;
}

/** A polaroid: the picture, uncropped, in a white print with a deeper bottom margin for the caption. */
function PieceTile({ piece, step }: { piece: Piece; step: number }) {
  const style = {
    "--reveal-delay": `${(step % 4) * 50}ms`,
    "--rot": `${ROTATIONS[step % ROTATIONS.length]}deg`,
  } as CSSProperties;

  return (
    <figure className={styles.cell} data-reveal style={style}>
      <div className={cx(styles.lean, styles.print)} data-tilt>
        <div className={styles.photo} style={{ aspectRatio: `${piece.width} / ${piece.height}` }}>
          {piece.video ? (
            <CoverVideo className={styles.video} src={piece.video} poster={piece.image} />
          ) : (
            <Image src={piece.image} alt={piece.title} width={piece.width} height={piece.height} sizes={SIZES} />
          )}
        </div>
        <figcaption className={styles.caption}>{piece.title}</figcaption>
      </div>
    </figure>
  );
}

/** Side quests, a masonry wall of polaroids, with the stub tag above. */
export function FunGallery() {
  const cols = useColumns();

  // Re-dealing remounts tiles that change column, after the page-wide
  // RevealObserver has already looked; reveal those here or they stay hidden.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-revealed", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll(`.${styles.cell}:not([data-revealed])`).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [cols]);

  return (
    <>
      <div className={styles.filters}>
        <StubButton />
      </div>

      <Tilt className={styles.gallery}>
        {deal(cols).map((column, c) => (
          <div key={c} className={styles.column}>
            {column.map(({ piece, step }) => (
              <PieceTile key={piece.image} piece={piece} step={step} />
            ))}
          </div>
        ))}
      </Tilt>
    </>
  );
}
