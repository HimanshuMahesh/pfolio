"use client";

import { useEffect, useRef, useState } from "react";
import { Stepper } from "./Stepper";
import styles from "@/components/notes/Article.module.css";
import { TERMS, beamAt, hangerShift, needleAt, readoutOf, tiltOf, totalOf } from "./balance/geometry.mjs";

type Layers = { back: string; left: string; stand: string; hookLeft: string; hookRight: string; right: string; front: string };

/* A real balance swings and settles: the beam is a damped spring on its tilt
   (about a third of critical damping), so a change of score rocks it a few
   times before it comes to rest. */
const STIFF = 34;
const DRAG = 2 * Math.sqrt(STIFF) * 0.32;
const TOUR_MS = 2600;
const TERM_COUNT = TERMS.length;
const STOPS = ["Material", "+ King", "+ Activity", "+ Structure"];

export function BalanceLive({
  width, height, label, start, layers, beam, needle, pin, shift,
}: {
  width: number;
  height: number;
  label: string;
  start: number;
  layers: Layers;
  beam: string;
  needle: string;
  pin: [number, number];
  shift: [string, string];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const needleRef = useRef<SVGPathElement>(null);
  const pinRef = useRef<SVGCircleElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const steerRef = useRef<(n: number) => void>(() => {});
  const [shown, setShown] = useState(start);

  useEffect(() => {
    const stage = stageRef.current!;
    const svg = svgRef.current!;
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const readout = stage.closest("figure")?.querySelector<HTMLElement>("[data-readout]");
    const hangers = [...svg.querySelectorAll<SVGGElement>("[data-hang]")];

    let count = start;
    let theta = tiltOf(totalOf(start));
    let rate = 0;
    let frame = 0;
    let last = 0;
    let visible = false;
    let touring = !still.matches;
    let clock = 0;
    let idle = 0;
    let drawn = NaN;

    const show = (n: number) => {
      count = n;
      setShown(n);
      for (let t = 1; t < TERM_COUNT; t++) {
        svg.querySelector(`[data-pan="${t}"]`)?.toggleAttribute("data-off", t >= n);
        svg.querySelector(`[data-rack="${t}"]`)?.toggleAttribute("data-off", t < n);
      }
      const text = readoutOf(n);
      if (readout && readout.textContent !== text) readout.textContent = text;
      stage.setAttribute("aria-valuenow", String(n));
      stage.setAttribute("aria-valuetext", text);
    };

    const draw = () => {
      const q = Math.round(theta * 4000) / 4000;
      if (q === drawn) return;
      drawn = q;
      beamRef.current!.innerHTML = beamAt(q);
      const n = needleAt(q);
      needleRef.current!.setAttribute("d", n.d);
      pinRef.current!.setAttribute("cx", String(n.pin[0]));
      pinRef.current!.setAttribute("cy", String(n.pin[1]));
      for (const g of hangers) g.setAttribute("transform", hangerShift(Number(g.dataset.hang), q));
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      if (touring) {
        clock += dt * 1000;
        const n = 1 + (Math.floor(clock / TOUR_MS) % TERM_COUNT);
        if (n !== count) show(n);
      }
      const want = tiltOf(totalOf(count));
      if (still.matches) { theta = want; rate = 0; }
      else for (let i = 0; i < 4; i++) {
        rate += ((want - theta) * STIFF - rate * DRAG) * (dt / 4);
        theta += rate * (dt / 4);
      }
      if (Math.abs(want - theta) < 1e-4 && Math.abs(rate) < 1e-4) { theta = want; rate = 0; }
      draw();
      const settled = !touring && theta === want && rate === 0;
      frame = visible && !settled ? requestAnimationFrame(tick) : 0;
    };
    const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };

    const steer = (n: number) => {
      touring = false;
      window.clearTimeout(idle);
      idle = window.setTimeout(() => { touring = !still.matches; clock = (count - 1) * TOUR_MS; run(); }, 4000);
      if (n !== count) show(n);
      run();
    };

    steerRef.current = steer;

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" });
    io.observe(stage);

    const onMove = (e: PointerEvent) => {
      const box = svg.getBoundingClientRect();
      const share = Math.min(0.999, Math.max(0, ((e.clientX - box.left) / box.width - 0.15) / 0.7));
      steer(1 + Math.floor(share * TERM_COUNT));
    };
    const onKey = (e: KeyboardEvent) => {
      let n: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") n = Math.min(TERM_COUNT, count + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = Math.max(1, count - 1);
      if (e.key === "Home") n = 1;
      if (e.key === "End") n = TERM_COUNT;
      if (n === null) return;
      e.preventDefault();
      steer(n);
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("keydown", onKey);
    show(start);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("keydown", onKey);
    };
  }, [start]);

  return (
    <>
    <div
      ref={stageRef}
      className={`iso-stage ${styles.drawing}`}
      tabIndex={0}
      role="slider"
      aria-label="Evaluation terms counted: arrow keys add or remove a term"
      aria-valuemin={1}
      aria-valuemax={TERM_COUNT}
      aria-valuenow={start}
    >
      <svg ref={svgRef} className="iso-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <g dangerouslySetInnerHTML={{ __html: layers.back }} />
        <g data-hang="-1" transform={shift[0]} dangerouslySetInnerHTML={{ __html: layers.left }} />
        <g dangerouslySetInnerHTML={{ __html: layers.stand }} />
        <g data-hang="-1" transform={shift[0]} dangerouslySetInnerHTML={{ __html: layers.hookLeft }} />
        <g data-hang="1" transform={shift[1]} dangerouslySetInnerHTML={{ __html: layers.hookRight }} />
        <g ref={beamRef} dangerouslySetInnerHTML={{ __html: beam }} />
        <path ref={needleRef} className="iso-line" data-tone="lit" d={needle} style={{ strokeWidth: 1 }} />
        <circle ref={pinRef} className="iso-pin" cx={pin[0]} cy={pin[1]} r={0.9} />
        <g data-hang="1" transform={shift[1]} dangerouslySetInnerHTML={{ __html: layers.right }} />
        <g dangerouslySetInnerHTML={{ __html: layers.front }} />
      </svg>
    </div>
    <Stepper label="Terms" stops={STOPS} value={shown - 1} onChange={(i) => steerRef.current(i + 1)} />
    </>
  );
}
