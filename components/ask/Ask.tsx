"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
} from "react";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { answerFor, askName, offlineNote, resting, starters } from "@/content/ask";
import { playChime } from "@/lib/chime";
import { streamAsk } from "@/lib/ask/client";
import { find, goTo, watchReader } from "@/lib/ask/navigate";
import type { AskEvent, ChatMessage, Source } from "@/lib/ask/protocol";
import { glance, HimaFace } from "./HimaFace";
import { cx } from "@/lib/grid";
import chip from "@/components/ui/Chip.module.css";
import styles from "./Ask.module.css";

type You = { id: number; role: "you"; text: string };
type Me = {
  id: number;
  role: "me";
  /** For a follow-up's history: the question this answers. */
  question: string;
  text: string;
  state: "thinking" | "writing" | "done";
  /** No more text is coming (the reveal may still be catching up). */
  final: boolean;
  /** Sections the answer drew on, as chips under it. */
  sources: Source[];
  next: string[];
  /** "rest": Hima's out of questions for now. "offline": a scripted answer. */
  kind?: "rest" | "offline";
};
type Turn = You | Me;
type Rest = { scope: "minute" | "day"; until: number };

const THREAD_KEY = "hima:thread";
/** The spotlight stays at least this long, and this long after the answer ends. */
const SPOT_MIN_MS = 3500;
const SPOT_AFTER_MS = 1400;
const REST_KEY = "hima:rest";
const noop = () => () => {};

/** Each child steps in after the panel starts to arrive. */
const step = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Docked panel (≥ 1024px): the page beside it is visible, so Hima may move it. */
const docked = () => matchMedia("(min-width: 1024px)").matches;

