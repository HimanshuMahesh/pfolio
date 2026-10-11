"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "@/lib/grid";
import styles from "./Case.module.css";

/** The line (fraction of viewport height) a section's top must pass to become current. */
const SPY_LINE = 0.35;

export type RailItem = { id: string; label: string; icon: ReactNode };

/** The section index, fixed to the left edge of the screen. The section being read is lit. */
export function CaseRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * SPY_LINE;
      let current = sections[0]?.id;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= line) current = s.id;
      }
      // At the very bottom the last short sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  return (
    <nav className={styles.rail} aria-label="Sections">
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cx(styles.railLink, item.id === active && styles.railActive)}
              aria-current={item.id === active ? "location" : undefined}
            >
              <span className={styles.railIcon} aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
