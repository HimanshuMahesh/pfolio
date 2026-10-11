# Media loading plan

Goal: the site stays fast as the media library grows and moves into a CMS. That means a CDN, the right formats, loading things in a sensible order, and using the Blueprint intro as a head start.

Status: **decided, not started.** Nothing below has been implemented yet.

---

## Decisions (Q&A, 2026-09-28)

| Topic | Answer |
|---|---|
| Hosting | **Vercel** |
| Media budget | **$0 only** (free tiers) |
| Videos in 6–12 months | **Under 10** |
| Video types | **Short muted loops** + **camera footage** |
| Images in 6–12 months | **Under 50** |
| CMS | **Payload** (chosen over Keystatic, see notes below) |
| Who uploads | **Only me** |
| Processing | **Local script is fine.** Run ffmpeg before uploading, no paid auto-transcoding |
| Publishing | **Rebuild is fine.** A ~1–2 min delay after publishing is OK |
| Loader | The existing **Blueprint intro** (`components/home/Blueprint.tsx`, ported from `wireframe/blueprint.js`) |
| Loader when | **First visit per session** (already how it works: `sessionStorage` key) |
| Loader where | **Home only** (already the case) |
| Loader length | **Keep as is (~2s).** Don't touch the choreography |
| Loader progress | Keep the current fixed choreography. No progress bar or counter |
| Media during intro | **Reveal on ink.** Posters + the first part of the visible cover videos load during the sheet phase, and each video starts playing as its card inks in |
| Mobile | **Same videos as desktop** |
| Save-Data / slow connection | **Show posters instead of videos** |
| Compression | **Slight softness OK** |

---

## Where things stand today (from the code)

- Next.js 16.3 app in `hmnsshu/`. Images go through `next/image` with AVIF/WebP (`next.config.ts`). Images are fine.
- Cover videos are plain `.mp4` files in `public/work/` (`tasklearn.mp4`, `visume.mp4`) with jpg posters. They're served from Vercel's own CDN, with one format only.
- `components/ui/CoverVideo.tsx:36` uses `preload="auto"`, so **every cover video starts downloading in full on page load**, including the ones below the fold.
- `components/about/Gallery.tsx:76` renders `<video autoPlay>` with **no poster** and no lazy loading.
- The Blueprint intro's timeline (`T` in `Blueprint.tsx:48`) runs ~2s. It's a fixed choreography that doesn't wait for any media. It draws `#work article:nth-of-type(1..4)` as hatched boxes and then fills in the real content (`bp-on`) one by one.
- No CMS yet. Content lives in `content/*.ts` (`projects.ts` has `video: { src, poster }`).

---

## The plan

### 1. Quick fixes (no infra, can ship first)

- `CoverVideo`: `preload="none"` by default. Load (`preload="auto"` / `load()`) once the video is near the viewport (IntersectionObserver with a `rootMargin` of about one screen), or when the intro says so (see section 2).
- `Gallery` videos: add posters, lazy-load the same way, play/pause in view (reuse `CoverVideo`).
- **Save-Data / slow connection:** if `navigator.connection?.saveData` or `effectiveType` is `2g`/`slow-2g`, render only the poster and never attach the video source. Also respect `prefers-reduced-motion` (poster only, or paused).
- Posters: serve through `next/image` (AVIF/WebP, blur placeholder) instead of a raw jpg in the `poster` attribute. The `<video>` sits on top and fades in on `playing`.
- Encode every MP4 with `-movflags +faststart` so playback can start before the whole file has downloaded.

### 2. Blueprint intro as the head start ("reveal on ink")

The intro is the loading screen. It warms the cache and then gets out of the way. It never waits for media.

- When `html.bp-run` is set (boot script in `lib/blueprint.ts`), start fetching right away, during the sheet/boxes phase:
  - posters for the work cards that are in the viewport (`<link rel="preload" as="image" fetchpriority="high">` or `new Image()`),
  - the visible cover videos with `preload="auto"` (the browser buffers the start of the file; faststart makes that useful).
