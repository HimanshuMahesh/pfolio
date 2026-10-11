import type { ReactNode } from "react";
import { cx, place } from "@/lib/grid";
import styles from "./SectionHead.module.css";

type Props = {
  /** Section index, e.g. "02". */
  index: string;
  label: string;
  /** Right-hand slot: a link, a clock, a count. */
  aside?: ReactNode;
  className?: string;
  /** Makes the label the section's heading (an h2 with this id), for aria-labelledby. */
  id?: string;
};

/** The label row that opens a section: "(02) Writing ··· All notes ↗". */
export function SectionHead({ index, label, aside, className, id }: Props) {
  const Label = id ? "h2" : "p";
  return (
    <div className={cx("grid", "t-label", styles.head, className)}>
      <Label id={id} style={place({ m: "1 / 3", t: "1 / 4", d: "1 / 4" })}>
        <span className="idx">({index})</span>
        {label}
      </Label>
      {aside && (
        <p className={styles.aside} style={place({ m: "3 / 5", t: "4 / 9", d: "4 / 13" })}>
          {aside}
        </p>
      )}
    </div>
  );
}
