import type { SVGProps } from "react";

/* The site mark. UI icons come from Phosphor (duotone) — see the components. */

type IconProps = SVGProps<SVGSVGElement>;

/** Placeholder logo mark: a sun on the horizon, one star. Stand-in until a real mark exists. */
export function LogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <path d="M4.25 11a3.75 3.75 0 0 1 7.5 0Z" fill="currentColor" />
      <path d="M1.5 11h13M3 13.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12.75" cy="3.5" r="1" fill="currentColor" />
    </svg>
  );
}
