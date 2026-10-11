import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import type { Venture } from "@/content/intro";
import { cx } from "@/lib/grid";
import styles from "./VentureCard.module.css";

/** A link-preview card: OG image, name, tagline, domain. */
export function VentureCard({ venture, className }: { venture: Venture; className?: string }) {
  return (
    <span className={cx(styles.card, className)}>
      <span className={styles.cardMedia}>
        <Image src={venture.og} alt="" sizes="300px" quality={90} placeholder="blur" />
      </span>
      <span className={styles.cardBody}>
        <span className={styles.cardTitle}>{venture.name}</span>
        <span className={styles.cardTag}>{venture.tagline}</span>
        <span className={styles.cardLink}>
          {venture.domain}
          <ArrowUpRightIcon weight="duotone" className={styles.cardArrow} />
        </span>
      </span>
    </span>
  );
}
