"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { site } from "@/content/site";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Tldr } from "@/components/ui/Tldr";
import { createSky } from "@/lib/sky/controller";
import { cx } from "@/lib/grid";
import chip from "@/components/ui/Chip.module.css";
import styles from "./SkyHero.module.css";

type Props = {
  /** The portrait. The horizon runs through its centre. */
  portrait: ReactNode;
  /** Everything below the portrait row. */
  children: ReactNode;
};

/**
 * The hero frame: a live sky over Bengaluru behind the top of the page, the
 * portrait row (portrait · place · time ··· theme bulb · tl;dr) sitting on its
 * horizon, and the centred hero column below.
 */
export function SkyHero({ portrait, children }: Props) {
  const shell = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scrub = useRef<HTMLDivElement>(null);
  const scrubLabel = useRef<HTMLSpanElement>(null);
  const scrubGlyph = useRef<HTMLElement>(null);
  const scrubText = useRef<HTMLSpanElement>(null);
  const section = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const horizon = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const phase = useRef<HTMLSpanElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const refs = [shell, sky, canvas, scrub, scrubLabel, scrubGlyph, scrubText, section, band, horizon, time, phase, slider];
    if (refs.some((r) => !r.current)) return;
    return createSky({
      shell: shell.current!,
      sky: sky.current!,
      canvas: canvas.current!,
      scrub: scrub.current!,
      scrubLabel: scrubLabel.current!,
      scrubGlyph: scrubGlyph.current!,
      scrubText: scrubText.current!,
      bounds: section.current!,
      band: band.current!,
      horizon: horizon.current!,
      time: time.current!,
      phase: phase.current!,
      slider: slider.current!,
      hint: hint.current,
    });
  }, []);

  return (
    <div ref={shell} className={styles.shell}>
      <div ref={sky} className={styles.sky} data-bp="sky" aria-hidden="true">
        <canvas ref={canvas} className={styles.canvas} />
        <div ref={scrub} className={styles.scrub}>
          <span ref={scrubLabel} className={styles.scrubLabel}>
            <i ref={scrubGlyph} className={styles.glyph} />
            <span ref={scrubText} />
          </span>
        </div>
      </div>

      <section ref={section} className={cx("wrap", styles.hero)} aria-label="Introduction" id="hero" data-section="hero" data-section-title="Intro" data-section-aliases="who, about him, startups, clients, ola electric, triplespeed, cortekz, based in bengaluru">
        <div className={styles.column}>
          {/* Open sky above the horizon; the scrub label lands here too. */}
          <div ref={band} className={styles.band} data-ask-skip>
            <span ref={hint} className={styles.hint}>
              <span className="hide-m">Hover the sky</span>
              <span className="show-m">Drag the sky</span>
            </span>
          </div>

          <div className={styles.row} data-reveal="load" data-ask-skip>
            <div ref={horizon} className={styles.portrait} data-bp="portrait">
              {portrait}
            </div>

            <div className={styles.chips} data-bp="chips">
              <span className={chip.chip}>
                <MapPinIcon weight="duotone" className={chip.icon} />
                <span>
                  {site.location.city}
                  <span className="hide-m">, {site.location.country}</span>
                </span>
              </span>

              <div
                ref={slider}
                className={cx(chip.chip, chip.interactive)}
                role="slider"
                tabIndex={0}
                aria-label="Time of day in Bengaluru. Arrow keys scrub the sky, Escape returns to now."
                aria-valuemin={0}
                aria-valuemax={1439}
                // Real values are written by the sky controller on mount; the page is static.
                aria-valuenow={0}
                aria-valuetext="Current time in Bengaluru"
              >
                <ClockIcon weight="duotone" className={chip.icon} />
                <span ref={time}>--:--</span>
                <span ref={phase} className={cx(chip.soft, styles.phase)}>
                  {site.location.timeZoneLabel}
                </span>
              </div>
            </div>

            <div className={styles.toggle} data-bp="toggles">
              <ThemeToggle />
              <Tldr />
            </div>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}
