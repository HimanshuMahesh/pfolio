import { HEIGHT, LABEL, WIDTH, beamAt, hangerShift, layers, needleAt, readoutOf, tiltOf, totalOf } from "./balance/geometry.mjs";
import { BalanceLive } from "./BalanceLive";
import styles from "@/components/notes/Article.module.css";

/** Fig 2: the beam balance. The static parts are built here, on the server; BalanceLive moves the beam. */
export function Balance({ fig, caption }: { fig: string; caption: string }) {
  const start = 1;
  const theta = tiltOf(totalOf(start));
  const needle = needleAt(theta);
  return (
    <figure className={styles.figure}>
      <div className={`${styles.plate} iso`}>
        <div className={styles.plateHead} aria-hidden="true">
          <span>{fig}</span>
          <span>Weighing a move</span>
        </div>
        <BalanceLive
          width={WIDTH}
          height={HEIGHT}
          label={LABEL}
          start={start}
          layers={layers()}
          beam={beamAt(theta)}
          needle={needle.d}
          pin={needle.pin}
          shift={[hangerShift(-1, theta), hangerShift(1, theta)]}
        />
        <div className={styles.plateFoot} aria-hidden="true">
          <span>Hover or step the terms</span>
          <span className={styles.readout} data-readout>{readoutOf(start)}</span>
        </div>
      </div>
      <figcaption className={styles.caption}>
        {caption}
      </figcaption>
    </figure>
  );
}
