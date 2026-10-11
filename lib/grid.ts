import type { CSSProperties } from "react";

/** A CSS grid-column value, e.g. "1 / 4" or "9 / 13" or "1 / -1". */
type Span = string;

/**
 * Place a child of `.grid` per breakpoint: mobile (4 col), tablet (8 col),
 * desktop (12 col). Each falls back to the one below it when omitted.
 *
 *   <p style={place({ m: "1 / 3", t: "1 / 4", d: "1 / 4" })}>
 */
export function place(spans: { m?: Span; t?: Span; d?: Span }, style?: CSSProperties): CSSProperties {
  return {
    ...(spans.m && { "--m": spans.m }),
    ...(spans.t && { "--t": spans.t }),
    ...(spans.d && { "--d": spans.d }),
    ...style,
  } as CSSProperties;
}

/** Join class names, skipping falsy values. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}
