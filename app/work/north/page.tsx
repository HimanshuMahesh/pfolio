import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr/ArrowUp";
import { BrowserIcon } from "@phosphor-icons/react/dist/ssr/Browser";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { CalendarXIcon } from "@phosphor-icons/react/dist/ssr/CalendarX";
import { CardsIcon } from "@phosphor-icons/react/dist/ssr/Cards";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr/ChatCircleText";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/ssr/CheckSquare";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DiamondIcon } from "@phosphor-icons/react/dist/ssr/Diamond";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/ssr/FlowArrow";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PaletteIcon } from "@phosphor-icons/react/dist/ssr/Palette";
import { CloudSlashIcon } from "@phosphor-icons/react/dist/ssr/CloudSlash";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { DropIcon } from "@phosphor-icons/react/dist/ssr/Drop";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FileCsvIcon } from "@phosphor-icons/react/dist/ssr/FileCsv";
import { FireIcon } from "@phosphor-icons/react/dist/ssr/Fire";
import { FlaskIcon } from "@phosphor-icons/react/dist/ssr/Flask";
import { GaugeIcon } from "@phosphor-icons/react/dist/ssr/Gauge";
import { HourglassMediumIcon } from "@phosphor-icons/react/dist/ssr/HourglassMedium";
import { LightbulbIcon } from "@phosphor-icons/react/dist/ssr/Lightbulb";
import { LockOpenIcon } from "@phosphor-icons/react/dist/ssr/LockOpen";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ReceiptIcon } from "@phosphor-icons/react/dist/ssr/Receipt";
import { RepeatIcon } from "@phosphor-icons/react/dist/ssr/Repeat";
import { RocketLaunchIcon } from "@phosphor-icons/react/dist/ssr/RocketLaunch";
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { SwapIcon } from "@phosphor-icons/react/dist/ssr/Swap";
import { TableIcon } from "@phosphor-icons/react/dist/ssr/Table";
import { TargetIcon } from "@phosphor-icons/react/dist/ssr/Target";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/ssr/TreeStructure";
import { TrendDownIcon } from "@phosphor-icons/react/dist/ssr/TrendDown";
import { UserFocusIcon } from "@phosphor-icons/react/dist/ssr/UserFocus";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr/UsersThree";
import { WrenchIcon } from "@phosphor-icons/react/dist/ssr/Wrench";
import { site } from "@/content/site";
import { CoverVideo } from "@/components/ui/CoverVideo";
import { SectionHead } from "@/components/ui/SectionHead";
import { CaseRail, type RailItem } from "@/components/case/CaseRail";
import {
  DoubleDiamond, ImpactEffort, MemoryLayers, SystemMap, UserFlow,
} from "@/components/case/north/Figures";
import { cx, place } from "@/lib/grid";
import s from "@/components/case/Case.module.css";

export const metadata: Metadata = {
  title: `North · ${site.name}`,
  description:
    "Case study: North, a personal finance assistant you talk to. Product design and AI engineering by Himanshu K Mahesh.",
};

const sections: RailItem[] = [
  { id: "overview", label: "Overview", icon: <CompassIcon weight="duotone" /> },
  { id: "users", label: "Who it's for", icon: <UsersThreeIcon weight="duotone" /> },
  { id: "process", label: "Process", icon: <DiamondIcon weight="duotone" /> },
  { id: "principles", label: "Principles", icon: <ListChecksIcon weight="duotone" /> },
  { id: "flow", label: "Flow", icon: <FlowArrowIcon weight="duotone" /> },
  { id: "import", label: "Import", icon: <FileCsvIcon weight="duotone" /> },
  { id: "dashboard", label: "Dashboard", icon: <SquaresFourIcon weight="duotone" /> },
  { id: "chat", label: "Chat", icon: <ChatCircleTextIcon weight="duotone" /> },
  { id: "subscriptions", label: "Subscriptions", icon: <RepeatIcon weight="duotone" /> },
  { id: "visual", label: "Visual language", icon: <PaletteIcon weight="duotone" /> },
  { id: "engineering", label: "Under the hood", icon: <CpuIcon weight="duotone" /> },
  { id: "next", label: "What's next", icon: <RocketLaunchIcon weight="duotone" /> },
];

