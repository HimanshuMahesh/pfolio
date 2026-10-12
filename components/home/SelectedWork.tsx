import Image from "next/image";
import type { CSSProperties } from "react";
import { projects, type Project } from "@/content/projects";
import { CoverVideo } from "@/components/ui/CoverVideo";
import { Media } from "@/components/ui/Media";
import { SectionHead } from "@/components/ui/SectionHead";
import { cx } from "@/lib/grid";
import styles from "./SelectedWork.module.css";

const TAPE_TEXT = Array(8).fill("Work in progress").join("  •  ");

/** Two strips of oversized caution tape crossed over the cover. */
function WipTape() {
  return (
    <span className={styles.tape}>
      <span className="sr-only">Work in progress</span>
      <span className={cx(styles.strip, styles.stripA)} aria-hidden="true">
        {TAPE_TEXT}
      </span>
      <span className={cx(styles.strip, styles.stripB)} aria-hidden="true">
        {TAPE_TEXT}
      </span>
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const column = index % 2;
  // The first row peeks above the fold, so it rises on load just after the
  // hero rather than waiting on scroll. The right-hand card of each pair
  // rises a beat after the left.
  const firstRow = index < 2;
  const delay = { "--reveal-delay": `${(firstRow ? 270 : 0) + column * 80}ms` } as CSSProperties;
  return (
    <article data-reveal={firstRow ? "load" : ""} style={delay} id={`work-${project.slug}`} data-section={`work.${project.slug}`} data-section-title={`Selected work · ${project.name}`}>
      <a className={styles.link} href={project.href}>
        <Media
          fill={project.video ? "transparent" : project.cover}
          className={project.video ? styles.film : undefined}
          radius="var(--radius-md)"
          overlay={
            <>
              {project.wip && <WipTape />}
              <span className={styles.notch}>{project.name}</span>
            </>
          }
        >
          {project.video ? (
            <CoverVideo className={styles.video} src={project.video.src} poster={project.video.poster} />
          ) : (
            project.image && <Image src={project.image} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" />
          )}
        </Media>
        <div className={styles.caption}>
          <h3 className={styles.title}>{project.title}</h3>
          <span className={styles.meta}>{project.meta}</span>
        </div>
      </a>
    </article>
  );
}

/** (01) Selected work — a near full-bleed 2-up grid of 4:3 cards. */
export function SelectedWork() {
  const count = String(projects.length).padStart(2, "0");

  return (
    <section className={cx("wrap", "section", styles.work)} id="work" data-spy="work" data-section="work" data-section-title="Selected work" data-section-aliases="projects, portfolio, case studies, work, built, shipped" aria-labelledby="work-heading">
      <h2 id="work-heading" className="sr-only">Selected work</h2>
      <SectionHead
        index="01"
        label="Selected work"
        className={styles.head}
        aside={<>{count} projects</>}
      />

      <div className={styles.grid}>
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
