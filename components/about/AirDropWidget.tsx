"use client";

import { useRef, useState } from "react";
import { resumeHref } from "@/content/about";
import { cx } from "@/lib/grid";
import styles from "./Bento.module.css";

/** The AirDrop icon: white rings, open at the bottom, around a dot, on a blue disc. */
function AirDropIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.airdropIcon} aria-hidden="true">
      <circle cx="12" cy="12" r="1.7" />
      <path d="M9.2 14.8a4 4 0 1 1 5.6 0" />
      <path d="M6.9 17.1a7.2 7.2 0 1 1 10.2 0" />
    </svg>
  );
}

/**
 * The resume, offered as an incoming AirDrop. Accept opens the PDF.
 * Decline doesn't: the button shakes its head and says so.
 */
export function AirDropWidget() {
  const [refused, setRefused] = useState(false);
  const timer = useRef(0);

  const decline = () => {
    setRefused(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRefused(false), 1800);
  };

  return (
    <div className={styles.drop}>
      <AirDropIcon />

      <div className={styles.dropText}>
        <p className={styles.dropTitle}>AirDrop</p>
        <p>
          I’d like to share my <span className={styles.file}>resume</span>.
        </p>
      </div>

      <div className={cx(styles.dropActions, refused && styles.refused)}>
        <button type="button" onClick={decline}>
          {refused ? "Nice try" : "Decline"}
        </button>
        <a href={resumeHref} target="_blank" rel="noopener" aria-label="Accept: open my resume (PDF)">
          Accept
        </a>
      </div>
    </div>
  );
}
