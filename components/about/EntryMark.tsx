import Image from "next/image";
import type { CSSProperties } from "react";
import type { EntryMark as Mark } from "@/content/about";
import styles from "./EntryMark.module.css";

import spaceredMark from "@/assets/brands/spacered-mark.svg";

/** A company or award mark on a small black key, the same key the hero uses inline. */
export function EntryMark({ mark }: { mark: Mark }) {
  return (
    <span className={styles.key} aria-hidden="true">
      {mark.kind === "tavant" && <span className={styles.tavant}>T</span>}
      {mark.kind === "spacered" && <Image src={spaceredMark} alt="" className={styles.spacered} />}
      {mark.kind === "text" && (
        <span className={styles.text} style={mark.color ? ({ color: mark.color } as CSSProperties) : undefined}>
          {mark.text}
        </span>
      )}
    </span>
  );
}
