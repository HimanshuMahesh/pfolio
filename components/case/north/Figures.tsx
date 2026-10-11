import * as sk from "@/lib/sketch";
import { Arrow, Box, Curve, Cylinder, Dot, Note, Sketch, Stroke, Tag } from "@/components/case/Sketch";

/* Every figure on /work/north. Coordinates are hand-placed in each viewBox. */

/** The Double Diamond, with where North went round twice. */
export function DoubleDiamond() {
  const r = sk.rng(7);
  const cy = 170;
  const ry = 105;
  const phases = [
    { x: 150, n: "01", name: "Discover" },
    { x: 370, n: "02", name: "Define" },
    { x: 590, n: "03", name: "Develop" },
    { x: 810, n: "04", name: "Deliver" },
  ];
  return (
    <Sketch w={960} h={320} label="The Double Diamond: discover, define, develop, deliver. North went through develop and deliver twice.">
      <Stroke d={sk.diamond(260, cy, 220, ry, r)} />
      <Stroke d={sk.diamond(700, cy, 220, ry, r)} green />
      {/* diverge | converge split inside each diamond */}
      <Stroke d={sk.line(260, cy - ry + 14, 260, cy + ry - 14, r)} dashed faint />
      <Stroke d={sk.line(700, cy - ry + 14, 700, cy + ry - 14, r)} dashed faint />

      {phases.map((p) => (
        <g key={p.n}>
          <Tag x={p.x} y={cy - 12} anchor="middle">{p.n}</Tag>
          <text x={p.x} y={cy + 10} textAnchor="middle" style={{ font: "500 16px var(--font-sans)", fill: "var(--dg-text)" }}>
            {p.name}
          </text>
        </g>
      ))}

      <Dot x={40} y={cy} ink />
      <Dot x={480} y={cy} ink />
      <Dot x={920} y={cy} filled />
      <Note x={40} y={cy + 36} anchor="start">a hunch</Note>
      <Note x={480} y={cy - 40} anchor="middle">the problem, framed</Note>
      <Note x={920} y={cy + 36} anchor="end">North v2</Note>
      <Tag x={150} y={cy + 128} anchor="middle">diverge</Tag>
      <Tag x={370} y={cy + 128} anchor="middle">converge</Tag>
      <Tag x={590} y={cy + 128} anchor="middle">diverge</Tag>
      <Tag x={810} y={cy + 128} anchor="middle">converge</Tag>

      {/* the second lap */}
      <Curve p0={[872, 132]} c={[700, -40]} p1={[528, 132]} dashed />
      <Note x={700} y={30} anchor="middle">v1 shipped, got a blunt review, went round again</Note>
    </Sketch>
  );
}

/** Upload once, then every question runs through the graph. */
export function SystemMap() {
  return (
    <Sketch w={960} h={340} label="System map: a bank CSV is normalised, categorised and stored. Each chat question goes to a set of agents that read the stored data, call a model, and stream the reply back to the chat.">
      <Note x={40} y={34} faint>once, on upload</Note>
      <Box x={40} y={52} w={140} h={60} title="statement.csv" sub="your bank export" />
      <Box x={240} y={52} w={160} h={60} title="normalise" sub="pandas · dates, amounts" tone="py" />
      <Box x={460} y={52} w={200} h={60} title="categorise" sub={["known merchants first,", "a model for the rest"]} tone="llm" />
      <Cylinder cx={820} y={42} w={170} h={96} title="database" sub="transactions + memory" />
      <Arrow pts={[[180, 82], [240, 82]]} />
      <Arrow pts={[[400, 82], [460, 82]]} />
      <Arrow pts={[[660, 82], [735, 82]]} />

      <Note x={40} y={208} faint>every question</Note>
      <Box x={40} y={226} w={150} h={70} title="chat UI" sub="React 19" />
      <Box x={380} y={220} w={250} h={82} title="agents" sub={["router + specialists"]} tone="llm" />
      <Box x={740} y={226} w={170} h={70} title="models" sub={["fast, small, deep"]} />

      <Arrow pts={[[190, 246], [380, 246]]} label="a question" at={[285, 238]} />
      <Arrow pts={[[380, 280], [190, 280]]} dashed label="streamed reply + steps" at={[285, 302]} />
      <Arrow pts={[[630, 261], [740, 261]]} />
      <Arrow pts={[[820, 140], [820, 176], [505, 176], [505, 220]]} label="report · memory · goals" at={[662, 170]} />
    </Sketch>
  );
}

