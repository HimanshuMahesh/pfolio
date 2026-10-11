import type { Metadata } from "next";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { BrowserIcon } from "@phosphor-icons/react/dist/ssr/Browser";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr/ChatCircleText";
import { CodeIcon } from "@phosphor-icons/react/dist/ssr/Code";
import { CompassIcon } from "@phosphor-icons/react/dist/ssr/Compass";
import { DiamondIcon } from "@phosphor-icons/react/dist/ssr/Diamond";
import { EyeIcon } from "@phosphor-icons/react/dist/ssr/Eye";
import { FileDashedIcon } from "@phosphor-icons/react/dist/ssr/FileDashed";
import { ImageSquareIcon } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { LightbulbIcon } from "@phosphor-icons/react/dist/ssr/Lightbulb";
import { MagicWandIcon } from "@phosphor-icons/react/dist/ssr/MagicWand";
import { NotepadIcon } from "@phosphor-icons/react/dist/ssr/Notepad";
import { PenNibIcon } from "@phosphor-icons/react/dist/ssr/PenNib";
import { ShapesIcon } from "@phosphor-icons/react/dist/ssr/Shapes";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/ssr/SquaresFour";
import { SwatchesIcon } from "@phosphor-icons/react/dist/ssr/Swatches";
import { TextAaIcon } from "@phosphor-icons/react/dist/ssr/TextAa";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/ssr/UsersThree";
import { site } from "@/content/site";
import { Act, Aside, Card, Cards, Chunk, DUO as D, Lead, List, NotePage, Prose, Question, Split, Timeline } from "@/components/notes/Blocks";
import { HairlineFigure } from "@/components/notes/figures/HairlineFigure";
import { GeneratedToDesigned, SystemConsistency } from "@/components/notes/figures/DesignFigures";

const TITLE = "Death of the Blank Canvas";
const DATE = "2026-10-12";

export const metadata: Metadata = {
  title: `${TITLE} · ${site.name}`,
  description:
    "AI can make a polished interface in a minute, so why do so many of them feel off? How design tools got here, what they still miss, and what it means to be a designer now.",
  openGraph: { title: `${TITLE}: designing with AI`, type: "article", publishedTime: DATE },
};

