import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/grid";
import styles from "./Media.module.css";

type Props = {
  /** Aspect ratio, e.g. "4 / 3". Omit to fill the parent's height. */
  ratio?: string;
  /** CSS background painted until an image is supplied (e.g. a gradient).
      Without it, the slot shows the technical placeholder pattern. */
  fill?: string;
  /** Usually a next/image with `fill`. Zooms with the rest of the slot. */
  children?: ReactNode;
  /** Sits above the zooming layer and does not scale (captions, wordmarks). */
  overlay?: ReactNode;
  radius?: string;
  className?: string;
};

/**
 * An image slot. Zooms gently when the link that contains it is hovered,
 * so cards don't each have to wire that up.
 */
export function Media({ ratio, fill, children, overlay, radius, className }: Props) {
  const style = {
    ...(ratio && { aspectRatio: ratio }),
    ...(fill && { "--media-fill": fill }),
    ...(radius && { borderRadius: radius }),
  } as CSSProperties;

  return (
    <div className={cx(styles.media, !ratio && styles.fillParent, className)} style={style}>
      <div className={cx(styles.inner, !fill && !children && styles.pattern)}>{children}</div>
      {overlay}
    </div>
  );
}