/** Three layers of memory, from this turn to everything. */
export function MemoryLayers() {
  return (
    <Sketch w={960} h={300} label="Memory: working memory for this turn, episodic memory of recent turns, and semantic memory, a compressed summary plus vector search over past turns. Summary and similar turns are loaded first on every question.">
      <Curve p0={[800, 104]} c={[480, -34]} p1={[162, 104]} />
      <Note x={480} y={66} anchor="middle">loaded first, every turn: the summary + the 3 most similar past turns</Note>

      <Box x={40} y={108} w={240} h={92} title="working" sub={["this question,", "while it runs"]} />
      <Box x={360} y={108} w={240} h={92} title="episodic" sub={["recent turns,", "word for word"]} tone="py" />
      <Box x={680} y={108} w={240} h={92} title="semantic" sub={["goals, facts,", "decisions"]} tone="llm" />
      <Arrow pts={[[280, 154], [360, 154]]} label="each turn" at={[320, 146]} />
      <Arrow pts={[[600, 154], [680, 154]]} label="after 10 turns" at={[640, 146]} />
      <Note x={640} y={180} anchor="middle" faint>summarised</Note>

      <Arrow pts={[[40, 246], [920, 246]]} />
      <Tag x={40} y={272}>seconds</Tag>
      <Tag x={480} y={272} anchor="middle">days</Tag>
      <Tag x={920} y={272} anchor="end">months</Tag>
    </Sketch>
  );
}

type Item = { label: string; effort: number; impact: number; state: "shipped" | "next"; below?: boolean; left?: boolean };

const backlog: Item[] = [
  { label: "give it a voice", effort: 0.07, impact: 0.84, state: "shipped" },
  { label: "three-layer memory", effort: 0.3, impact: 0.88, state: "shipped" },
  { label: "spending archetype", effort: 0.16, impact: 0.66, state: "shipped" },
  { label: "goals page", effort: 0.44, impact: 0.74, state: "shipped" },
  { label: "type-a-spend entry", effort: 0.4, impact: 0.56, state: "shipped" },
  { label: "challenge mode", effort: 0.24, impact: 0.42, state: "shipped" },
  { label: "weekly summary", effort: 0.36, impact: 0.3, state: "shipped" },
  { label: "evals + feedback", effort: 0.58, impact: 0.8, state: "next" },
  { label: "deploy it", effort: 0.66, impact: 0.86, state: "next" },
  { label: "a real confirmation gate", effort: 0.62, impact: 0.58, state: "next" },
  { label: "bank import (Account Aggregator)", effort: 0.92, impact: 0.96, state: "next", left: true, below: true },
];

