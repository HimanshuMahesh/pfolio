import { SectionHead } from "@/components/ui/SectionHead";
import { Shelf } from "@/components/ui/Shelf";
import { WISHLIST_FIGURES } from "./wishlist-figures";
import styles from "./Wishlist.module.css";

type Figure = (typeof WISHLIST_FIGURES)[number];

/** A margin note per object, scrawled like the ones on the home page's desk. */
const NOTES: Record<Figure["name"], string> = {
  gauntlet: "one snap, half my bugs gone. perfectly balanced",
  batarang: "technically a letter opener. technically",
  ring: "runs on willpower. mine's at 12%",
  omnitrix: "would time out mid-demo, like everything else",
  portal: "one portal by the bed, one at my desk. commute solved",
  door: "first stop tokyo. second stop, also tokyo",
  masterball: "saving it for something worthy. it's been 15 years",
};

/**
 * Things I'd like to own one day, on display plinths like the home page's
 * everyday carry: isometric drawings built by scripts/wishlist/build.mjs,
 * drifting past as a marquee.
 */
export function Wishlist() {
  return (
    <section
      className={styles.wishlist}
      id="wishlist"
      data-section="wishlist"
      data-section-title="Wishlist"
      data-section-aliases="wishlist, want, collectibles, props, superhero, gadgets, infinity gauntlet, batarang, green lantern, omnitrix, portal gun, anywhere door, master ball"
      aria-labelledby="wishlist-heading"
    >
      <SectionHead id="wishlist-heading" index="02" label="Wishlist" aside="Someday, maybe" />
      <Shelf figures={WISHLIST_FIGURES} dir="/wishlist" notes={NOTES} />
    </section>
  );
}
