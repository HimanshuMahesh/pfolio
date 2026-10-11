import styles from "./CropMarks.module.css";

/**
 * "+" registration marks on the four corners of the parent (which must be
 * positioned). They light up and spread slightly when the parent is hovered.
 */
export function CropMarks() {
  return (
    <>
      <i className={`${styles.mark} ${styles.tl}`} aria-hidden="true" />
      <i className={`${styles.mark} ${styles.tr}`} aria-hidden="true" />
      <i className={`${styles.mark} ${styles.bl}`} aria-hidden="true" />
      <i className={`${styles.mark} ${styles.br}`} aria-hidden="true" />
    </>
  );
}
