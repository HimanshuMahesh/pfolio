import { site } from "@/content/site";
import { LocalTime } from "@/components/ui/LocalTime";
import { SectionHead } from "@/components/ui/SectionHead";
import { cx } from "@/lib/grid";
import { ContactActions } from "./ContactActions";
import styles from "./Contact.module.css";

/** (03) Contact — a closing quote, then the ways to reach me. */
export function Contact() {
  return (
    <section className={cx("wrap", "section", styles.contact)} id="contact" aria-labelledby="contact-heading">
      <SectionHead
        index="03"
        label="Contact"
        aside={
          <>
            {site.location.city} · <LocalTime /> {site.location.timeZoneLabel}
          </>
        }
      />

      <div className={cx("grid", styles.grid)}>
        <figure className={styles.quote} data-reveal>
          <blockquote className={styles.quoteText} id="contact-heading">
            “The only way to do great work is to <span className={styles.glow}>love what you do</span>. If you
            haven’t found it yet, keep looking. <span className={styles.glow}>Don’t settle.</span>”
          </blockquote>
          <figcaption className={cx("t-label", "muted")}>— Steve Jobs</figcaption>
        </figure>

        <ContactActions className={styles.actions} />
      </div>
    </section>
  );
}
