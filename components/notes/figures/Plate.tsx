import type { ReactNode } from "react";
import styles from "@/components/notes/Article.module.css";

/** A square figure plate: label row, the figure, a control, a hint and a live readout, and a caption below. */
export function Plate({ fig, title, hint, readout, control, caption, children }: {
  fig: string; title: string; hint: string; readout: string; control: ReactNode; caption: string; children: ReactNode;
}) {
  return (
    <figure className={styles.figure}>
      <div className={styles.plate}>
        <div className={styles.plateHead} aria-hidden="true">
          <span>{fig}</span>
          <span>{title}</span>
        </div>
        <div className={styles.drawing}>{children}</div>
        {control}
        <div className={styles.plateFoot}>
          <span aria-hidden="true">{hint}</span>
          <span className={styles.readout} aria-live="polite">{readout}</span>
        </div>
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
