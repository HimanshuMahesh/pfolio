import { FooterHeatmap } from "./FooterHeatmap";
import styles from "./Footer.module.css";

/** The page ends on a diffusion model sampling “Bazinga!” out of noise, edge to edge. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <FooterHeatmap className={styles.heatmap} />
    </footer>
  );
}
