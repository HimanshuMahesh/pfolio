"use client";

import { useEffect, useRef } from "react";

/**
 * A muted, looping cover film. Plays only while on screen: autoplay alone
 * isn't reliable (background tabs, data saver), so it's started and paused
 * from an IntersectionObserver instead.
 */
export function CoverVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 },
    );
    // Nothing downloads up front (preload="none"). Once the page has loaded and gone idle, films
    // within a screen of view start buffering so they're ready on arrival, but never compete with
    // the first paint. Data saver keeps them on demand.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.preload = "auto";
        near.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let idle = 0;
    const arm = () => {
      idle = window.requestIdleCallback
        ? window.requestIdleCallback(() => near.observe(video), { timeout: 3000 })
        : window.setTimeout(() => near.observe(video), 1500);
    };
    if (!saveData) {
      if (document.readyState === "complete") arm();
      else window.addEventListener("load", arm, { once: true });
    }
    io.observe(video);
    return () => {
      io.disconnect();
      near.disconnect();
      window.removeEventListener("load", arm);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
