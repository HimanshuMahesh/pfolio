"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeTheme, syncThemeColor, type Theme } from "@/lib/theme";
import { cx } from "@/lib/grid";
import { LightbulbIcon } from "@phosphor-icons/react/dist/csr/Lightbulb";
import chip from "./Chip.module.css";
import styles from "./ThemeToggle.module.css";

const serverTheme = (): Theme => "dark";

/**
 * A light bulb: on = light mode. Its look is driven by `data-theme` in CSS,
 * so it's right from first paint; React only tracks the state for aria.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, serverTheme);
  const isLight = theme === "light";

  useEffect(() => syncThemeColor(), []);

  return (
    <button
      type="button"
      className={cx(chip.chip, chip.interactive, chip.square, styles.toggle, className)}
      aria-label="Light mode"
      aria-pressed={isLight}
      onClick={(e) => setTheme(isLight ? "dark" : "light", e.currentTarget)}
    >
      <LightbulbIcon weight="duotone" className={styles.bulb} />
    </button>
  );
}
