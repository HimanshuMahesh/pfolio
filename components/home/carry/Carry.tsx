import { cx } from "@/lib/grid";
import { Shelf } from "@/components/ui/Shelf";
import { CARRY_FIGURES } from "./figures";
import styles from "./Carry.module.css";

type Figure = (typeof CARRY_FIGURES)[number];

/** A margin note per object, in the voice of a desk scrawl. */
const NOTES: Record<Figure["name"], string> = {
  camera: "weekend street walks. most shots never leave the card",
  iphone: "three lenses, still shoots everything on 1×",
  iems: "the off switch for an open office",
  switch: "pokémon, mostly. still chasing a shiny, 400 resets in",
  watch: "set two minutes fast. fools no one",
};

/**
 * Between Work and Notes: the things on the desk (camera, phone, IEMs,
 * console, watch), isometric drawings built by scripts/carry/build.mjs, drifting
 * past as a marquee.
 */
export function Carry() {
  return (
    <section
      className={cx("wrap", styles.strip)}
      id="carry"
      data-section="carry"
      data-section-title="Everyday carry"
      aria-label="Everyday carry: a camera, a phone's triple camera, in-ear monitors, a handheld console and a watch"
    >
      <Shelf figures={CARRY_FIGURES} dir="/carry" notes={NOTES} />
    </section>
  );
}
