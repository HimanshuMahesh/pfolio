"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { XLogoIcon } from "@phosphor-icons/react/dist/csr/XLogo";
import Image from "next/image";
import { useState } from "react";
import { site } from "@/content/site";
import { gallery, galleryFilters, xHandle, type GalleryItem, type GalleryKind } from "@/content/about";
import { Media } from "@/components/ui/Media";
import { SectionHead } from "@/components/ui/SectionHead";
import styles from "./Gallery.module.css";

const SIZES = "(min-width: 1300px) 25vw, (min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw";

/** Post text with one phrase set in the accent colour. */
function PostText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, after] = text.split(highlight);
  return (
    <>
      {before}
      <span className={styles.highlight}>{highlight}</span>
      {after}
    </>
  );
}

function Post({ item }: { item: Extract<GalleryItem, { kind: "post" }> }) {
  return (
    <a className={styles.post} href={item.href} target="_blank" rel="noopener noreferrer">
      <div className={styles.postHead}>
        <span className={styles.avatar} aria-hidden="true" />
        <span className={styles.who}>
          <b>{site.name}</b>
          <span>{xHandle}</span>
        </span>
        <XLogoIcon className={styles.xLogo} aria-label="X" />
      </div>
      <p className={styles.postText}>
        <PostText text={item.text} highlight={item.highlight} />
      </p>
      {item.media && (
        <Media ratio="16 / 10" fill={item.media.fill} radius="10px" className={styles.postMedia}>
          {item.media.image && <Image src={item.media.image} alt="" fill sizes={SIZES} />}
        </Media>
      )}
      <div className={styles.postFoot}>
        <span>
          View on X <ArrowUpRightIcon className={styles.arrow} />
        </span>
        <span>Placeholder post</span>
      </div>
    </a>
  );
}

function Frame({ item }: { item: Extract<GalleryItem, { kind: "photo" | "video" }> }) {
  return (
    <figure>
      <Media
        ratio={item.ratio}
        fill={item.fill}
        radius="10px"
        overlay={
          item.kind === "video" &&
          item.length && (
            <span className={styles.badge}>
              <PlayIcon weight="fill" />
              {item.length}
            </span>
          )
        }
      >
        {item.image && <Image src={item.image} alt={item.title} fill sizes={SIZES} />}
        {item.video && <video className={styles.video} src={item.video} autoPlay muted loop playsInline />}
      </Media>
      <figcaption className={styles.caption}>
        <span>{item.title}</span>
        <span>{item.tag}</span>
      </figcaption>
    </figure>
  );
}

/** Posts, art, photos and clips in a masonry, filterable by kind. */
export function Gallery() {
  const [filter, setFilter] = useState<GalleryKind | "all">("all");

  return (
    <section className={styles.gallery} aria-labelledby="gallery-heading">
      <SectionHead id="gallery-heading" index="03" label="Gallery" aside="Posts, photos & clips" />

      <div className={styles.filters} role="group" aria-label="Filter gallery">
        {galleryFilters.map((f) => (
          <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {gallery.map((item, i) => (
          <div key={i} className={styles.item} hidden={filter !== "all" && filter !== item.kind} data-reveal>
            {item.kind === "post" ? <Post item={item} /> : <Frame item={item} />}
          </div>
        ))}
      </div>
    </section>
  );
}
