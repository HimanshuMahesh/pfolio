"use client";

import { useState } from "react";
import { cx } from "@/lib/grid";
import styles from "@/components/notes/Article.module.css";
import { Stepper } from "./Stepper";
import { Plate } from "./Plate";

/* The note's diagram figures: a square plate like the drawings, with a label
   row, the figure, a stepped slider, a hint and a readout. Monochrome, on the
   site's ink tokens. */

/* ---- Fig: alpha-beta on a small tree ----------------------------------------- */
const LEAVES = [[3, 12, 8], [2, 4, 6], [14, 5, 2]];
/** Which leaves alpha-beta never looks at, searching left to right. */
const CUT = [[false, false, false], [false, true, true], [false, false, false]];

export function PruningTree({ fig }: { fig: string }) {
  const [mode, setMode] = useState(1);
  const ab = mode === 1;
  const mins = LEAVES.map((l, k) => (ab && k === 1 ? 2 : Math.min(...l)));
  const W = 400, H = 300;
  const root = { x: 200, y: 50 };
  const mids = [70, 200, 330].map((x) => ({ x, y: 140 }));
  const leafX = (k: number, j: number) => mids[k].x - 38 + j * 38;
  const visited = ab ? 7 : 9;
  return (
    <Plate
      fig={fig}
      title="Minimax, then alpha-beta"
      hint="Step to prune"
      readout={`${visited} of 9 leaves · value 3`}
      caption="My move (top, max) chooses among three replies (min). Minimax checks all nine leaves. Alpha-beta knows after the first branch that it can get 3; the moment the second branch shows a 2, that branch can only be worse, so its last two leaves are never searched. Same answer, less work."
      control={<Stepper label="Search" stops={["Minimax", "Alpha-beta"]} value={mode} onChange={setMode} />}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} role="img" aria-label="A two-level game tree with nine leaves. Alpha-beta skips two leaves in the middle branch.">
        {mids.map((m, k) => (
          <g key={k}>
            <line x1={root.x} y1={root.y + 14} x2={m.x} y2={m.y - 14} className={styles.edge} />
            {LEAVES[k].map((v, j) => {
              const cut = ab && CUT[k][j];
              return (
                <g key={j} className={cut ? styles.cut : undefined}>
                  <line x1={m.x} y1={m.y + 14} x2={leafX(k, j)} y2={226} className={styles.edge} />
                  <rect x={leafX(k, j) - 14} y={226} width={28} height={28} rx={4} className={styles.node} />
                  <text x={leafX(k, j)} y={245} textAnchor="middle" className={styles.val}>{cut ? "·" : v}</text>
                </g>
              );
            })}
            <circle cx={m.x} cy={m.y} r={14} className={cx(styles.node, k === 0 && styles.nodeOn)} />
            <text x={m.x} y={m.y + 5} textAnchor="middle" className={styles.val}>{k === 1 && ab ? "≤2" : mins[k]}</text>
          </g>
        ))}
        <circle cx={root.x} cy={root.y} r={16} className={cx(styles.node, styles.nodeOn)} />
        <text x={root.x} y={root.y + 5} textAnchor="middle" className={styles.val}>3</text>
        <text x={root.x + 26} y={root.y + 4} className={styles.tick}>max · me</text>
        <text x={mids[2].x + 22} y={mids[2].y + 4} className={styles.tick}>min</text>
        {ab && <text x={200} y={280} textAnchor="middle" className={styles.tick}>pruned: 2 &lt; 3, nothing here can change the choice</text>}
      </svg>
    </Plate>
  );
}
