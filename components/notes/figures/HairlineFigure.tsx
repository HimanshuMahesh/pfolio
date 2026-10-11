"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/notes/Article.module.css";
import { Stepper } from "./Stepper";

/* Mounts a Hairline figure (public/hairline/<name>.js) on the kernel
   (public/hairline/kernel.js). Both files are the package's, unchanged: the
   kernel defines a global HL, and each figure ends with hairline({ ... }).
   Figures are module scripts, so each runs once per page load; the figure it
   registers is kept and mounted again on later visits. */

type Handle = { set: (value: number) => void; destroy: () => void };
type Figure = {
  name: string;
  means: string;
  range: [number, number, number];
  tour: Array<[number, number] | null> | null;
  mount: (host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string } }, value: number) => Handle;
};
type Kernel = {
  inject: (root: Document) => void;
  mk: (tag: string, attrs: Record<string, string>, parent: Element) => SVGSVGElement;
  tour: (stage: HTMLElement, stops: Array<[number, number] | null>, onStop?: (i: number) => void) => { stop: () => void };
  LAP: Array<[number, number] | null>;
};
type HairlineWindow = Window & {
  HL?: Kernel;
  hairline?: (figure: Figure) => void;
  __hairline?: Record<string, Figure>;
  __hairlineWaiting?: Record<string, (figure: Figure) => void>;
};

const loaded = new Map<string, Promise<void>>();
function load(src: string, module = false) {
  let p = loaded.get(src);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      if (module) s.type = "module";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`hairline: could not load ${src}`));
      document.head.appendChild(s);
    });
    loaded.set(src, p);
  }
  return p;
}

async function figureOf(name: string): Promise<Figure> {
  const w = window as HairlineWindow;
  await load("/hairline/kernel.js");
  w.__hairline ??= {};
  w.__hairlineWaiting ??= {};
  w.hairline ??= (figure) => {
    w.__hairline![figure.name] = figure;
    w.__hairlineWaiting![figure.name]?.(figure);
  };
  const known = w.__hairline[name];
  if (known) return known;
  return new Promise<Figure>((resolve, reject) => {
    w.__hairlineWaiting![name] = resolve;
    load(`/hairline/${name}.js`, true).catch(reject);
  });
}

/** The slider's 0–1 position onto the figure's own number: two lines meeting at 0.5, as the package does. */
function valueAt([lo, mid, hi]: [number, number, number], i: number) {
  return i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid);
}

export function HairlineFigure({
  name, fig, title, hint, slider, stops, start, caption, label,
}: {
  name: string;
  fig: string;
  title: string;
  hint: string;
  /** What the slider means, e.g. "Reach". */
  slider: string;
  /** The slider's stops: a name, and where it sits on the figure's range (0 to 1). */
  stops: { name: string; at: number }[];
  start: number;
  caption: string;
  label: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const handle = useRef<Handle | null>(null);
  const figure = useRef<Figure | null>(null);
  const [read, setRead] = useState("rest");
  const [step, setStep] = useState(start);
  const startAt = useRef(stops[start].at);

  useEffect(() => {
    const stage = stageRef.current!;
    let cancelled = false;
    let playing: { stop: () => void } | null = null;
    let io: IntersectionObserver | null = null;

    figureOf(name).then((f) => {
      if (cancelled) return;
      const HL = (window as HairlineWindow).HL!;
      figure.current = f;
      HL.inject(document);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      const readout = {
        get textContent() { return ""; },
        set textContent(v: string) { setRead(String(v ?? "")); },
      };
      handle.current = f.mount({ stage, svg, read: readout }, valueAt(f.range, startAt.current));

      // Readers who can't hover still see it answer: the figure's own tour plays while it is on screen.
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !playing) playing = HL.tour(stage, f.tour ?? HL.LAP);
          if (!e.isIntersecting && playing) { playing.stop(); playing = null; }
        }, { threshold: 0.4 });
        io.observe(stage);
      }
    }).catch(() => setRead("offline"));

    return () => {
      cancelled = true;
      io?.disconnect();
      playing?.stop();
      handle.current?.destroy();
      handle.current = null;
      stage.replaceChildren();
    };
  }, [name]);

  return (
    <figure className={styles.figure}>
      <div className={styles.plate}>
        <div className={styles.plateHead} aria-hidden="true">
          <span>{fig}</span>
          <span>{title}</span>
        </div>
        <div ref={stageRef} className={styles.drawing} data-hairline={name} role="img" aria-label={label} />
        <Stepper
          label={slider}
          stops={stops.map((s) => s.name)}
          value={step}
          onChange={(i) => {
            setStep(i);
            if (figure.current) handle.current?.set(valueAt(figure.current.range, stops[i].at));
          }}
        />
        <div className={styles.plateFoot} aria-hidden="true">
          <span>{hint}</span>
          <span className={styles.readout}>{read}</span>
        </div>
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
