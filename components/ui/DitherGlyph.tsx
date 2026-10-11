"use client";

import { EyeIcon, OrbitIcon, TensorIcon, motionStyles } from "@unlocalhosted/dither-icons";
import type { ReactNode } from "react";
import styles from "./DitherGlyph.module.css";

const ICONS = { tensor: TensorIcon, orbit: OrbitIcon, eye: EyeIcon };

type Props = {
  icon: keyof typeof ICONS;
  /** The word the glyph introduces; hovering either plays the glyph's motion. */
  children?: ReactNode;
};

/**
 * A dithered, animated icon set inline with running text (from
 * @unlocalhosted/dither-icons). It takes the text colour and plays its
 * small motion when the glyph or its word is hovered or focused.
 */
export function DitherGlyph({ icon, children }: Props) {
  const Icon = ICONS[icon];
  return (
    <span className={`di-trigger ${styles.pair}`}>
      {/* React 19 hoists and de-duplicates this, so the motion CSS ships once */}
      <style href="dither-icons-motion" precedence="default">
        {motionStyles}
      </style>
      <Icon className={styles.glyph} size="1.3em" texture="dither" animate aria-hidden="true" />
      {children}
    </span>
  );
}
