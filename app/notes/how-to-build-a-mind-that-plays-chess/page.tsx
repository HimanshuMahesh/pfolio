import type { Metadata } from "next";
import { BooksIcon } from "@phosphor-icons/react/dist/ssr/Books";
import { BrainIcon } from "@phosphor-icons/react/dist/ssr/Brain";
import { CpuIcon } from "@phosphor-icons/react/dist/ssr/Cpu";
import { CrownSimpleIcon } from "@phosphor-icons/react/dist/ssr/CrownSimple";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { FunctionIcon } from "@phosphor-icons/react/dist/ssr/Function";
import { GaugeIcon } from "@phosphor-icons/react/dist/ssr/Gauge";
import { GitBranchIcon } from "@phosphor-icons/react/dist/ssr/GitBranch";
import { HorseIcon } from "@phosphor-icons/react/dist/ssr/Horse";
import { HourglassIcon } from "@phosphor-icons/react/dist/ssr/Hourglass";
import { LightningIcon } from "@phosphor-icons/react/dist/ssr/Lightning";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PathIcon } from "@phosphor-icons/react/dist/ssr/Path";
import { RobotIcon } from "@phosphor-icons/react/dist/ssr/Robot";
import { ScalesIcon } from "@phosphor-icons/react/dist/ssr/Scales";
import { ScissorsIcon } from "@phosphor-icons/react/dist/ssr/Scissors";
import { SealCheckIcon } from "@phosphor-icons/react/dist/ssr/SealCheck";
import { SigmaIcon } from "@phosphor-icons/react/dist/ssr/Sigma";
import { StackIcon } from "@phosphor-icons/react/dist/ssr/Stack";
import { TelevisionSimpleIcon } from "@phosphor-icons/react/dist/ssr/TelevisionSimple";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/ssr/TreeStructure";
import { site } from "@/content/site";
import { HairlineFigure } from "@/components/notes/figures/HairlineFigure";
import { Balance } from "@/components/notes/figures/Balance";
import { PruningTree } from "@/components/notes/figures/MathFigures";
import { Act, Aside, Card, Chunk, DUO as D, Formula, NotePage, Split, Timeline, noteStyles as s } from "@/components/notes/Blocks";
import "@/components/notes/figures/anatomy.css";

const TITLE = "How to Build a Mind That Plays Chess";
const DATE = "2026-10-11";

export const metadata: Metadata = {
  title: `${TITLE} · ${site.name}`,
  description:
    "I binge-watched GothamChess, got curious about the engine bar, and went down the rabbit hole: search, evaluation, AlphaZero, Stockfish's NNUE, and what any of it has to do with the agents I build at work.",
  openGraph: { title: TITLE, type: "article", publishedTime: DATE },
};


