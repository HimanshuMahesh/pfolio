import Link from "next/link";
import styles from "./not-found.module.css";

/* Also what Fun resolves to until that page is built. */
export default function NotFound() {
  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="nf-heading">
      <div className={styles.column}>
        <p className="t-label muted">(404) Not here yet</p>
        <h1 className={`t-display ${styles.heading}`} id="nf-heading">
          This page is still being drawn.
        </h1>
        <p className={styles.copy}>It’s on the grid, just not built. The homepage has everything that’s ready.</p>
        <Link className={styles.back} href="/">
          <span className="arr">←</span> Back home
        </Link>
      </div>
    </section>
  );
}
