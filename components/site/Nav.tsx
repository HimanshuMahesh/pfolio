"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { navItems, site } from "@/content/site";
import { FinnTheHumanIcon } from "@phosphor-icons/react/dist/csr/FinnTheHuman";
import { HandWavingIcon } from "@phosphor-icons/react/dist/csr/HandWaving";
import { cx } from "@/lib/grid";
import styles from "./Nav.module.css";

/** The line (as a fraction of viewport height) a section must cross to count as "in view". */
const SPY_LINE = 0.4;

type Indicator = { x: number; w: number } | null;

/**
 * Floating nav bar: a solid pill, dark or light with the theme. A soft highlight
 * slides between links on hover and rests on the active one: the current
 * page, or on the homepage the section being read (scroll spy via `data-spy`
 * on the section).
 */
export function Nav() {
  const pathname = usePathname();
  const [spied, setSpied] = useState<string | null>(null);
  const [indicator, setIndicator] = useState<Indicator>(null);
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const hovering = useRef(false);

  // Case studies under /work/* belong to Work.
  const section = pathname.startsWith("/work/") ? "/#work" : pathname;
  const active = navItems.find((item) =>
    item.spy && pathname === "/" ? item.spy === spied : item.href === section,
  );

  const moveTo = useCallback((href: string | undefined) => {
    const el = href ? links.current.get(href) : undefined;
    setIndicator(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
  }, []);

  // Rest on the active item whenever it changes (unless the pointer is over the links).
  useLayoutEffect(() => {
    if (!hovering.current) moveTo(active?.href);
  }, [active?.href, moveTo]);

  useEffect(() => {
    const onResize = () => moveTo(active?.href);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active?.href, moveTo]);

  // Scroll spy: the root margin collapses the viewport to a line at SPY_LINE.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-spy]");
    if (!sections.length) return;
    const top = `${-SPY_LINE * 100}%`;
    const bottom = `${-(1 - SPY_LINE) * 100}%`;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.spy ?? null;
          setSpied((cur) => (e.isIntersecting ? id : cur === id ? null : cur));
        }
      },
      { rootMargin: `${top} 0px ${bottom} 0px` },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [pathname]);

  const restOnActive = () => {
    hovering.current = false;
    moveTo(active?.href);
  };

  return (
    <header className={styles.nav} id="top">
      <div className={styles.bar} data-bp="nav">
        <Link className={styles.logo} data-bp="logo" href="/#top" aria-label={`${site.name}, back to top`}>
          <FinnTheHumanIcon weight="duotone" className={styles.mark} aria-hidden="true" />
        </Link>

        <nav className={styles.links} data-bp="links" aria-label="Primary" onMouseLeave={restOnActive} onBlur={restOnActive}>
          <span
            className={cx(styles.indicator, indicator && styles.indicatorOn)}
            style={{ "--x": `${indicator?.x ?? 0}px`, "--w": `${indicator?.w ?? 0}px` } as CSSProperties}
            aria-hidden="true"
          />
          {navItems.map((item) => {
            const isActive = item === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => {
                  if (el) links.current.set(item.href, el);
                  else links.current.delete(item.href);
                }}
                className={cx(styles.link, isActive && styles.active)}
                aria-current={isActive ? (item.spy ? "location" : "page") : undefined}
                onMouseEnter={() => {
                  hovering.current = true;
                  moveTo(item.href);
                }}
                onFocus={() => moveTo(item.href)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link className={styles.hi} data-bp="hi" href="/#contact">
          <HandWavingIcon weight="duotone" className={styles.wave} aria-hidden="true" />
          Say hi
        </Link>
      </div>
    </header>
  );
}
