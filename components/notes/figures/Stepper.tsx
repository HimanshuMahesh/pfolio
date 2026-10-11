"use client";

import { cx } from "@/lib/grid";
import styles from "@/components/notes/Article.module.css";

/**
 * A discrete slider: a hairline track with one stop per value. Arrow keys
 * step along it; each stop is a radio, so screen readers hear the choice.
 */
export function Stepper({
  label, stops, value, onChange,
}: {
  label: string;
  stops: string[];
  value: number;
  onChange: (index: number) => void;
}) {
  const last = stops.length - 1;
  return (
    <div
      className={styles.stepper}
      role="radiogroup"
      aria-label={label}
      style={{ "--fill": `${(value / last) * 100}%` } as React.CSSProperties}
      onKeyDown={(e) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        onChange(Math.min(last, Math.max(0, value + step)));
      }}
    >
      <span className={styles.stepperLabel}>{label}</span>
      <div className={styles.track}>
        {stops.map((stop, i) => (
          <button
            key={stop}
            type="button"
            role="radio"
            aria-checked={i === value}
            tabIndex={i === value ? 0 : -1}
            className={cx(styles.stop, i <= value && styles.stopOn, i === value && styles.stopAt)}
            style={{ left: `${(i / last) * 100}%` }}
            onClick={() => onChange(i)}
          >
            <span>{stop}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
