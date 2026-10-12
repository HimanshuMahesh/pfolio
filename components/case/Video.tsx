import type { ReactNode } from "react";
import { YoutubeLogoIcon } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
import s from "./Case.module.css";

/**
 * A YouTube video as a card: the embed on the left half, the words on the
 * right. Stacks on phones. The player (privacy-enhanced domain) loads lazily.
 */
export function Video({ id, title, caption, note }: {
  id: string;
  title: string;
  caption: ReactNode;
  /** A small aside under the caption. */
  note?: ReactNode;
}) {
  return (
    <figure className={s.video} data-reveal>
      <div className={s.videoFrame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={title}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <figcaption className={s.videoText}>
        <p>{caption}</p>
        {note && <p className={s.videoNote}>{note}</p>}
        <a className={s.videoLink} href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
          <YoutubeLogoIcon weight="duotone" aria-hidden="true" />
          Watch on YouTube
        </a>
      </figcaption>
    </figure>
  );
}
