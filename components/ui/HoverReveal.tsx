"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/grid";
import styles from "./HoverReveal.module.css";

const EDGE = 12; // px a panel keeps from the viewport edge

type Props = {
  /** The hovered word. The panel is centred on it. */
  children: ReactNode;
  /** Words before the anchor that are part of the same hover target (they may wrap). */
  lead?: ReactNode;
  /** What appears on hover. Decorative: keep its content available to screen readers elsewhere. */
  panel: ReactNode;
  /** Make the trigger a link. */
  href?: string;
  /** Keep the panel inside the viewport horizontally (for card-like panels). */
  contain?: boolean;
  /** Lets the pointer move into the panel (e.g. to click a link in it). */
  interactive?: boolean;
  panelClassName?: string;
};

/**
 * A word in running copy that reveals something above itself on hover or
 * focus. On touch screens the first tap opens it and a second tap follows
 * the link; tapping elsewhere closes it. While one is open, the paragraph
 * around it dims (see `[data-hover]` in the parent's CSS).
 */
export function HoverReveal({ children, lead, panel, href, contain, interactive, panelClassName }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    if (!contain || !anchor.current || !panelRef.current) return;
    const r = anchor.current.getBoundingClientRect();
    const w = panelRef.current.offsetWidth;
    const left = r.left + r.width / 2 - w / 2;
    const shift = Math.max(EDGE - left, 0) + Math.min(window.innerWidth - EDGE - (left + w), 0);
    panelRef.current.style.setProperty("--shift", `${shift}px`);
  }, [contain]);

  // A closed panel is transparent but still laid out: placed only on hover,
  // it would hang past a narrow viewport's edge and make the page scroll
  // sideways. So place it up front, and again whenever the viewport resizes.
  useEffect(() => {
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const onClick = (e: React.MouseEvent) => {
    if (open || !window.matchMedia("(hover: none)").matches) return;
    e.preventDefault(); // first tap on touch: show, don't navigate
    place();
    setOpen(true);
  };

  const content = (
    <>
      {lead}
      {lead && " "}
      <span ref={anchor} className={styles.anchor}>
        {children}
        <span
          ref={panelRef}
          className={cx(styles.panel, interactive && styles.interactive, panelClassName)}
          aria-hidden="true"
        >
          {panel}
        </span>
      </span>
    </>
  );

  return (
    <span
      ref={root}
      className={styles.root}
      data-hover=""
      data-open={open ? "" : undefined}
      onPointerEnter={place}
      onFocus={place}
    >
      {href ? (
        <a className={styles.trigger} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {content}
        </a>
      ) : (
        <span className={styles.trigger} tabIndex={0} onClick={onClick}>
          {content}
        </span>
      )}
    </span>
  );
}