function read<T>(store: Storage, key: string): T | null {
  try {
    const v = store.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function write(store: Storage, key: string, value: unknown) {
  try {
    if (value === null) store.removeItem(key);
    else store.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Hima: Himanshu's little bot. A key with Hima's face at the top right of
 * the homepage and /about opens a panel for asking about him; opening it
 * plays a chime and lights a thin rainbow edge around the page. From 1024px
 * the panel docks and the page narrows to make room (styles/layout.css);
 * below that it floats over the page, as a bottom sheet on phones.
 *
 * Answers stream from /api/ask (lib/ask). When one is about something on
 * this page, Hima scrolls there and spotlights it; sections elsewhere become
 * chips. Each visitor gets a few questions a day, then Hima rests.
 * See docs/hima-ai-plan.md.
 */
export function Ask() {
  const route = usePathname();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [happy, setHappy] = useState(false);
  const [rest, setRest] = useState<Rest | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const [spot, setSpot] = useState<{ el: HTMLElement; on: boolean } | null>(null);
  const shortcut = useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );
  const key = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const ids = useRef(0);
  const inflight = useRef<AbortController | null>(null);
  const loaded = useRef(false);
  const openRef = useRef(false);
  const happyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spotAt = useRef(0);
  const busy = thread.some((t) => t.role === "me" && t.state !== "done");

  // Called from clicks and key presses, so the chime is allowed to play.
  const toggle = useCallback((next?: boolean) => {
    const to = next ?? !openRef.current;
    if (to === openRef.current) return;
    openRef.current = to;
    setOpen(to);
    if (!to) return;
    // First open in this tab: pick up the conversation and any rest from before
    if (!loaded.current) {
      loaded.current = true;
      const saved = read<Turn[]>(sessionStorage, THREAD_KEY);
      if (saved?.length) {
        ids.current = Math.max(...saved.map((t) => t.id));
        setThread(saved);
      }
      const r = read<Rest>(localStorage, REST_KEY);
      if (r && r.until > Date.now()) setRest(r);
    }
    playChime();
    // Hima is pleased to be asked
    setHappy(true);
    clearTimeout(happyTimer.current);
    happyTimer.current = setTimeout(() => setHappy(false), 1300);
  }, []);

  // The page makes room (or locks, below 1024px) while the panel is open.
  useEffect(() => {
    const html = document.documentElement;
    html.toggleAttribute("data-ask-open", open);
    return () => html.removeAttribute("data-ask-open");
  }, [open]);

  // Opening puts the caret in the field once the panel has mostly arrived (not on
  // touch, where it would throw up the keyboard). Closing hands focus back to the key.
  useEffect(() => {
    if (open) {
      if (matchMedia("(pointer: coarse)").matches) return;
      const t = setTimeout(() => field.current?.focus({ preventScroll: true }), 320);
      return () => clearTimeout(t);
    }
    if (panel.current?.contains(document.activeElement)) key.current?.focus({ preventScroll: true });
  }, [open]);

  // ⌘K / Ctrl K toggles from anywhere; Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && document.documentElement.hasAttribute("data-ask-open")) {
        toggle(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // Know when the reader is using the page, so Hima never scrolls over them.
  useEffect(() => watchReader(() => panel.current), []);

  // Stop any answer in flight when Hima leaves the page.
  useEffect(() => () => inflight.current?.abort(), []);

  // The conversation lasts for the tab (finished turns only).
  useEffect(() => {
    if (!loaded.current) return;
    const done = thread.filter((t) => t.role === "you" || t.state === "done");
    write(sessionStorage, THREAD_KEY, done.length ? done.slice(-20) : null);
  }, [thread]);

  // A short rest ends on its own.
  useEffect(() => {
    if (!rest) return;
    const t = setTimeout(() => setRest(null), Math.max(0, rest.until - Date.now()));
    return () => clearTimeout(t);
  }, [rest]);

  // Follow the newest words, unless the reader has scrolled up to reread.
  const follow = useCallback(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, []);
  useLayoutEffect(follow, [thread, follow]);

  const update = (id: number, fn: (m: Me) => Me) =>
    setThread((t) => t.map((x) => (x.id === id && x.role === "me" ? fn(x) : x)));

  /** Show a section on this page: scroll to it (if the reader isn't busy) and spotlight it. */
  const show = useCallback(async (source: Source, asked = false) => {
    const el = find(source);
    if (!el) return false;
    const moved = await goTo(el, { asked });
    if (!moved) return false;
    const r = el.getBoundingClientRect();
    glance(r.left + r.width / 2, r.top + Math.min(r.height / 2, 120));
    spotAt.current = performance.now();
    setSpot({ el, on: true });
    return true;
  }, []);

  const ask = (question: string) => {
    const text = question.trim();
    if (!text || busy || rest) return;
    const you = ++ids.current;
    const me = ++ids.current;
    stick.current = true;
    setDraft("");
    setSpot((s) => s && { ...s, on: false });
    const history: ChatMessage[] = thread
      .filter((t) => t.role === "you" || (t.state === "done" && t.kind !== "rest"))
      .slice(-6)
      .map((t) => ({ role: t.role === "you" ? "user" : "assistant", content: t.text }));
    setThread((t) => [
      ...t,
      { id: you, role: "you", text },
      { id: me, role: "me", question: text, text: "", state: "thinking", final: false, sources: [], next: [] },
    ]);

    const ctrl = new AbortController();
    inflight.current = ctrl;
    let moved = false;
    let got = false;
    // Move the page once per answer, only when the docked page is visible
    const maybeMove = (s: Source) => {
      if (moved || !docked() || !find(s)) return;
      moved = true;
      void show(s);
    };
    const scripted = () => {
      const { answer, next } = answerFor(text);
      update(me, (m) => ({ ...m, text: answer, next, kind: "offline", state: "writing", final: true }));
    };

    const onEvent = (e: AskEvent) => {
      switch (e.t) {
        case "meta":
          if (e.nav) maybeMove(e.nav);
          break;
        case "cite":
          update(me, (m) => (m.sources.some((s) => s.id === e.source.id) ? m : { ...m, sources: [...m.sources, e.source] }));
          if (e.primary) maybeMove(e.source);
          break;
        case "text":
          got = true;
          update(me, (m) => ({ ...m, text: m.text + e.v, state: "writing" }));
          break;
        case "quota":
          setLeft(e.left);
          break;
        case "done":
          update(me, (m) => ({ ...m, final: true, state: m.text ? m.state : "writing", next: answerFor(text).next }));
          break;
        case "limit": {
          const r: Rest = { scope: e.scope, until: Date.now() + e.retry * 1000 };
          setRest(r);
          if (e.scope === "day") write(localStorage, REST_KEY, r);
          update(me, (m) => ({ ...m, text: resting[e.scope], kind: "rest", state: "writing", final: true }));
          break;
        }
        case "error":
          // Keep what already arrived; with nothing yet, answer from the scripted topics
          if (got) update(me, (m) => ({ ...m, final: true }));
          else scripted();
          break;
      }
    };
    void streamAsk({ question: text, history, route }, onEvent, ctrl.signal);
  };

  const done = useCallback(
    (id: number) => {
      update(id, (m) => ({ ...m, state: "done" }));
      // The spotlight lingers after the answer (and stays up long enough to be seen), then fades
      const hold = Math.max(SPOT_AFTER_MS, SPOT_MIN_MS - (performance.now() - spotAt.current));
      setTimeout(() => setSpot((s) => s && { ...s, on: false }), hold);
    },
    [],
  );

  /** A source chip: on this page it shows the section (closing the sheet first on phones). */
  const showFromChip = (s: Source) => {
    if (docked()) return void show(s, true);
    toggle(false);
    setTimeout(() => void show(s, true), 420);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  // The field grows with what's typed, up to a few lines.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
    el.style.overflowY = el.scrollHeight > el.clientHeight ? "auto" : "hidden";
  }, [draft]);

  const last = thread[thread.length - 1];
  const thinking = last?.role === "me" && last.state === "thinking";
  const mood = happy ? "happy" : thinking ? "thinking" : "idle";

  return (
    <>
      {/* The page's edge lights up while Hima is open, brighter while busy */}
      <div className={styles.glow} data-open={open ? "" : undefined} data-busy={busy ? "" : undefined} aria-hidden="true">
        <span className={styles.halo}>
          <span className={styles.ring} />
        </span>
        <span className={styles.ring} />
      </div>

      {spot && <Spotlight el={spot.el} on={spot.on} onGone={() => setSpot(null)} />}

      <button
        ref={key}
        type="button"
        className={cx(styles.orb, styles.key)}
        data-open={open ? "" : undefined}
        aria-expanded={open}
        aria-controls="ask-panel"
        aria-label={open ? `Close ${askName}` : `Ask ${askName}`}
        onClick={() => toggle()}
      >
        <HimaFace className={styles.keyFace} mood={happy ? "happy" : "idle"} />
      </button>
      <span className={styles.tip} aria-hidden="true">
        Ask {askName} <kbd>{shortcut}</kbd>
      </span>

      <div className={styles.scrim} data-open={open ? "" : undefined} onClick={() => toggle(false)} aria-hidden="true" />

      <aside
        ref={panel}
        id="ask-panel"
        className={styles.panel}
        data-open={open ? "" : undefined}
        aria-label={askName}
        inert={!open}
      >
        <header className={cx(styles.head, styles.rise)} style={step(90)}>
          <span className={styles.title}>
            <span className={cx(styles.orb, styles.badge)}>
              <HimaFace mood={mood} />
            </span>
            {askName}
          </span>
          <span className={styles.tools}>
            <button
              type="button"
              className={styles.tool}
              aria-label="Start over"
              title="Start over"
              disabled={!thread.length || busy}
              onClick={() => {
                setThread([]);
                setSpot((s) => s && { ...s, on: false });
                field.current?.focus({ preventScroll: true });
              }}
            >
              <ArrowCounterClockwiseIcon weight="bold" />
            </button>
            <button type="button" className={styles.tool} aria-label="Close" title="Close" onClick={() => toggle(false)}>
              <XIcon weight="bold" />
            </button>
          </span>
        </header>

        <div
          ref={scroller}
          className={styles.scroll}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          }}
        >
          <div className={styles.log} role="log" aria-live="polite">
            {thread.length === 0 ? (
              <div className={styles.empty}>
                <p className={cx(styles.hello, styles.rise)} style={step(160)}>
                  Hi, I’m {askName}.
                </p>
                <p className={cx(styles.sub, styles.rise)} style={step(210)}>
                  Himanshu’s little bot. I know everything on this site, so ask me about his work, the studio, or what
                  he’s up to.
                </p>
                {!rest && <Prompts items={starters} onPick={ask} from={260} />}
              </div>
            ) : (
              thread.map((t) =>
                t.role === "you" ? (
                  <p key={t.id} className={styles.you}>
                    {t.text}
                  </p>
                ) : (
                  <div key={t.id} className={styles.me}>
                    {t.state === "thinking" ? (
                      <span className={styles.thinking}>Thinking</span>
                    ) : (
                      <Answer text={t.text} final={t.final} onTick={follow} onDone={() => done(t.id)} />
                    )}
                    {t.state === "done" && t.kind === "offline" && <p className={styles.quick}>{offlineNote}</p>}
                    {t.state === "done" && t.sources.length > 0 && (
                      <Sources items={t.sources.slice(0, 3)} route={route} onShow={showFromChip} />
                    )}
                    {t === last && t.state === "done" && !rest && t.next.length > 0 && (
                      <Prompts items={t.next} onPick={ask} from={60} small />
                    )}
                  </div>
                ),
              )
            )}
          </div>
        </div>

        <form className={cx(styles.composer, styles.rise)} style={step(200)} onSubmit={submit}>
          <div className={styles.field} data-resting={rest ? "" : undefined}>
            <textarea
              ref={field}
              rows={1}
              value={draft}
              placeholder={rest ? resting.placeholder[rest.scope] : "Ask anything about Himanshu…"}
              aria-label={`Ask ${askName} a question`}
              enterKeyHint="send"
              maxLength={400}
              disabled={!!rest}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
              }}
            />
            <button
              type="submit"
              className={cx(chip.chip, chip.interactive, chip.square, styles.send)}
              disabled={!draft.trim() || busy || !!rest}
              aria-label="Send"
            >
              <ArrowUpIcon weight="bold" />
            </button>
          </div>
          <p className={styles.note}>
            {left !== null && left <= 3 ? (
              <span className={styles.left}>{resting.left(left)}</span>
            ) : (
              <>{askName} only knows what’s on this site.</>
            )}
            <span className={styles.esc}>
              {" "}
              <kbd>Esc</kbd> to close
            </span>
          </p>
        </form>
      </aside>
    </>
  );
}