export default function BlankCanvasNote() {
  return (
    <NotePage number="04.1" category="Design" date={DATE} minutes={13} title={TITLE} subtitle="Designing with AI">
      {/* ---- Act I ---------------------------------------------------------- */}
      <Act n="01" label="Act I" aside="How this started" title="Everything looks finished now">
        <Lead>
          Every design project I&rsquo;ve done started the same way: an empty frame and no idea where to begin. That
          part is gone. <strong>I type one sentence and get back a full interface</strong>, with a hero, cards, a nice
          font, soft shadows, the works. In about a minute.
        </Lead>

        <Chunk icon={<PenNibIcon {...D} />} title="Why I care">
          <p>
            I sit on both sides of this. I run a small design studio, Spacered, and my day job is building AI systems.
            So I&rsquo;m the person who&rsquo;s supposed to be excited about this and also the person it&rsquo;s
            supposed to replace.
          </p>
          <p>
            And honestly, the first few times it was exciting. It looked like a real product. Better than a lot of what
            I was designing a few years ago.
          </p>
        </Chunk>

        <Chunk icon={<EyeIcon {...D} />} title="The thing that bugs me">
          <p>
            But the longer I looked, the more something felt off. Not wrong exactly. Just empty.{" "}
            <strong>Everything was equally loud.</strong> Every section got a card. The spacing was tidy but didn&rsquo;t
            mean anything. The copy sounded like a product but said nothing about this one.
          </p>
          <p>
            It looked like a design. It just didn&rsquo;t look like anyone had <strong>decided</strong> anything.
          </p>
        </Chunk>

        <Chunk icon={<FileDashedIcon {...D} />} title="What the blank canvas was for">
          <p>
            Here&rsquo;s the thing I didn&rsquo;t appreciate until it was gone. The blank canvas was annoying, but it
            made you think first. Before you could draw anything you had to decide what the page was for, who it was
            for, and what mattered most.
          </p>
          <p>
            <strong>AI skips that part.</strong> You get an answer before you&rsquo;ve finished asking the question.
            Which is great when you know what you want, and quietly dangerous when you don&rsquo;t.
          </p>
        </Chunk>

        <Question>
          If a tool can make a polished interface in a minute, what exactly was the designer doing all those hours?
        </Question>
      </Act>

      {/* ---- Act II --------------------------------------------------------- */}
      <Act n="02" label="Act II" aside="How we got here" title="Every tool removed a little more friction">
        <Lead>
          This didn&rsquo;t come out of nowhere. Every big shift in design tools has done the same thing:{" "}
          <strong>shrink the distance between an idea and a screen</strong>. AI is just the biggest jump so far.
        </Lead>

        <Timeline
          items={[
            { year: "1990", icon: <ImageSquareIcon {...D} />, children: <><b>Photoshop</b> ships. For years, interfaces get mocked up in a tool built for editing photos.</> },
            { year: "2010", icon: <PenNibIcon {...D} />, children: <><b>Sketch</b> arrives, built for interface design. Symbols mean you stop redrawing the same button.</> },
            { year: "2014", icon: <SquaresFourIcon {...D} />, children: <><b>Material Design</b> is published, and design systems go mainstream. Taste starts getting written down.</> },
            { year: "2016", icon: <BrowserIcon {...D} />, children: <><b>Figma</b> launches in the browser. One file, everyone in it at once, no more final_v7.</> },
            { year: "2023", icon: <CodeIcon {...D} />, children: <><b>v0</b> by Vercel turns a prompt into working UI code. Prompt-to-interface becomes a real thing.</> },
            { year: "2024", icon: <SparkleIcon {...D} />, children: <><b>Figma AI</b> is announced, including generating a first draft of a screen from a prompt, right in the editor.</> },
            { year: "2025", icon: <MagicWandIcon {...D} />, children: <><b>Figma Make</b> and Google&rsquo;s <b>Stitch</b> go from a prompt to a working prototype.</> },
            { year: "2026", icon: <DiamondIcon {...D} />, children: <><b>Claude Design</b> from Anthropic: describe what you want, get designs and prototypes, refine them by talking.</> },
          ]}
        />

        <Chunk icon={<ArrowsClockwiseIcon {...D} />} title="What each jump actually removed">
          <List
            items={[
              ["Sketch", "The workarounds of designing UI in a photo editor."],
              ["Design systems", "Redrawing and re-deciding the same components every project."],
              ["Figma", "Handoff friction, file versions, and designing alone."],
              ["AI", "The drawing itself. You describe, it draws."],
            ]}
          />
          <p>
            Every one of these made designers faster. But the first three still needed you to make every decision by
            hand. <strong>AI is the first one that makes the decisions for you</strong>, whether you asked it to or not.
            That&rsquo;s the part that feels different.
          </p>
        </Chunk>

        <Chunk icon={<NotepadIcon {...D} />} title="The prompt is the new brief">
          <p>
            A prompt is just a brief. And a vague brief always got you a vague design, even from a person. The
            difference is a junior designer would come back with questions. Who&rsquo;s this for? What should they do
            first? What are we not doing?
          </p>
          <p>
            The tool doesn&rsquo;t ask. <strong>It fills every gap in your brief with the most average answer</strong>,
            and makes it look great. So the skill quietly shifts from drawing to writing a brief that leaves no gaps.
          </p>
        </Chunk>
      </Act>

      {/* ---- Act III -------------------------------------------------------- */}
      <Act n="03" label="Act III" aside="Where it is today" title="Great at the first draft, shaky on the craft">
        <Lead>
          I&rsquo;ve been using these tools a lot, for client work and for my own stuff. The pattern I keep running into
          is pretty consistent: <strong>the first impression is amazing, and the details are where it slips</strong>.
        </Lead>

        <Split
          figure={
            <HairlineFigure
              name="emphasis"
              fig="Fig 1"
              title="What the page is for"
              hint="Hover a section"
              slider="Contrast"
              stops={[
                { name: "Flat", at: 0 },
                { name: "Soft", at: 0.3 },
                { name: "Clear", at: 0.5 },
                { name: "Bold", at: 1 },
              ]}
              start={2}
              label="A web page laid flat on a board: nav, hero, features, proof and a call to action, each section standing as tall as it matters. The section you point at rises and the rest settle."
              caption="Each section stands as tall as it matters. Point at one to make it the focus. On Flat, every section ends up about the same height, which is what a lot of generated pages feel like."
            />
          }
        >
          <h3>Hierarchy goes first</h3>
          <p>
            Hierarchy is really one decision: <strong>what is this page for?</strong> Once you know that, one thing gets
            to be loud and everything else steps back.
          </p>
          <p>
            Generated pages tend to skip the decision. Every section gets a card, a heading and the same amount of
            space, so nothing leads. It&rsquo;s the Flat setting in Fig 1. Everything&rsquo;s there, and your eye has
            nowhere to land.
          </p>
          <p>
            The fix isn&rsquo;t a better model. It&rsquo;s telling it what matters, or deciding it yourself after.{" "}
            <strong>Contrast is a choice, not a style.</strong>
          </p>
        </Split>

        <Cards>
          <Card icon={<TextAaIcon {...D} />} title="Typography">
            Safe, readable scales. Rarely a voice. <strong>It picks fonts that look good</strong>, not fonts that say
            something about the product.
          </Card>
          <Card icon={<SquaresFourIcon {...D} />} title="Spacing">
            Tidy, even padding everywhere. What&rsquo;s missing is rhythm: <strong>space that groups things on
            purpose</strong> and separates what should feel separate.
          </Card>
          <Card icon={<SwatchesIcon {...D} />} title="Consistency">
            Solid inside one screen. Across a whole flow it drifts, <strong>unless you give it a system</strong> to stick
            to.
          </Card>
        </Cards>
        <Cards>
          <Card icon={<ChatCircleTextIcon {...D} />} title="Iteration">
            Feedback often makes a design different instead of better. <strong>Fix one thing and something else
            moves.</strong>
          </Card>
          <Card icon={<ShapesIcon {...D} />} title="Precise edits">
            Generating a whole new screen is easy for it. <strong>Changing exactly one thing</strong> and leaving the rest
            alone is still the hard part, and that&rsquo;s most of real design work.
          </Card>
          <Card icon={<NotepadIcon {...D} />} title="Words">
            The copy sounds like a product and says nothing. <strong>Placeholder confidence.</strong> Good design
            starts with what the page actually needs to say.
          </Card>
        </Cards>

        <Chunk icon={<LightbulbIcon {...D} />} title="Where it&rsquo;s genuinely great">
          <List
            items={[
              ["Exploring", "Ten directions in the time it takes to sketch one."],
              ["First drafts", "Getting past the blank canvas, which was always the worst part."],
              ["Boring states", "Empty, loading, error. The screens nobody wants to design."],
              ["Testing ideas", "A clickable prototype before an idea has had time to get precious."],
            ]}
          />
          <p>
            And it&rsquo;s getting better fast. Some of the problems above were much worse a year ago. I don&rsquo;t
            think the gap closes by itself though, because the gap isn&rsquo;t really about quality.
          </p>
        </Chunk>
      </Act>

      {/* ---- Act IV --------------------------------------------------------- */}
      <Act n="04" label="Act IV" aside="The deeper part" title="Generating a UI isn’t designing an experience">
        <Lead>
          A screen is the output. <strong>The design is all the decisions behind it.</strong> That difference is the
          whole story.
        </Lead>

        <Chunk icon={<MagicWandIcon {...D} />} title="Polish got cheap">
          <p>
            For a long time, polish was a signal. Good type, careful spacing, a nice gradient meant someone had spent
            time on it. Now polish is free. Every tool gives it to you by default.
          </p>
          <p>
            Which means <strong>polish has stopped being proof of design</strong>. When everything looks good, looking
            good stops telling you anything.
          </p>
        </Chunk>

        <Split figure={<GeneratedToDesigned fig="Fig 2" />}>
          <h3>Why it feels off, and how it stops</h3>
          <p>
            A model makes the most likely interface for your prompt. That&rsquo;s basically the average of every good
            looking interface it&rsquo;s seen. The average is clean, safe and familiar. <strong>It&rsquo;s also
            nobody&rsquo;s.</strong>
          </p>
          <p>
            Fig 2 is the same page going from generated to designed. Nothing new gets added. Every step is a
            decision: what leads, how things group, a real type scale, and then the most important one, what to cut.
          </p>
          <p>
            AI is great at adding. Another section, another card, another gradient. Good design is mostly taking things
            away until only what matters is left. <strong>Taste is the decisions you make, and even more the ones you
            refuse.</strong>
          </p>
        </Split>

        <Split figure={<SystemConsistency fig="Fig 3" />}>
          <h3>Design systems are taste written down</h3>
          <p>
            A design system is a pile of decisions someone already made: this type scale, these spacing steps, this is
            how a button behaves.
          </p>
          <p>
            Without one, every screen a tool generates invents its own answers, like the No system step in Fig 3. Give it
            your system and those decisions are already made, so <strong>the output stops being generic and starts
            being yours</strong>.
          </p>
          <p>
            That&rsquo;s why I think design systems are about to matter more than ever. They&rsquo;re how your taste
            gets into the machine.
          </p>
        </Split>

        <Aside label="What I tell people now">
          Use AI to get to a first draft fast. Then do the actual design: decide what matters, cut what doesn&rsquo;t,
          and make it feel like it was made for someone.
        </Aside>
      </Act>

      {/* ---- Act V ---------------------------------------------------------- */}
      <Act n="05" label="Act V" aside="Where this is going" title="The canvas is gone. The judgement isn’t.">
        <Lead>
          So is AI replacing parts of the design process, or changing what it means to be a designer?{" "}
          <strong>I think it&rsquo;s both, and the second one matters more.</strong>
        </Lead>

        <Chunk icon={<ChatCircleTextIcon {...D} />} title="From canvas to conversation">
          <p>
            The main surface of design is moving from a canvas to a conversation. You describe, react, redirect. And the
            output is increasingly real code, so <strong>the line between the design file and the product is getting
            very thin</strong>.
          </p>
          <p>
            That means designers who understand how things get built, and how to talk to these tools precisely, are
            going to have a real edge.
          </p>
        </Chunk>

        <Chunk icon={<CompassIcon {...D} />} title="How I work now">
          <List
            items={[
              ["Think first", "Decide what the page is for and who it’s for, before any tool is open."],
              ["Go wide", "Generate a lot of directions fast. This is where AI earns its keep."],
              ["Pick and cut", "Choose one, then remove everything that isn’t pulling its weight."],
              ["Systemise", "Rebuild it on real tokens and components so it holds up past one screen."],
              ["Sweat it", "The last 10% by hand. Spacing, type, the copy. That’s still where it gets good."],
            ]}
          />
        </Chunk>

        <Cards>
          <Card icon={<ArrowsClockwiseIcon {...D} />} title="What&rsquo;s being replaced">
            Pushing pixels. The first layout. Five variations by hand. The empty state for the fourteenth time.
            Honestly, I won&rsquo;t miss most of it.
          </Card>
          <Card icon={<CompassIcon {...D} />} title="What&rsquo;s changing">
            The job moves to both ends: <strong>framing the problem</strong> at the start, and <strong>editing</strong>{" "}
            at the end. Less illustrator, more editor and director.
          </Card>
          <Card icon={<UsersThreeIcon {...D} />} title="What doesn&rsquo;t change">
            Understanding people. What they&rsquo;re trying to do, what confuses them, what they&rsquo;ll care about.{" "}
            <strong>No tool generates that for you.</strong>
          </Card>
        </Cards>

        <Question>
          The blank canvas is dead. But it was never the hard part. If anyone can make it look good, the job is knowing
          what it should be.
        </Question>

        <Prose>
          <p>Now if you&rsquo;ll excuse me, I have a blank canvas to not open.</p>
        </Prose>
      </Act>
    </NotePage>
  );
}
