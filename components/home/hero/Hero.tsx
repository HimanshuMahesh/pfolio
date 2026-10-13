import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { site } from "@/content/site";
import { sideQuests, startups, ventures } from "@/content/intro";
import { HoverReveal } from "@/components/ui/HoverReveal";
import { VentureCard } from "@/components/ui/VentureCard";
import { DitherGlyph } from "@/components/ui/DitherGlyph";
import { cx } from "@/lib/grid";
import { SkyHero } from "./SkyHero";
import styles from "./Hero.module.css";

import portrait from "@/assets/portrait.png";
import spaceredMark from "@/assets/brands/spacered-mark.svg";

/** Hero elements rise in one after another. */
const stagger = (step: number) => ({ "--reveal-delay": `${step * 90}ms` }) as CSSProperties;

/** An inline company name followed by its mark on a small black key. */
function Brand({ children, mark }: { children: ReactNode; mark: ReactNode }) {
  return (
    <span className={styles.brand}>
      {children}
      <span className={styles.brandMark} aria-hidden="true">
        {mark}
      </span>
    </span>
  );
}

/* Where each logo settles above the hovered word: x, y (px), rotation (deg).
   A close, gentle scatter; the caption sits on top. */
const CAPTION: [number, number, number] = [0, -92, 0];
const CLOUD: Array<[number, number, number]> = [
  [-128, -34, -4],
  [4, -58, 3],
  [130, -30, -3],
  [-40, -80, 2],
];

function StartupCloud() {
  const place = (x: number, y: number, r: number, i: number) =>
    ({ "--x": `${x}px`, "--y": `${y}px`, "--r": `${r}deg`, "--i": i }) as CSSProperties;
  return (
    <span className={styles.cloud}>
      <span className={styles.cloudCap} style={place(...CAPTION, 0)}>
        Spacered works with
      </span>
      {startups.map((s, i) => {
        const [x, y, r] = CLOUD[i % CLOUD.length];
        return (
          <span key={s.name} className={styles.cloudItem} style={place(x, y, r, i + 1)}>
            <Image src={s.logo} alt="" className={styles.cloudLogo} style={{ height: s.height }} />
            {s.wordmark && (
              <span className={styles.cloudWordmark} style={{ fontSize: s.wordmarkSize }}>
                {s.wordmark}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/* Where each side-quest frame lands: x, y (px), rotation (deg), width (px). */
const QUEST_LAYOUT: Array<[number, number, number, number]> = [
  [-104, -30, -6, 76],
  [0, -66, 3, 104],
  [104, -32, -4, 82],
];

function SideQuestFrames() {
  return (
    <span className={styles.cloud}>
      {sideQuests.map((q, i) => {
        const [x, y, r, w] = QUEST_LAYOUT[i % QUEST_LAYOUT.length];
        const style = {
          "--x": `${x}px`,
          "--y": `${y}px`,
          "--r": `${r}deg`,
          "--i": i,
          width: w,
          aspectRatio: q.ratio,
        } as CSSProperties;
        return (
          <span key={i} className={cx(styles.cloudItem, styles.frame)} style={style}>
            {q.image && <Image src={q.image} alt={q.alt ?? ""} fill sizes="120px" />}
          </span>
        );
      })}
    </span>
  );
}

export function Hero() {
  const [tasklearn, visume, spacered] = ventures;
  const startupNames = new Intl.ListFormat("en").format(startups.map((s) => s.name));

  return (
    <SkyHero
      portrait={
        <div className={styles.avatar}>
          {/* The box is 68px, but sizes asks for ~3× so the browser downsamples a
              detailed source instead of stretching the nearest small step. */}
          <Image src={portrait} alt={`Portrait of ${site.name}`} sizes="204px" quality={90} placeholder="blur" preload />
        </div>
      }
    >
      <div className={styles.identity} data-reveal="load" style={stagger(1)}>
        <h1 className={styles.greeting} data-bp="name">Hey! I’m {site.shortName}</h1>
        <p className={styles.role} data-bp="tagline">
          An engineer who cares way too much about <span className={styles.pixels}>pixels</span>.
        </p>
      </div>

      <div className={styles.intro} data-reveal="load" style={stagger(2)}>
        <p data-bp="copy-1">
          I’m an AI engineer at{" "}
          <Brand mark={<span className={styles.tavant}>T</span>}>Tavant</Brand>, and I run{" "}
          <HoverReveal href={spacered.href} panel={<VentureCard venture={spacered} />} contain interactive>
            <Brand mark={<Image src={spaceredMark} alt="" className={styles.spacered} />}>{spacered.name}</Brand>
          </HoverReveal>
          , a design
          studio working with several{" "}
          <HoverReveal lead="deep-tech and fast-moving" panel={<StartupCloud />}>
            startups
            <span className="sr-only">, including {startupNames}</span>
          </HoverReveal>
          . Right now I’m also building{" "}
          <HoverReveal href={tasklearn.href} panel={<VentureCard venture={tasklearn} />} contain interactive>
            {tasklearn.name}
          </HoverReveal>{" "}
          and{" "}
          <HoverReveal href={visume.href} panel={<VentureCard venture={visume} />} contain interactive>
            {visume.name}
          </HoverReveal>
          .
        </p>
        <p data-bp="copy-2">
          I like <DitherGlyph icon="tensor">building</DitherGlyph> at the intersection of{" "}
          <DitherGlyph icon="orbit">technology</DitherGlyph> and <DitherGlyph icon="eye">art</DitherGlyph>, and I’m
          always wrapped up in some{" "}
          <HoverReveal lead="creative" panel={<SideQuestFrames />}>
            side-quest
          </HoverReveal>
          .
        </p>
      </div>
    </SkyHero>
  );
}
