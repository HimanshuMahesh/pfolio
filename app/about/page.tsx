import type { Metadata } from "next";
import { site } from "@/content/site";
import { experience, experiencePeriod } from "@/content/about";
import { Bento } from "@/components/about/Bento";
import { Entries } from "@/components/about/Entries";
import { Blogs } from "@/components/about/Blogs";
import { Ask } from "@/components/ask/Ask";
import { cx, place } from "@/lib/grid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `About · ${site.name}`,
  description: `About ${site.name}: AI engineer and product designer in ${site.location.city}. Experience at Tavant, Spacered and GridRnD, plus notes on building products.`,
};

export default function AboutPage() {
  return (
    <>
      <div className={cx("wrap", "grid", styles.page)}>
        <div style={place({ d: "2 / 12" })}>
          <Bento />
          <Entries id="experience-heading" index="01" title="Experience" note={experiencePeriod} entries={experience} />
          <Blogs />
        </div>
      </div>
      <Ask />
    </>
  );
}
