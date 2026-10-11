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
    io.observe(video);
    return () => io.disconnect();
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
      preload="auto"
      aria-hidden="true"
    />
  );
}
