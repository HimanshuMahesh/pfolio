"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "@/content/site";
import { cx } from "@/lib/grid";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import styles from "./CopyEmailButton.module.css";

const RESET_AFTER_MS = 1800;

type Props = {
  size?: "md" | "lg";
  /** Resting label. */
  children: ReactNode;
  copiedLabel: string;
  /** Which edge the email tooltip aligns to. */
  tipAlign?: "start" | "end";
  className?: string;
};

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts: fall back to a hidden textarea.
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    ta.remove();
    return ok;
  }
}

export function CopyEmailButton({ size = "md", children, copiedLabel, tipAlign = "end", className }: Props) {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    const ok = await writeClipboard(site.email);
    setAnnouncement(ok ? "Email address copied" : site.email);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), RESET_AFTER_MS);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className={cx(styles.button, styles[size], copied && styles.copied, className)}
      >
        <CopyIcon weight="duotone" className={styles.icon} />
        <span className={styles.swap}>
          <span>{children}</span>
          <span>{copiedLabel}</span>
        </span>
        <span className={cx(styles.tip, tipAlign === "start" && styles.tipStart)} aria-hidden="true">
          {site.email}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
