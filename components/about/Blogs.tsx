import { notes } from "@/content/notes";
import { NoteRow } from "@/components/home/Notes";
import { SectionHead } from "@/components/ui/SectionHead";
import { cx } from "@/lib/grid";
import styles from "./Blogs.module.css";

/** Every note, newest first — where the home page's "All notes" link lands. */
export function Blogs() {
  return (
    <section className={styles.blogs} id="blogs" data-section="blogs" data-section-title="Blogs" data-section-aliases="written, writing, blog, articles, notes, essays, posts" aria-labelledby="blogs-heading">
      <SectionHead id="blogs-heading" index="03" label="Blogs" aside={`${notes.length} notes`} />
      <div className={cx("grid", styles.list)}>
        {notes.map((note, i) => (
          <NoteRow key={note.slug} note={note} index={i} />
        ))}
      </div>
    </section>
  );
}
