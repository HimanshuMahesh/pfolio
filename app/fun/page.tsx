import type { Metadata } from "next";
import { site } from "@/content/site";
import { FunGallery } from "@/components/fun/FunGallery";
import { cx, place } from "@/lib/grid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `Fun — ${site.name}`,
  description: `Side quests by ${site.name}: sketches, experiments and photos.`,
};

export default function FunPage() {
  return (
    <div className={cx("wrap", "grid", styles.page)}>
      <div style={place({ d: "2 / 12" })}>
        <h1 className={styles.title} data-reveal="load">
          Things made <span className={styles.serif}>for no reason</span>
          <span className={styles.acc}>.</span>
        </h1>
        <FunGallery />
      </div>
    </div>
  );
}