/** Suggested questions, each on its own ↳ line. */
function Prompts({ items, onPick, from, small }: { items: string[]; onPick: (q: string) => void; from: number; small?: boolean }) {
  return (
    <ul className={cx(styles.prompts, small && styles.promptsSmall)}>
      {items.map((q, i) => (
        <li key={q} className={styles.rise} style={step(from + i * 55)}>
          <button type="button" className={styles.prompt} onClick={() => onPick(q)}>
            <span className={styles.arrow} aria-hidden="true">
              ↳
            </span>
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Where the answer came from: on this page a chip shows the section, elsewhere it links there. */
function Sources({ items, route, onShow }: { items: Source[]; route: string; onShow: (s: Source) => void }) {
  const label = (s: Source) => (s.page === "Home" || s.title.startsWith(s.page) ? s.title : `${s.page} · ${s.title}`);
  return (
    <ul className={styles.sources} aria-label="Sources">
      {items.map((s, i) => (
        <li key={s.id} className={styles.rise} style={step(i * 60)}>
          {s.route === route ? (
            <button type="button" className={styles.source} onClick={() => onShow(s)}>
              {label(s)}
              <span className={styles.sourceArrow} aria-hidden="true">
                ↓
              </span>
            </button>
          ) : (
            <Link className={styles.source} href={s.anchor ? `${s.route}#${s.anchor}` : s.route}>
              {label(s)}
              <span className={styles.sourceArrow} aria-hidden="true">
                ↗
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * A thin rainbow outline drawn around the section Hima is showing. It
 * follows the section while the page moves, and an About row opens under it
 * as if hovered.
 */
function Spotlight({ el, on, onGone }: { el: HTMLElement; on: boolean; onGone: () => void }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = el.tagName === "LI";
    if (row && on) el.setAttribute("data-open", "");
    let raf = 0;
    const frame = () => {
      const r = el.getBoundingClientRect();
      const b = box.current;
      if (b) {
        b.style.transform = `translate(${r.left - 10}px, ${r.top - 10}px)`;
        b.style.width = `${r.width + 20}px`;
        b.style.height = `${r.height + 20}px`;
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    const gone = on ? undefined : setTimeout(onGone, 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(gone);
      if (row) el.removeAttribute("data-open");
    };
  }, [el, on, onGone]);

  return (
    <div ref={box} className={styles.spot} data-on={on ? "" : undefined} aria-hidden="true">
      <span className={styles.ring} />
    </div>
  );
}

type Token = { word: string; href?: string };

/** Paragraphs of words, with [label](href) links kept on their words. */
function tokenize(text: string): Token[][] {
  return text.split(/\n{2,}/).map((para) => {
    const out: Token[] = [];
    const re = /\[([^\]]+)\]\(([^)]+)\)/g;
    let at = 0;
    const plain = (s: string, href?: string) => s.split(/(?<=\s)/).forEach((word) => word && out.push({ word, href }));
    for (let m = re.exec(para); m; m = re.exec(para)) {
      plain(para.slice(at, m.index));
      plain(m[1], m[2]);
      at = m.index + m[0].length;
    }
    plain(para.slice(at));
    return out;
  });
}

/** Only links Hima's own copy uses: site paths, mail, and https. */
const safeHref = (h: string) => /^(\/(?!\/)|mailto:|https:\/\/)/.test(h);

/**
 * An answer written out a few words at a time as it streams in. The model
 * writes faster than anyone reads, so words are paced; each inks in as it
 * appears. With reduced motion the text appears as it arrives.
 */
function Answer({ text, final, onTick, onDone }: { text: string; final: boolean; onTick: () => void; onDone: () => void }) {
  // Each paragraph with the index of its first word.
  const paras = useMemo(() => {
    const lists = tokenize(text);
    const starts = lists.map((_, i) => lists.slice(0, i).reduce((n, w) => n + w.length, 0));
    return lists.map((words, i) => ({ words, start: starts[i] }));
  }, [text]);
  const all = paras.reduce((n, p) => n + p.words.length, 0);
  // While streaming, the last word may still be half-written; hold it back
  const total = final ? all : Math.max(0, all - 1);
  // Mounted only after a question, so matchMedia is always there.
  const [calm] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [shown, setShown] = useState(0);
  const visible = calm ? total : shown;

  useEffect(() => {
    if (!calm && shown < total) {
      const t = setTimeout(() => setShown((s) => Math.min(total, s + 1 + Math.floor(Math.random() * 3))), 26 + Math.random() * 34);
      return () => clearTimeout(t);
    }
    if (final && visible >= total) onDone();
    // onDone is stable per answer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, total, final, calm]);

  useLayoutEffect(onTick, [visible, onTick]);

  return (
    <div className={styles.answer}>
      {paras.map(({ words: para, start }, pi) => {
        if (start >= visible) return null;
        const words = para.slice(0, visible - start);
        // Consecutive words with the same link share one anchor.
        const groups: Array<{ href?: string; words: Array<Token & { i: number }> }> = [];
        words.forEach((w, i) => {
          const g = groups[groups.length - 1];
          if (g && g.href === w.href) g.words.push({ ...w, i });
          else groups.push({ href: w.href, words: [{ ...w, i }] });
        });
        return (
          <p key={pi}>
            {groups.map((g) => {
              const inner = g.words.map((w) => (
                <span key={w.i} className={styles.word}>
                  {w.word}
                </span>
              ));
              const k = g.words[0].i;
              if (!g.href || !safeHref(g.href)) return <Fragment key={k}>{inner}</Fragment>;
              return g.href.startsWith("/") ? (
                <Link key={k} href={g.href} className={styles.link}>
                  {inner}
                </Link>
              ) : (
                <a key={k} href={g.href} className={styles.link} {...(g.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}>
                  {inner}
                </a>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