- At the ink step for each work card (`b.el.classList.add("bp-on")` in `Blueprint.tsx:318`), fire an event/class that makes that card's `CoverVideo` call `play()`. If the video isn't ready yet, the poster shows and the video fades in when it is.
- **Timings are not touched.** The ~2s run stays exactly as it is. Skipping (click/scroll/key) just triggers the same play-on-ink immediately.
- After the intro (or on sessions that skip it), cover videos below the fold get fetched during idle time (`requestIdleCallback`), or just when they're near the viewport.
- The same logic makes pages without the intro (about, fun) behave well: posters first, videos when near the viewport.

### 3. Encoding (local script, `scripts/encode-media`)

A single command per source file, e.g. `npm run media -- path/to/raw.mov`:

- **Loops (muted):** strip audio (`-an`), ~1080p max width, H.264 MP4 (`crf ~26`, `faststart`), plus AV1 or VP9 WebM for browsers that support it, served as `<source>` in order `webm` then `mp4`.
- **Camera footage:** same formats. Keep the audio track only if the clip actually needs sound.
- **Poster:** extract the first frame (or a chosen timestamp) as JPG/AVIF, plus a tiny blur placeholder (base64 or blurhash).
- Output goes into a folder named after the file (or its content hash) so URLs are immutable and can be cached forever.
- "Slight softness OK" is where `crf ~26` comes from. Adjust per clip if needed.

### 4. CMS: Payload

**Why Payload over Keystatic:** you asked for it. It gives you a real admin panel, image resizing on upload, and relations between content. The cost is more moving parts than Keystatic.

Setup, all free tiers:
- **Payload 3**, installed inside the existing Next app (admin at `/admin`).
- **Database:** Postgres on **Neon** (free) via `@payloadcms/db-postgres`.
- **Uploads:** **Cloudflare R2** via Payload's S3 storage adapter (`@payloadcms/storage-s3`). 10GB free, free bandwidth. Served from a custom domain like `media.<yourdomain>` so browsers and Cloudflare cache it.
- **Images:** Payload generates image sizes on upload, and they still go through `next/image` (add the R2 domain to `images.remotePatterns`).
- **Videos:** encode locally with the script (section 3), then upload the outputs (webm, mp4, poster) into a `Media`/`Video` collection. Payload doesn't transcode video, which is fine because you chose the local script.
- **Publishing:** static rebuild. A Payload `afterChange` hook calls a Vercel deploy hook, so the site rebuilds in ~1–2 min.
- Migrate `content/projects.ts` (and about/fun gallery data) into Payload collections: `projects`, `gallery`, `media`.

**Risks to check before starting:**
- **Next.js version compatibility.** Payload releases are tied to specific Next.js versions, and this app is on Next 16.3. Confirm the current Payload version supports it before installing. If it doesn't, wait for support rather than downgrading Next.
- The admin runs as serverless functions on Vercel (cold starts in the admin, which only you will notice). The public site is static, so visitors are unaffected.
- Neon's free tier pauses when idle. That only affects the admin and builds, not visitors.

### 5. CDN summary

| What | Where | Served via |
|---|---|---|
| Site, JS, CSS | Vercel | Vercel edge |
| Images | R2 (via Payload) | `next/image` on Vercel (AVIF/WebP, resized) |
| Videos + posters | R2 | Cloudflare CDN on `media.<yourdomain>`, `Cache-Control: public, max-age=31536000, immutable` |

Everything stays at $0 at this scale (under 10 videos, under 50 images).

---

## Order of work (when we start)

1. Quick fixes (section 1). No new infra, and it's the biggest win on its own.
2. Hook the intro up to reveal on ink (section 2).
3. Encoding script (section 3). Re-encode `tasklearn.mp4` and `visume.mp4`.
4. Check that Payload supports Next 16, then set up Payload + Neon + R2 and migrate the content (section 4).
5. Rebuild on publish via deploy hook, and point media URLs at `media.<yourdomain>`.

## Open items

- Custom domain for media (`media.<yourdomain>`)? You need a domain on Cloudflare DNS for R2 to have a custom domain.
- Payload's current Next.js version support. Verify before step 4.