/** Impact against effort: where the backlog landed. */
export function ImpactEffort() {
  const r = sk.rng(11);
  const X0 = 90;
  const X1 = 920;
  const Y0 = 30;
  const Y1 = 460;
  const px = (e: number) => X0 + e * (X1 - X0);
  const py = (i: number) => Y1 - i * (Y1 - Y0);
  const mx = px(0.5);
  const my = py(0.5);
  return (
    <Sketch w={960} h={520} label="Impact versus effort chart of North's backlog. Shipped: voice, memory, archetype, goals, natural-language entry, challenge mode, weekly summary. Next: evals, deploying, a real confirmation gate. Later: bank import through Account Aggregator.">
      <Arrow pts={[[X0, Y1 + 8], [X0, Y0 - 8]]} />
      <Arrow pts={[[X0 - 8, Y1], [X1 + 8, Y1]]} />
      <Stroke d={sk.line(mx, Y0, mx, Y1 - 6, r)} dashed faint />
      <Stroke d={sk.line(X0 + 6, my, X1, my, r)} dashed faint />
      <Tag x={X0 - 18} y={(Y0 + Y1) / 2} anchor="middle" rotate={-90}>impact</Tag>
      <Tag x={mx} y={Y1 + 30} anchor="middle">effort</Tag>

      <Note x={X0 + 14} y={Y0 + 18} faint>quick wins</Note>
      <Note x={mx + 14} y={Y0 + 18} faint>big bets</Note>
      <Note x={X0 + 14} y={Y1 - 14} faint>fill-ins</Note>
      <Note x={X1 - 6} y={Y1 - 14} anchor="end" faint>money pits</Note>

      {backlog.map((it) => {
        const x = px(it.effort);
        const y = py(it.impact);
        return (
          <g key={it.label}>
            <Dot x={x} y={y} filled={it.state === "shipped"} />
            <text
              x={it.left ? x - 12 : x + 12}
              y={it.below ? y + 24 : y + 4}
              textAnchor={it.left ? "end" : "start"}
              style={{ font: "400 12px var(--font-sans)", fill: "var(--dg-text)" }}
            >
              {it.label}
            </text>
          </g>
        );
      })}

      <Dot x={700} y={500} filled />
      <Note x={712} y={505} size={14} faint>shipped</Note>
      <Dot x={800} y={500} />
      <Note x={812} y={505} size={14} faint>next</Note>
    </Sketch>
  );
}

/** The main path through the product, and what a chat turn can hand back. */
export function UserFlow() {
  const steps = [
    { x: 15, title: "import", sub: ["drop a bank CSV"] },
    { x: 210, title: "preview", sub: ["columns found,", "add or replace"] },
    { x: 405, title: "processing", sub: ["five steps, ticked", "off as they run"] },
    { x: 600, title: "dashboard", sub: ["archetype, health,", "then the leaks"] },
    { x: 795, title: "chat", sub: ["ask in plain words"] },
  ];
  return (
    <Sketch w={960} h={270} label="User flow: import a CSV, preview it, watch processing, land on the dashboard, then chat. The dashboard drills into subscriptions and transactions. A chat turn returns an answer with a chart, a goal card, or a confirmation card.">
      {steps.map((st, i) => (
        <g key={st.title}>
          <Box x={st.x} y={30} w={150} h={70} title={st.title} sub={st.sub} tone={st.title === "chat" ? "llm" : "plain"} />
          {i < steps.length - 1 && <Arrow pts={[[st.x + 150, 65], [st.x + 195, 65]]} />}
        </g>
      ))}
      <Note x={90} y={124} anchor="middle">the only setup step</Note>

      {/* dashboard drills down */}
      <Arrow pts={[[640, 100], [640, 138], [380, 138], [380, 180]]} />
      <Box x={290} y={180} w={180} h={62} title="drill-downs" sub={["subscriptions,", "transactions"]} />

      {/* what a chat turn can return */}
      <Arrow pts={[[870, 100], [870, 150]]} head={false} />
      <Arrow pts={[[555, 150], [870, 150]]} head={false} />
      <Arrow pts={[[555, 150], [555, 180]]} />
      <Arrow pts={[[715, 150], [715, 180]]} />
      <Arrow pts={[[870, 150], [870, 180]]} />
      <Box x={490} y={180} w={130} h={62} title="answer" sub={["text, chart,", "the trace"]} />
      <Box x={645} y={180} w={140} h={62} title="goal card" sub={["suggested,", "one tap to keep"]} />
      <Box x={805} y={180} w={140} h={62} title="confirm card" sub={["before any", "write happens"]} />
    </Sketch>
  );
}
