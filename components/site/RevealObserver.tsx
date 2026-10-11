"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One shared observer for every `[data-reveal]` element on the page: marks
 * each with `data-revealed` the first time it scrolls into view (the CSS in
 * utilities.css does the rest). Keeps reveal-on-scroll out of the component
 * tree, so sections stay server components.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-revealed", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll('[data-reveal]:not([data-reveal="load"]):not([data-revealed])').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