export default function ChessNote() {
  return (
    <NotePage
      number="04.2"
      category="AI"
      date={DATE}
      minutes={15}
      title={TITLE}
      subtitle="Are we teaching it to think, or to find the answer?"
    >
        {/* ---- Act I ---------------------------------------------------------- */}
        <Act n="01" label="Act I" aside="How this started" title="Too much GothamChess">
          <p className={s.lead}>
            For the last few months I&rsquo;ve been binge-watching GothamChess. One recap turns into five, it&rsquo;s
            suddenly 2 a.m., and I&rsquo;m watching a game from the 1800s I had no reason to care about.{" "}
            <strong>At some point I stopped watching the players and started watching the engine.</strong>
          </p>
          <Chunk icon={<TelevisionSimpleIcon {...D} />} title="The bar on the side">
            <p>
              If you&rsquo;ve watched Levy, you know the setup. There&rsquo;s an evaluation bar next to the board, and
              every so often he checks what the engine thinks. Sometimes it agrees with him. Sometimes a move that looks
              completely normal gets flagged as a blunder, the bar swings hard, and the best move turns out to be
              something nobody in the game even considered.
            </p>
            <p>
              I&rsquo;m not a strong player. I know the rules, a couple of openings, and that&rsquo;s about it. But I
              build AI systems at work, and that bar started bugging me. <strong>How does it know?</strong>
            </p>
          </Chunk>
          <Chunk icon={<MagnifyingGlassIcon {...D} />} title="What I wanted to figure out">
            <ul className={s.list}>
              <li><b>Calculation</b><span>Does the engine just look at every possible move?</span></li>
              <li><b>Judgement</b><span>Or does it actually know what a good position looks like?</span></li>
              <li><b>Mechanism</b><span>And when it plays better than any human ever has, what&rsquo;s going on inside?</span></li>
            </ul>
            <p>
              So I went down the rabbit hole. Papers, the Chess Programming Wiki, a lot of Stockfish docs. This post is
              what I found, written by someone who isn&rsquo;t a chess person and learned most of this along the way.
            </p>
          </Chunk>
          <p className={s.question}>
            The question I kept coming back to: when we build an intelligent system, are we teaching it how to think, or
            just teaching it to find the right answer?
          </p>
        </Act>

        {/* ---- Act II: search --------------------------------------------------- */}
        <Act n="02" label="Act II" aside="The engineering puzzle" title="Chess is a search problem, but not a simple one">
          <p className={s.lead}>
            My first thought as an engineer was that this should be easy. The rules are fixed, the board is finite, and
            generating legal moves is a weekend project. <strong>So list every move, play each one forward, pick the
            best.</strong> Turns out people have been trying exactly that since 1950, and it doesn&rsquo;t work.
          </p>

          <Chunk icon={<BooksIcon {...D} />} title="It started with one paper">
            <p>
              In 1950 Claude Shannon, the same Shannon behind information theory, wrote a paper on programming a
              computer to play chess. He described two ways to do it. <strong>Type A</strong> looks at every move to a
              fixed depth. <strong>Type B</strong> only looks at the moves that seem worth it, the way a human does, and
              goes deeper on those.
            </p>
            <p>
              What surprised me is how much of the next fifty years was basically those two ideas taking turns winning,
              depending on what the hardware of the time could handle.
            </p>
          </Chunk>

          <Timeline
            items={[
              { year: "1950", icon: <BooksIcon {...D} />, children: <><b>Shannon</b> lays out minimax and the evaluation function, and estimates around 10¹²⁰ possible games.</> },
              { year: "1952", icon: <PathIcon {...D} />, children: <><b>Turing</b> plays a game with a chess program he wrote on paper, working out every move by hand.</> },
              { year: "1950s", icon: <ScissorsIcon {...D} />, children: <><b>Alpha-beta pruning</b> shows up in early programs. Knuth and Moore analyse it properly in 1975.</> },
              { year: "1970s", icon: <StackIcon {...D} />, children: <><b>Chess 4.x</b> wins with Type A. Brute force plus faster machines beat the clever selective programs.</> },
              { year: "1983", icon: <CpuIcon {...D} />, children: <><b>Belle</b>, built on custom hardware at Bell Labs, is the first machine to play at master level.</> },
              { year: "1997", icon: <CrownSimpleIcon {...D} />, children: <><b>Deep Blue</b> beats Garry Kasparov, searching around 200 million positions a second on custom chips.</> },
            ]}
          />

          <Chunk icon={<TreeStructureIcon {...D} />} title="Why you can’t just check everything">
            <p>
              A normal middlegame position has around <strong>35 legal moves</strong>. Each of those has about 35
              replies. So looking ahead multiplies, it doesn&rsquo;t add.
            </p>
            <Formula
              math="N(d) ≈ bᵈ"
              terms={[
                ["b", "branching factor, around 35 in the middlegame"],
                ["d", "depth, in plies (one move by one side)"],
                ["N", "positions at the bottom of the tree"],
              ]}
            />
            <p>
              From the starting position the exact counts go 20, 400, 8,902, 197,281, and after just three moves each
              you&rsquo;re at <strong>119,060,324</strong>. Ten plies deep is roughly 2.8 × 10¹⁵ positions. At a
              million positions a second that&rsquo;s close to a century. For one move.
            </p>
          </Chunk>

          <Chunk icon={<GitBranchIcon {...D} />} title="Your opponent gets a say">
            <p>
              The other thing I hadn&rsquo;t thought about: you can&rsquo;t judge a move on its own, because the other
              side gets to reply. The classic way to handle this is <strong>minimax</strong>. You assume you&rsquo;ll
              play your best move, your opponent will play the reply that&rsquo;s worst for you, and you follow that all
              the way down the tree.
            </p>
            <Formula
              math={"V(s) = E(s)                      at the horizon\nV(s) = max over moves a of V(s·a)   my turn\nV(s) = min over moves a of V(s·a)   their turn"}
              terms={[
                ["V(s)", "value of position s, from my side"],
                ["E(s)", "the evaluation function, used where search stops"],
                ["s·a", "the position after playing move a"],
              ]}
            />
            <p>
              Basically, a move is only as good as the worst thing that can happen after it. Which is also what Levy
              keeps telling his viewers when they hang a piece.
            </p>
          </Chunk>

          <Split figure={<PruningTree fig="Fig 1" />}>
            <h3>Alpha-beta: skip what can&rsquo;t matter</h3>
            <p>
              This was the first idea in the whole rabbit hole that made me go &ldquo;oh, that&rsquo;s clever.&rdquo;
            </p>
            <p>
              While searching, the engine tracks two numbers: <strong>α</strong>, the best score it&rsquo;s already
              guaranteed, and <strong>β</strong>, the best the opponent is guaranteed. If a branch is already proven
              worse than something you have, you stop looking at it. Nothing further down can change your decision.
            </p>
            <Formula
              math="best case: b^⌈d/2⌉ + b^⌊d/2⌋ − 1"
              terms={[["", "positions visited with perfect move ordering (Knuth and Moore, 1975)"]]}
            />
            <p>
              That&rsquo;s about the <strong>square root</strong> of the full tree, so for the same work you search
              roughly twice as deep. The catch is &ldquo;perfect move ordering.&rdquo; Alpha-beta only prunes well if
              it looks at the best moves first, which is a bit of a chicken and egg problem.
            </p>
          </Split>

          <Split
            figure={
              <HairlineFigure
                name="budget"
                fig="Fig 2"
                title="Where the search goes"
                hint="Hover the board"
                slider="Reach"
                stops={[
                  { name: "Narrow", at: 0 },
                  { name: "Focused", at: 0.3 },
                  { name: "Balanced", at: 0.5 },
                  { name: "Wide", at: 1 },
                ]}
                start={2}
                label="A chessboard of 64 tiles. Each tile rises with the search effort spent on that square: the effort piles up around the line that looks promising and falls off everywhere else."
                caption="Each square stands as tall as the search spent on it. Reach sets how widely the engine looks before it commits."
              />
            }
          >
            <h3>So engines cheat, a little</h3>
            <p>
              Every strong engine since has piled tricks on top of alpha-beta to get the move order right and spend its
              time unevenly. Three that stood out to me:
            </p>
            <ul className={s.list}>
              <li><b>Iterative deepening</b><span>Search 1 move deep, then 2, then 3. Each pass tells the next one which moves to try first.</span></li>
              <li><b>Null-move pruning</b><span>If I skip my turn and I&rsquo;m still winning, my real moves probably are too. Stop early.</span></li>
              <li><b>Quiescence search</b><span>Don&rsquo;t stop in the middle of a capture sequence. Play the tactics out, then judge.</span></li>
            </ul>
            <p>
              The result is what Fig 2 shows: <strong>most of the effort goes to a few lines</strong> and almost none
              goes anywhere else. Shannon&rsquo;s brute force Type A, slowly turning into Type B.
            </p>
          </Split>

          <Aside label="Where I was wrong">
            I went in thinking the hard part was speed. It isn&rsquo;t. The hard part is deciding what not to look at. A
            good engine is mostly a really disciplined way of ignoring things.
          </Aside>
        </Act>

        {/* ---- Act II: evaluation ----------------------------------------------- */}
        <Act n="03" label="Act II" aside="Evaluation" title="Calculating isn’t the same as judging">
          <p className={s.lead}>
            Here&rsquo;s something I didn&rsquo;t get at first. Search only gets you to the edge of what you can see.
            Once you&rsquo;re there, something still has to look at the position and say whether it&rsquo;s good.{" "}
            <strong>An engine can calculate a future and still have no idea what it&rsquo;s worth.</strong>
          </p>

          <Chunk icon={<StackIcon {...D} />} title="Two different jobs">
            <p>I kept mixing these up, so writing them down helped:</p>
            <ul className={s.list}>
              <li><b>Search</b><span>explores what could happen next.</span></li>
              <li><b>Evaluation</b><span>guesses how good a position is.</span></li>
              <li><b>Pruning</b><span>and move ordering keep the search affordable.</span></li>
              <li><b>The system</b><span>is only as strong as how these three fit together.</span></li>
            </ul>
          </Chunk>

          <Chunk icon={<SigmaIcon {...D} />} title="How evaluation used to work">
            <p>
              For decades the evaluation was a <strong>weighted sum of things people thought mattered</strong>,
              measured in pawns:
            </p>
            <Formula
              math="E(s) = Σᵢ wᵢ · fᵢ(s)"
              terms={[
                ["fᵢ(s)", "a feature: material, mobility, king safety, passed pawns and so on"],
                ["wᵢ", "its weight. Material starts at pawn 1, knight 3, bishop 3, rook 5, queen 9"],
              ]}
            />
            <p>
              The piece values are the ones every beginner learns. Real engines went way past that, with hundreds of
              terms and weights that shift between the middlegame and the endgame. Stockfish even has a setup called
              Fishtest where volunteers&rsquo; computers have played <strong>billions of games</strong> just to decide
              whether a change makes the engine stronger.
            </p>
          </Chunk>

          <Split figure={<Balance fig="Fig 3" caption="Each term the evaluation counts puts a weight on the right pan. The numbers are made up to show the idea, in pawns." />}>
            <h3>A simple example</h3>
            <p>
              Say Black has castled, king on g8, pawns on f7, g7 and h7. White pushes a pawn to f6 and Black just takes
              it with the g-pawn: <strong>gxf6</strong>.
            </p>
            <p>An evaluation that only counts material says Black is a pawn up. Nice.</p>
            <p>
              A better one notices the g-file is now wide open in front of Black&rsquo;s king, the f-pawns are doubled,
              and White&rsquo;s queen and rook are about to show up. <strong>Same position, completely different
              verdict.</strong> This is the exact kind of moment where the bar on Levy&rsquo;s screen swings and chat
              loses its mind.
            </p>
            <p>
              Search and evaluation cover for each other, too. If the search stops one move too early, the engine can
              walk straight into something it would have seen one move later. That&rsquo;s called the{" "}
              <strong>horizon effect</strong>. A smarter evaluation makes it less likely. A deeper search makes a dumb
              evaluation less dangerous.
            </p>
            <p>
              But every one of those terms was written by a person. Which made me wonder what happens if you let the
              machine figure out what a good position looks like on its own.
            </p>
          </Split>
        </Act>

        {/* ---- Act III: AlphaZero ------------------------------------------------ */}
        <Act n="04" label="Act III" aside="The shift" title="The machine that taught itself">
          <p className={s.lead}>
            In 2017 DeepMind published AlphaZero. It got <strong>the rules of chess and nothing else</strong>. No
            opening books, no human games, no hand-written evaluation. It started out playing random moves and got
            better by playing against itself.
          </p>

          <div className={s.cards}>
            <Card icon={<BrainIcon {...D} />} title="The network">
              Give it a position and it returns a <strong>value</strong>, who it thinks is winning, and a{" "}
              <strong>policy</strong>, which moves look worth trying.
            </Card>
            <Card icon={<TreeStructureIcon {...D} />} title="The search">
              It still searches, using Monte Carlo tree search, but only around <strong>60,000 positions a
              second</strong>. Stockfish at the time was doing tens of millions.
            </Card>
            <Card icon={<ArrowsClockwiseIcon {...D} />} title="Self-play">
              Every game it plays against itself becomes training data. Search makes the network better, and the
              better network makes the next search better.
            </Card>
          </div>

          <Chunk icon={<MagnifyingGlassIcon {...D} />} title="How it decides where to look">
            <p>
              At every position, AlphaZero sends its next visit to whichever move scores highest on a rule called{" "}
              <strong>PUCT</strong>:
            </p>
            <Formula
              math="a* = argmaxₐ [ Q(s,a) + c · P(s,a) · √N(s) / (1 + N(s,a)) ]"
              terms={[
                ["Q(s,a)", "how good move a has looked in the search so far"],
                ["P(s,a)", "how much the network liked move a before searching"],
                ["N", "how many times the position and the move were visited"],
                ["c", "how much to trust the network over the results"],
              ]}
            />
            <p>
              The way I think about the second term is curiosity. It&rsquo;s big for moves the network likes and
              shrinks as a move gets explored. <strong>So at first the network steers, and as visits pile up, the actual
              results take over.</strong>
            </p>
          </Chunk>

          <Chunk icon={<FunctionIcon {...D} />} title="What it learns from">
            <p>
              After every self-play game, the network gets trained to agree with two things: who actually won, and which
              moves the search ended up preferring.
            </p>
            <Formula
              math="loss = (z − v)² − πᵀ log p + c‖θ‖²"
              terms={[
                ["z", "the result of the game: win, draw or loss"],
                ["π", "how the search split its visits between moves"],
                ["v, p", "the network's value and policy"],
                ["c‖θ‖²", "a small penalty so the weights don't overfit"],
              ]}
            />
            <p>
              Once I saw it like this it clicked. <strong>The search is the teacher and the network is the
              student</strong>, and every time the student improves, the teacher gets better too.
            </p>
          </Chunk>

          <Chunk icon={<SealCheckIcon {...D} />} title="What it proved, and what it didn’t">
            <ul className={s.list}>
              <li><b>No copying</b><span>Nobody told it how to play. It found its own strategy.</span></li>
              <li><b>Learned judgement</b><span>Its sense of a good position came from training, not from a list someone wrote.</span></li>
              <li><b>Both together</b><span>The network guided the search, and the search trained the network.</span></li>
              <li><b>The fine print</b><span>Thousands of specialised chips, a perfect simulator of the game, and one clear goal. Not general intelligence.</span></li>
            </ul>
            <p>The same approach also learned shogi and Go, which is what makes it more than a chess result.</p>
          </Chunk>

          <Aside label="Where I was wrong">
            I expected the story to be &ldquo;neural network beats algorithm.&rdquo; It wasn&rsquo;t. The network is
            what made the algorithm worth running.
          </Aside>
        </Act>

        {/* ---- Act III: the hybrid ---------------------------------------------- */}
        <Act n="05" label="Act III" aside="Hybrid engines" title="Plot twist: the old engine didn’t lose">
          <p className={s.lead}>
            After AlphaZero I assumed neural networks just took over and the old engines retired.{" "}
            <strong>That&rsquo;s not what happened at all.</strong>
          </p>

          <Timeline
            items={[
              { year: "2008", icon: <HorseIcon {...D} />, children: <><b>Stockfish</b> comes out. Open source, hand-written evaluation, alpha-beta search tuned by its community.</> },
              { year: "2017", icon: <BrainIcon {...D} />, children: <><b>AlphaZero</b> learns chess from self-play and beats the Stockfish of that time in a match.</> },
              { year: "2018", icon: <RobotIcon {...D} />, children: <><b>Leela Chess Zero</b> rebuilds the AlphaZero idea in the open. <b>Yu Nasu</b> proposes NNUE for shogi.</> },
              { year: "2020", icon: <LightningIcon {...D} />, children: <><b>Stockfish 12</b> adds an NNUE evaluator on top of its classic search and gets a lot stronger.</> },
              { year: "2023", icon: <ScalesIcon {...D} />, children: <><b>Stockfish 16</b> drops the hand-written evaluation completely. The network judges, the search decides where to look.</> },
            ]}
          />

          <Chunk icon={<LightningIcon {...D} />} title="The “efficiently updatable” part">
            <p>
              This is my favourite bit of engineering in the whole story. NNUE&rsquo;s inputs are basically &ldquo;which
              piece is on which square,&rdquo; relative to each king. That&rsquo;s about <strong>41,000 possible
              inputs</strong> in the original design, but only around thirty are on at any moment.
            </p>
            <p>
              The first layer adds up one column of weights for every active input. And here&rsquo;s the trick: two
              positions next to each other in a search differ by just one move, so only two or three inputs change.
            </p>
            <Formula
              math="A ← A − W[:, removed] + W[:, added]"
              terms={[
                ["A", "the accumulator, the first layer's output, kept between positions"],
                ["W[:, i]", "the column of weights for input i"],
              ]}
            />
            <p>
              <strong>So instead of recomputing, the engine just patches the sum.</strong> The rest of the network is
              tiny and runs on a normal CPU with integer maths, fast enough to keep up with a search checking millions of
              positions a second.
            </p>
          </Chunk>

          <Chunk icon={<GaugeIcon {...D} />} title="The boring stuff wins">
            <p>
              Latency, memory, how well the weights fit in cache, positions per second. None of this makes headlines,
              but <strong>it decides who wins as much as the model does</strong>.
            </p>
            <p>
              Leela runs big networks on GPUs. Stockfish runs a tiny network with a ridiculous search. They&rsquo;ve
              traded wins at the top of engine competitions for years, and which one is better depends a lot on the
              hardware and the time control.
            </p>
            <p>
              So the real question was never neural networks versus algorithms. It&rsquo;s{" "}
              <strong>how you combine them for the problem you actually have</strong>.
            </p>
          </Chunk>
        </Act>

        {/* ---- Act IV ----------------------------------------------------------- */}
        <Act n="06" label="Act IV" aside="Back to my day job" title="What this has to do with building agents">
          <p className={s.lead}>
            At work I build AI agents. We&rsquo;ve put roughly forty of them into production, and a lot of my time goes
            into the parts around the model: tools, evals, guardrails. <strong>Reading about chess engines felt weirdly
            familiar.</strong>
          </p>

          <div className={s.chunk}>
            <h3 className={s.side}><RobotIcon {...D} />Engine vs agent</h3>
            <div className={s.body}>
              <table className={s.table}>
                <thead>
                  <tr><th className="t-label">Chess engine</th><th className="t-label">An AI agent</th></tr>
                </thead>
                <tbody>
                  <tr><td>Generates candidate moves</td><td>Comes up with possible actions or approaches</td></tr>
                  <tr><td>Evaluates positions</td><td>Guesses whether an output is any good</td></tr>
                  <tr><td>Searches ahead</td><td>Plans steps and sequences of tool calls</td></tr>
                  <tr><td>Prunes and orders moves</td><td>Spends a limited budget on the promising options</td></tr>
                  <tr><td>Learns from self-play</td><td>Learns from data, feedback or its own runs</td></tr>
                </tbody>
                <caption>Loose analogies. The machinery underneath is very different.</caption>
              </table>
            </div>
          </div>

          <div className={s.cards}>
            <Card icon={<StackIcon {...D} />} title="The model isn’t the system">
              Stockfish&rsquo;s network is tiny next to AlphaZero&rsquo;s and it&rsquo;s still one of the strongest
              players on the planet. Agents feel the same to me.{" "}
              <strong>When one breaks, it&rsquo;s usually the tools, the context or a missing check, not the
              model.</strong>
            </Card>
            <Card icon={<HourglassIcon {...D} />} title="Compute is a budget">
              An engine can&rsquo;t look at every line and an agent can&rsquo;t try every approach forever. Every extra
              step costs time and money. <strong>Deciding where to spend the effort is most of the actual work.</strong>
            </Card>
            <Card icon={<SealCheckIcon {...D} />} title="A guess isn’t a result">
              An evaluation is just an estimate until the search checks it. An agent&rsquo;s answer is the same.{" "}
              <strong>That&rsquo;s why I care so much about evals</strong>. They&rsquo;re the closest thing we have to
              searching one move deeper before committing.
            </Card>
          </div>

          <p className={s.question}>
            We know how to build machines that play chess better than any human. What does it take to build ones that
            behave well when the rules aren&rsquo;t fixed and nobody agrees on what winning means?
          </p>
        </Act>

        {/* ---- Act V ------------------------------------------------------------ */}
        <Act n="07" label="Act V" aside="Back to the board" title="Back to watching GothamChess">
          <p className={s.lead}>
            I started this because of a bar on the side of a YouTube video. I thought I&rsquo;d find a neat story about
            computers getting better at a game. <strong>I found a much better engineering problem than I
            expected.</strong>
          </p>

          <Chunk icon={<HorseIcon {...D} />} title="What I’m taking away">
            <ul className={s.list}>
              <li><b>From chess</b><span>Solving something hard isn&rsquo;t about checking every possibility.</span></li>
              <li><b>From engines</b><span>Learning, judging, searching and being efficient only work as a team.</span></li>
              <li><b>For my work</b><span>The interesting part of an AI system is how the whole thing decides, not just the model in the middle.</span></li>
            </ul>
          </Chunk>

          <Chunk icon={<BrainIcon {...D} />} title="So, think or find the answer?">
            <p>
              I don&rsquo;t think they&rsquo;re opposites anymore.{" "}
              <strong>The engine finds answers by searching, and it searches well because it learned what&rsquo;s worth
              looking at.</strong> Maybe that&rsquo;s most of what thinking is, at least the part we know how to build.
            </p>
            <p>
              Chess is a clean world with fixed rules and a clear score. The stuff I work on isn&rsquo;t. Which is exactly
              why I think the lessons are worth stealing.
            </p>
          </Chunk>

          <p className={s.question}>
            I started with &ldquo;how does a machine decide what to do next?&rdquo; I&rsquo;m ending with a different
            question: how do you build a system that knows what&rsquo;s worth considering in the first place?
          </p>
          <div className={s.prose}>
            <p>Anyway. Back to Levy. He&rsquo;s probably uploaded three videos while I was writing this.</p>
          </div>

          <Chunk icon={<BooksIcon {...D} />} title="What I read">
            <ol className={s.refs}>
              <li><span>Claude E. Shannon, &ldquo;Programming a Computer for Playing Chess,&rdquo; <em>Philosophical Magazine</em>, 1950.</span></li>
              <li><span>Donald E. Knuth and Ronald W. Moore, &ldquo;An Analysis of Alpha-Beta Pruning,&rdquo; <em>Artificial Intelligence</em>, 1975.</span></li>
              <li>
                <span>
                  David Silver et al.,{" "}
                  <a href="https://www.science.org/doi/10.1126/science.aar6404" rel="noreferrer" target="_blank">
                    &ldquo;A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play&rdquo;
                  </a>
                  , <em>Science</em>, 2018.
                </span>
              </li>
              <li>
                <span>
                  The Stockfish team,{" "}
                  <a href="https://github.com/official-stockfish/nnue-pytorch/blob/master/docs/nnue.md" rel="noreferrer" target="_blank">
                    NNUE docs
                  </a>
                  , on the network and its updates.
                </span>
              </li>
              <li>
                <span>
                  The{" "}
                  <a href="https://www.chessprogramming.org/Main_Page" rel="noreferrer" target="_blank">Chess Programming Wiki</a>,
                  where I lost most of a weekend.
                </span>
              </li>
              <li>
                <span>
                  <a href="https://www.youtube.com/@GothamChess" rel="noreferrer" target="_blank">GothamChess</a>, for
                  getting me into this in the first place.
                </span>
              </li>
            </ol>
          </Chunk>
        </Act>

    </NotePage>
  );
}
