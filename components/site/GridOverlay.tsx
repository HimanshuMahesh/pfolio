"use client";

import { useEffect, useSyncExternalStore } from "react";
import styles from "./GridOverlay.module.css";

const STORAGE_KEY = "dev-grid";
const CHANGE_EVENT = "dev-grid-change";
const MAX_COLUMNS = 12;

/* The on/off flag lives in localStorage, so it survives reloads. */
function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function toggle() {
  try {
    localStorage.setItem(STORAGE_KEY, read() ? "0" : "1");
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Development only: press G to overlay the 4 / 8 / 12 column grid.
 * Rendered from the root layout when NODE_ENV is "development".
 */
export function GridOverlay() {
  const on = useSyncExternalStore(subscribe, read, () => false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "g" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!on) return null;
  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className="wrap grid">
        {Array.from({ length: MAX_COLUMNS }, (_, i) => (
          <span key={i} data-n={i + 1} />
        ))}
      </div>
    </div>
  );
}
