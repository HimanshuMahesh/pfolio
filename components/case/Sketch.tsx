import type { ReactNode } from "react";
import * as sk from "@/lib/sketch";
import { cx } from "@/lib/grid";
import styles from "./Sketch.module.css";

/**
 * Hand-drawn diagram primitives. Positions are in the viewBox of the
 * enclosing <Sketch>; strokes come from lib/sketch, colours from the
 * --dg-* tokens in Sketch.module.css (so both themes work).
 */

type Pt = [number, number];

/** calls a model · plain Python · anything else */
export type Tone = "llm" | "py" | "plain";

/** The <svg> wrapper. `minWidth` keeps text legible on phones (the figure scrolls sideways). */
export function Sketch({
  w, h, label, minWidth = 680, children,
}: { w: number; h: number; label: string; minWidth?: number; children: ReactNode }) {
  return (
    <div className={styles.scroll}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        style={{ minWidth }}
        role="img"
        aria-label={label}
      >
        {children}
      </svg>
    </div>
  );
}

export function Box({
  x, y, w, h, title, sub, tone = "plain", mono = true,
}: {
  x: number; y: number; w: number; h: number;
  title: string;
  sub?: string | string[];
  tone?: Tone;
  /** Bolder title for node names; false for plain-language boxes. */
  mono?: boolean;
}) {
  const r = sk.rng(sk.seedOf(`${title}${x}${y}`));
  const lines = sub === undefined ? [] : Array.isArray(sub) ? sub : [sub];
  const block = 16 + lines.length * 15;
  const top = y + h / 2 - block / 2 + 11;
  return (
    <g className={cx(styles.box, tone === "llm" && styles.llm)}>
      {/* the marker wash sits a little off-register, like a highlighter pass */}
      {tone === "llm" && <rect className={styles.wash} x={x + 3} y={y + 4} width={w - 1} height={h - 2} rx={2} />}
      <path className={styles.stroke} d={sk.rect(x, y, w, h, r)} />
      <text className={mono ? styles.mono : styles.title} x={x + w / 2} y={top} textAnchor="middle">
        {title}
      </text>
      {lines.map((line, i) => (
        <text key={line} className={styles.sub} x={x + w / 2} y={top + 17 + i * 15} textAnchor="middle">
          {line}
        </text>
      ))}
    </g>
  );
}

/** A database, drawn as a cylinder. */
export function Cylinder({ cx: x, y, w, h, title, sub }: { cx: number; y: number; w: number; h: number; title: string; sub?: string }) {
  const r = sk.rng(sk.seedOf(`${title}cyl`));
  const rx = w / 2;
  const ry = 11;
  const d =
    sk.ellipse(x, y + ry, rx, ry, r) +
    sk.line(x - rx, y + ry, x - rx, y + h - ry, r, { over: 0.6 }) +
    sk.line(x + rx, y + ry, x + rx, y + h - ry, r, { over: 0.6 }) +
    sk.ellipse(x, y + h - ry, rx, ry, r, { from: 0, to: Math.PI });
  return (
    <g className={styles.box}>
      <path className={styles.stroke} d={d} />
      <text className={styles.mono} x={x} y={y + h / 2 + 8} textAnchor="middle">{title}</text>
      {sub && <text className={styles.sub} x={x} y={y + h / 2 + 25} textAnchor="middle">{sub}</text>}
    </g>
  );
}

/** A connector through `pts`, with an arrowhead unless `head` is false. */
export function Arrow({
  pts, dashed, head = true, label, at, anchor = "middle", tone,
}: {
  pts: Pt[];
  dashed?: boolean;
  head?: boolean;
  label?: string;
  /** Where the label sits. */
  at?: Pt;
  anchor?: "start" | "middle" | "end";
  tone?: "green";
}) {
  const r = sk.rng(sk.seedOf(pts.flat().join(",")));
  const { body, head: tip } = sk.arrow(pts, r, { head: head ? 7 : 0 });
  return (
    <g className={cx(styles.arrow, tone === "green" && styles.arrowGreen)}>
      <path className={cx(styles.body, dashed && styles.dashed)} d={body} />
      {tip && <path className={styles.head} d={tip} />}
      {label && at && (
        <text className={styles.edge} x={at[0]} y={at[1]} textAnchor={anchor}>{label}</text>
      )}
    </g>
  );
}

/** A curved connector from p0 to p1, bent toward c. */
export function Curve({
  p0, c, p1, dashed, label, at, anchor = "middle",
}: { p0: Pt; c: Pt; p1: Pt; dashed?: boolean; label?: string; at?: Pt; anchor?: "start" | "middle" | "end" }) {
  const r = sk.rng(sk.seedOf([...p0, ...c, ...p1].join(",")));
  const { body, head } = sk.curve(p0, c, p1, r);
  return (
    <g className={styles.arrow}>
      <path className={cx(styles.body, dashed && styles.dashed)} d={body} />
      <path className={styles.head} d={head} />
      {label && at && <text className={styles.edge} x={at[0]} y={at[1]} textAnchor={anchor}>{label}</text>}
    </g>
  );
}

/** A margin note in the muted diagram colour. Pass an array for several lines. */
export function Note({
  x, y, children, anchor = "start", size, faint,
}: { x: number; y: number; children: string | string[]; anchor?: "start" | "middle" | "end"; size?: number; faint?: boolean }) {
  const lines = Array.isArray(children) ? children : [children];
  const lh = (size ?? 13) * 1.35;
  return (
    <text
      className={cx(styles.note, faint && styles.faint)}
      x={x}
      y={y}
      textAnchor={anchor}
      style={size ? { fontSize: size } : undefined}
    >
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i ? lh : 0}>{line}</tspan>
      ))}
    </text>
  );
}

/** Small uppercase label, e.g. an axis name or a step number. */
export function Tag({ x, y, children, anchor = "start", rotate }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end"; rotate?: number }) {
  return (
    <text
      className={styles.tag}
      x={x}
      y={y}
      textAnchor={anchor}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** A pen dot: filled (green) or hollow. */
export function Dot({ x, y, r: size = 5.5, filled, ink }: { x: number; y: number; r?: number; filled?: boolean; ink?: boolean }) {
  const r = sk.rng(sk.seedOf(`dot${x},${y}`));
  return (
    <g className={cx(styles.dot, filled && styles.dotFilled, ink && styles.dotInk)}>
      {filled && <circle cx={x + 0.8} cy={y + 0.8} r={size - 0.5} />}
      <path d={sk.ellipse(x, y, size, size, r, { wobble: 0.05 })} />
    </g>
  );
}

/** A plain hand-drawn stroke, for dividers, axes and diamond edges. */
export function Stroke({ d, dashed, faint, green }: { d: string; dashed?: boolean; faint?: boolean; green?: boolean }) {
  return <path className={cx(styles.plain, dashed && styles.dashed, faint && styles.faintStroke, green && styles.greenStroke)} d={d} />;
}