type Icon = ComponentType<IconProps>;
type Point = { icon: Icon; title: string; text: ReactNode; num?: string };

/** A section: the site's "(01) Label" row, a headline, then whatever follows. */
function Section({ id, n, label, aside, title, children }: {
  id: string; n: string; label: string; aside?: ReactNode; title: ReactNode; children?: ReactNode;
}) {
  return (
    <section id={id} data-section={id} data-section-title={label} className={s.section} aria-labelledby={`${id}-h`}>
      <SectionHead index={n} label={label} aside={aside} />
      <h2 id={`${id}-h`} className={s.h2} data-reveal>{title}</h2>
      {children}
    </section>
  );
}

function Points({ items, cols = 2 }: { items: Point[]; cols?: 2 | 4 }) {
  return (
    <ul className={cx(s.list, cols === 4 ? s.cols4 : s.cols2)}>
      {items.map(({ icon: I, title, text, num }) => (
        <li key={title} className={s.item} data-reveal>
          <I className={s.icon} weight="duotone" aria-hidden="true" />
          {num && <span className={cx("t-label", s.itemNum)}>{num}</span>}
          <strong className={s.itemTitle}>{title}</strong>
          <p className={s.itemText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}

function Shot({ src, alt, caption, sizes = "(min-width: 1200px) 70vw, 100vw" }: {
  src: string; alt: string; caption: ReactNode; sizes?: string;
}) {
  return (
    <figure className={s.shot} data-reveal>
      <div className={s.frame}>
        <Image src={src} alt={alt} width={2880} height={1800} sizes={sizes} />
      </div>
      <figcaption className={s.caption}>{caption}</figcaption>
    </figure>
  );
}

function Fig({ n, caption, children }: { n: string; caption: string; children: ReactNode }) {
  return (
    <figure className={cx(s.shot, s.fig)} data-reveal>
      <div className={s.frame}>{children}</div>
      <figcaption className={s.caption}>Fig. {n}. {caption}</figcaption>
    </figure>
  );
}

const palette = [
  { hex: "#08090a", name: "Canvas" },
  { hex: "#0f1011", name: "Nav" },
  { hex: "#161718", name: "Card" },
  { hex: "#1d1f23", name: "Lifted" },
  { hex: "#23252a", name: "Hairline" },
  { hex: "#f7f8f8", name: "Text" },
  { hex: "#6cca6b", name: "North green" },
  { hex: "#f59e0b", name: "Leak orange" },
];

export default function NorthCaseStudy() {
  return (
    <div className={cx("wrap", "grid", s.page)}>
      <CaseRail items={sections} />

      <article style={place({ m: "1 / -1", d: "3 / 12" })}>
        {/* ---- intro --------------------------------------------------------- */}
        <header data-reveal="load">
          <p className={cx("t-label", s.label)}>
            <span className="idx">(Case study)</span>Fintech · 2026
          </p>
          <h1 className={cx("t-display", s.title)}>North</h1>
          <p className={s.lede}>
            A personal finance assistant you talk to. Drop in a bank statement and ask it anything: where the money
            went, what you&rsquo;re paying for without noticing, and what happens if you change something.
          </p>
          <dl className={s.meta}>
            <div>
              <dt className="t-label"><UserFocusIcon weight="duotone" aria-hidden="true" />Role</dt>
              <dd>Solo. Product design, AI engineering, frontend</dd>
            </div>
            <div>
              <dt className="t-label"><CalendarBlankIcon weight="duotone" aria-hidden="true" />Timeline</dt>
              <dd>June 2026, about four weeks</dd>
            </div>
            <div>
              <dt className="t-label"><BrowserIcon weight="duotone" aria-hidden="true" />Platform</dt>
              <dd>Web app, runs locally</dd>
            </div>
            <div>
              <dt className="t-label"><StackIcon weight="duotone" aria-hidden="true" />Stack</dt>
              <dd>LangGraph, FastAPI, Groq, Postgres + pgvector, React 19</dd>
            </div>
          </dl>
        </header>
        <div className={s.cover} data-reveal="load" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
          <CoverVideo src="/work/north.mp4" poster="/work/north-poster.jpg" />
        </div>

        {/* ---- 01 overview --------------------------------------------------- */}
        <Section id="overview" n="01" label="Overview" title="Money apps tell you what already happened. I wanted one that helps with what happens next.">
          <div className={s.prose}>
            <p>
              The finance apps I looked at, YNAB, Mint and Copilot among them, are good at showing the past: a pie
              chart, a list of categories, a number in red. Ask one of them &ldquo;can I do a Goa trip in December
              without touching rent money?&rdquo; and you get the same pie chart back.
            </p>
            <p>
              North is my go at the other half. You import a statement once, then talk to it. Behind the chat is a
              small team of agents: one works out what you&rsquo;re asking, one does the maths, one plays out
              what-ifs, one hunts forgotten subscriptions, and one writes the answer in plain words.
            </p>
            <p>
              I designed and built all of it, so this page covers both jobs: what North should feel like to use,
              and what had to be true underneath for that feeling to hold up.
            </p>
          </div>
          <div className={s.stats}>
            <div data-reveal>
              <span className={s.stat}>5</span>
              <span className={s.statLabel}>screens, and one of them is a conversation</span>
            </div>
            <div data-reveal>
              <span className={s.stat}>4</span>
              <span className={s.statLabel}>specialist agents behind one chat box</span>
            </div>
            <div data-reveal>
              <span className={s.stat}>0</span>
              <span className={s.statLabel}>model calls to work out your spending personality</span>
            </div>
          </div>
        </Section>

        {/* ---- 02 users ------------------------------------------------------ */}
        <Section id="users" n="02" label="Who it's for" title="People who know money matters but don't have time to manage it.">
          <div className={s.prose}>
            <p>
              I designed for someone aged 22 to 35, salaried or freelance, with one or two bank accounts and at
              least one subscription they&rsquo;ve forgotten about. They pay for almost everything over UPI, so the
              data already exists. It sits in a CSV nobody opens.
            </p>
          </div>
          <Points
            items={[
              { icon: FireIcon, title: "Doesn't know the real burn", text: "They know their salary. They don’t know what a normal month actually costs." },
              { icon: CalendarXIcon, title: "Can't plan ahead", text: "“Can I afford this in three months?” gets answered with a guess." },
              { icon: DropIcon, title: "Quiet leaks", text: "Subscriptions they stopped using still charge them every month." },
              { icon: UsersThreeIcon, title: "Generic advice", text: "Tips written for an average person, not for how this person spends." },
            ]}
            cols={4}
          />
          <div className={s.job} data-reveal>
            <p className={cx("t-label", s.label)}>Job to be done</p>
            <p className={s.jobText}>
              When money comes in, I want to know what I can safely spend and what I&rsquo;m quietly wasting, so I can
              stop guessing.
            </p>
          </div>
        </Section>

        {/* ---- 03 process ---------------------------------------------------- */}
        <Section id="process" n="03" label="Process" aside="Double Diamond" title="Two diamonds, and I had to go through the second one twice.">
          <div className={s.prose}>
            <p>
              The Double Diamond keeps a designer honest: go wide before deciding what the problem is, then go wide
              again before deciding on the answer. North followed it closely, with one catch. My first lap through
              Develop and Deliver produced something that worked and wasn&rsquo;t good, so I wrote a blunt review of
              it and went round again.
            </p>
          </div>
          <Fig n="01" caption="The Double Diamond, as North went through it.">
            <DoubleDiamond />
          </Fig>
          <Points
            items={[
              { icon: MagnifyingGlassIcon, num: "Discover", title: "Collect the real questions", text: "I listed the questions people actually ask about money. Almost none were about the past. They were “can I”, “should I” and “what if”." },
              { icon: TargetIcon, num: "Define", title: "A conversation, not a dashboard", text: "The dashboard would exist, but as a place to land. The product would be the answers." },
              { icon: WrenchIcon, num: "Develop", title: "v1 worked, and felt robotic", text: "Replies read like bank statements. One big model did everything, slowly." },
              { icon: RocketLaunchIcon, num: "Deliver", title: "v2 got a voice and a spine", text: "A warmer voice, visible reasoning, answers as ranges, and a rebuilt engine underneath." },
            ]}
            cols={4}
          />
        </Section>

        {/* ---- 04 principles ------------------------------------------------- */}
        <Section id="principles" n="04" label="Principles" title="Four rules I checked every screen against.">
          <Points
            items={[
              { icon: ChatCircleTextIcon, num: "01", title: "Talk first, chart second", text: "Charts answer questions nobody asked. North leads with a sentence, and a chart only turns up when it helps that sentence land." },
              { icon: EyeIcon, num: "02", title: "Show the work", text: "An AI that’s quietly thinking looks broken. North shows each step as it happens, so waiting feels like watching someone work." },
              { icon: ChartLineUpIcon, num: "03", title: "Ranges, not promises", text: "Anything about the future comes as a range. People don’t behave like averages, and pretending they do breaks trust the first time it’s wrong." },
              { icon: ShieldCheckIcon, num: "04", title: "Nothing changes without a yes", text: "North can suggest a goal or a challenge. It can’t create one until you tap confirm. It’s your money." },
            ]}
          />
        </Section>

        {/* ---- 05 flow ------------------------------------------------------- */}
        <Section id="flow" n="05" label="Flow" title="One setup step, then everything is a conversation.">
          <div className={s.prose}>
            <p>
              The information architecture is small on purpose. The sidebar has four places: Import, Transactions,
              Dashboard and Subscriptions. Past chats sit under them, grouped into Today, Yesterday and Previous 7
              Days, a pattern people already know from ChatGPT. The main path is three steps: import, see yourself,
              ask.
            </p>
          </div>
          <Fig n="02" caption="The main path, and what a chat turn can hand back.">
            <UserFlow />
          </Fig>
        </Section>

        {/* ---- 06 import ----------------------------------------------------- */}
        <Section id="import" n="06" label="Import" title="Making a CSV upload feel less like paperwork.">
          <div className={s.prose}>
            <p>
              Uploading a bank statement is the moment most people would give up, so this screen asks for very
              little and explains everything it does.
            </p>
          </div>
          <Points
            items={[
              { icon: FileCsvIcon, title: "Say what's needed up front", text: "The drop zone names the three columns it needs: date, amount and merchant. No surprises after the upload." },
              { icon: TableIcon, title: "Preview before saving", text: "You see the rows and the columns North found before anything is written." },
              { icon: SwapIcon, title: "Add or replace, asked once", text: "If data already exists, North asks whether the new file adds to it or replaces it. Uploading March twice should never count March twice." },
              { icon: HourglassMediumIcon, title: "Make the wait legible", text: "Processing takes a few seconds, so five steps tick off one by one: parsing, categorising, spotting anomalies, flagging recurring charges, saving." },
            ]}
          />
          <Shot
            src="/work/north/upload.jpg"
            alt="North's import screen: a greeting from the North mascot, a note that 96 transactions are already imported, a CSV drop zone, and three tiles for categorisation, anomaly detection and subscription scan."
            caption="Import, with 96 transactions already loaded. The banner says so before you drop another file, and starting fresh is a separate, deliberate action."
          />
        </Section>

        {/* ---- 07 dashboard -------------------------------------------------- */}
        <Section id="dashboard" n="07" label="Dashboard" title="Who you are first, then how you're doing, then where it leaks.">
          <div className={s.prose}>
            <p>
              The dashboard reads top to bottom like a short story. The spending archetype comes first because
              it&rsquo;s the most personal thing North knows about you. The health score comes next, with the reason
              it isn&rsquo;t higher. Then the money leaving without you noticing. Trends and categories come last, for
              when you want the detail.
            </p>
          </div>
          <Shot
            src="/work/north/dashboard.jpg"
            alt="North's dashboard: a Homebody archetype banner (also Foodie), a health score of 61 marked Fair with 2 anomalies, average monthly spend of ₹54K, subscription bleed, a monthly trend and top categories."
            caption="The dashboard on sample data: a Homebody who is also a Foodie, with a health score of 61."
          />
          <Points
            items={[
              { icon: UserFocusIcon, title: "An archetype, not a label", text: "Two people can both spend ₹50k a month and need opposite advice. One loses it on weekends, the other to a dozen subscriptions. Seven archetypes, a primary and an optional secondary." },
              { icon: GaugeIcon, title: "A score that explains itself", text: "Health is out of 100, built from savings (40), stability (25), subscriptions (20) and trend (15). Anomalies show as a tag you can act on." },
              { icon: TrendDownIcon, title: "Always compared to last month", text: "A number alone means nothing. Average spend always carries its change since last month, in green or red." },
              { icon: DropIcon, title: "One warm colour for leaks", text: "Subscription bleed is the only orange block on the page. The eye finds it without being told to." },
            ]}
          />
        </Section>

        {/* ---- 08 chat ------------------------------------------------------- */}
        <Section id="chat" n="08" label="Chat" title="An empty chat box is a blank page. North's isn't.">
          <div className={s.prose}>
            <p>
              The first time you open chat, North introduces itself and offers four cards: Spending Analysis,
              Subscription Detective, What-If Simulator and Smart Budgeting. Each one maps to a real agent in the
              graph, so the interface teaches what the system can do without a help page. One-tap questions sit
              underneath, like &ldquo;What if I save ₹5,000 more a month?&rdquo;
            </p>
          </div>
          <Shot
            src="/work/north/chat-empty.jpg"
            alt="North's empty chat: the mascot says Hey, I'm North, followed by four coloured starter cards and a row of suggested questions above the message box."
            caption="The empty state. The four cards are the four things North is good at."
          />
          <div className={s.pairWrap}>
            <div className={s.pair}>
              <Shot
                src="/work/north/trace.jpg"
                alt="The Agent Pipeline panel, listing Router, Scenario and Assembler as they run."
                caption="The Pipeline panel lists each step as it runs, with what it decided."
                sizes="(min-width: 1200px) 35vw, (min-width: 768px) 50vw, 100vw"
              />
              <Shot
                src="/work/north/scenario.jpg"
                alt="A what-if answer: a savings trajectory chart with optimistic, realistic and pessimistic lines."
                caption="A what-if answer: three futures over six months, not one confident number."
                sizes="(min-width: 1200px) 35vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
          <Points
            items={[
              { icon: CardsIcon, title: "Starters that map to agents", text: "Every starter card sends a question the graph routes to one specialist. Nobody has to guess what to type." },
              { icon: TreeStructureIcon, title: "A pipeline you can open", text: "A small Pipeline pill sits in the corner. Open it and you see the router pick a path, the specialist take over and the reply get written." },
              { icon: ChartLineUpIcon, title: "Charts inside the answer", text: "When a chart helps, it sits inside the reply, right under the sentence it supports." },
              { icon: CheckSquareIcon, title: "Cards for anything that sticks", text: "Suggested goals arrive as a card with one button. Anything that would write to your data waits for a confirmation card." },
            ]}
          />

          <h3 className={s.h3} data-reveal>Giving it a voice</h3>
          <div className={s.prose}>
            <p>
              The first version&rsquo;s prompts optimised for precision, and every reply read like a bank statement.
              The fix was two paragraphs of prompt: talk like a friend who&rsquo;s good with money, lead with the
              insight rather than the data, and never open with &ldquo;Based on the data&rdquo;. It was the cheapest
              change in the project, and the one people notice first.
            </p>
          </div>
          <div className={cx(s.list, s.cols2)}>
            <div className={s.item} data-reveal>
              <span className={cx("t-label", s.label)}>Before</span>
              <p className={s.said}>
                Based on the data, your savings rate is 22%. Your Food &amp; Dining spend is ₹13,500, which is 28% of
                total spend.
              </p>
            </div>
            <div className={s.item} data-reveal>
              <span className={cx("t-label", s.label)}>After</span>
              <p className={cx(s.said, s.saidAfter)}>
                Good news first: you&rsquo;re keeping 22% of what comes in, which is more than most people. If you want
                more room, look at food. It&rsquo;s ₹13,500 a month, and most of it happens on weekends.
              </p>
            </div>
          </div>
        </Section>

        {/* ---- 09 subscriptions ---------------------------------------------- */}
        <Section id="subscriptions" n="09" label="Subscriptions" title="₹199 a month sounds like nothing. ₹2,388 a year doesn't.">
          <div className={s.prose}>
            <p>
              The subscriptions page is sorted by annual cost, and that column is the one in red, because
              that&rsquo;s the number that gets people to cancel things. North finds recurring charges by itself from
              the gaps between payments, so nothing needs tagging by hand.
            </p>
          </div>
          <div className={s.pairWrap}>
            <div className={s.pair}>
              <Shot
                src="/work/north/subscriptions.jpg"
                alt="North's subscriptions page: annual bleed of ₹22K across 5 subscriptions, and a table of services sorted by annual cost."
                caption="Subscriptions: ₹22K a year across five services, sorted by what they cost you annually."
                sizes="(min-width: 1200px) 35vw, (min-width: 768px) 50vw, 100vw"
              />
              <Shot
                src="/work/north/transactions.jpg"
                alt="North's transactions page: totals for transactions, spend, anomalies and recurring charges, above a list of merchants with category tags."
                caption="Transactions stay plain on purpose: merchant initials, a colour per category, flags only when something repeats or looks unusual."
                sizes="(min-width: 1200px) 35vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
          <Points
            items={[
              { icon: RepeatIcon, title: "Found, not tagged", text: "A charge counts as recurring when it comes back from the same merchant at a steady gap. The cadence also gives the yearly cost." },
              { icon: ReceiptIcon, title: "Boring where it should be", text: "The transaction list is for checking, not for insight. It stays quiet so the other screens don’t have to compete with it." },
            ]}
          />
        </Section>

        {/* ---- 10 visual language -------------------------------------------- */}
        <Section id="visual" n="10" label="Visual language" title="Quiet, so the numbers can be loud.">
          <div className={s.prose}>
            <p>
              I started from Linear&rsquo;s dark system: a near-black canvas, four surface steps that sit close
              together, and hairline borders instead of heavy cards. Colour is rationed. Green comes from the mascot
              and means good. Orange means money leaking. Category colours only appear on data. Montserrat sets the
              interface and Poppins the headings, friendly without being cute.
            </p>
            <p>
              The mascot is a small cloud peeking over the bottom of the logo. Money is stressful, and a face on the
              first screen makes it a little less so.
            </p>
          </div>
          <div className={s.swatches} data-reveal>
            {palette.map((c) => (
              <div key={c.hex} className={s.swatch}>
                <span className={s.chip} style={{ background: c.hex }} />
                <b>{c.name}</b>
                <span>{c.hex}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- 11 engineering ------------------------------------------------ */}
        <Section id="engineering" n="11" label="Under the hood" aside="AI engineering" title="Maths in Python. Words from the model.">
          <div className={s.prose}>
            <p>
              The design only works if the answers are right and arrive quickly, so the engineering follows one rule:
              if a job has one right answer, a model shouldn&rsquo;t be doing it. Health scores, subscription
              detection, month-on-month changes and the archetype are all plain Python. Models come in where
              language matters: understanding the question, weighing trade-offs, and saying it well. They never see
              raw transactions, only a structured report the Python side has already built.
            </p>
          </div>
          <Fig n="03" caption="Upload once. Every question after that runs through the graph.">
            <SystemMap />
          </Fig>

          <Points
            items={[
              { icon: TreeStructureIcon, title: "A graph, not a chatbot", text: "Behind the chat is a small graph of specialists. A router decides who handles a question, only one specialist answers, and anything that would change your data stops at a confirmation step. The Pipeline panel in the chat is that graph, shown live." },
              { icon: CpuIcon, title: "The right model for the job", text: "Fast models where someone is waiting, a small cheap one for bulk work like categorising merchants, and the bigger one only where the advice has to be good." },
            ]}
          />

          <h3 className={s.h3} data-reveal>Memory</h3>
          <div className={s.prose}>
            <p>
              If you tell North in March that you&rsquo;re saving ₹50,000 by December, it should still know in May.
              So memory has three layers. Before a reply goes out, a fast check also compares it with what North has
              told you before, and rewrites it if the advice contradicts itself.
            </p>
          </div>
          <Fig n="04" caption="Three layers, from this turn to everything you've said.">
            <MemoryLayers />
          </Fig>

          <h3 className={s.h3} data-reveal>What changed from v1</h3>
          <Points
            items={[
              { icon: TableIcon, title: "Categories", text: "v1 sent every transaction to a large model. Now a lookup of known merchants goes first. Swiggy is always food." },
              { icon: UserFocusIcon, title: "Personality", text: "The archetype moved out of the prompt and into plain code: the same answer, most of a second faster, and free." },
              { icon: ChartLineUpIcon, title: "What-if ranges", text: "Fixed multipliers became ranges based on how much you actually vary. Steady spenders get tight ranges, erratic ones get honest ones." },
              { icon: SquaresFourIcon, title: "The flow", text: "v1 was a straight line from question to reply. v2 branches, pauses before writes, and reports each step to the interface." },
            ]}
          />
        </Section>

        {/* ---- 12 next ------------------------------------------------------- */}
        <Section id="next" n="12" label="What's next" title="What isn't done, and where it goes from here.">
          <Points
            items={[
              { icon: CloudSlashIcon, title: "It isn't live", text: "It runs locally with Docker and a sample statement. Most of what matters in an AI product shows up when real people use it, and North hasn’t met any yet." },
              { icon: LockOpenIcon, title: "The gate always opens", text: "The confirmation card exists and sits in the right place, but the backend auto-confirms for now. A real pause comes before anything touches real money." },
              { icon: FlaskIcon, title: "No evals", text: "Latency and cost are logged for every request. How often the router picks the wrong path isn’t. A thumbs up or down on replies is the first thing I’d add." },
              { icon: ScalesIcon, title: "The score is reasoned, not proven", text: "The health score weights follow common savings benchmarks, but nobody has checked them against real outcomes." },
            ]}
          />
          <div className={s.prose} style={{ marginTop: "var(--space-8)" }}>
            <p>
              I prioritised North the way I&rsquo;d prioritise any backlog: plot it, do the top-left first, argue
              about the top-right later. Bank import sits alone in the corner on purpose. India&rsquo;s Account
              Aggregator network would turn North from a demo into something you open every day, but it&rsquo;s weeks
              of integration and compliance work. Worth doing once the core loop has proven itself.
            </p>
          </div>
          <Fig n="05" caption="Impact against effort. Filled dots have shipped; hollow ones are next.">
            <ImpactEffort />
          </Fig>
          <div className={s.job} data-reveal>
            <p className={cx("t-label", s.label)}>
              <LightbulbIcon weight="duotone" aria-hidden="true" style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} />
              If I had one more week
            </p>
            <p className={s.jobText}>
              The archetype would stop being a card on the dashboard and become the first thing you see. It&rsquo;s
              the one thing no other app tells you, and the best reason to come back.
            </p>
          </div>
        </Section>

        <nav className={cx("t-label", s.end)} aria-label="Case study">
          <Link href="/#work">
            <ArrowLeftIcon weight="bold" aria-hidden="true" /> All work
          </Link>
          <a href="#top">
            Back to top <ArrowUpIcon weight="bold" aria-hidden="true" />
          </a>
        </nav>
      </article>
    </div>
  );
}
