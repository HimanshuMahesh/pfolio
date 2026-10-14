// Accent palettes for the wishlist figures. Each object keeps one signature
// colour on its key part (stones, gem, fluid, door, shell); everything else is
// drawn in the carry strip's pencil tones. A tinted part is wrapped in
// `tint(name, markup)`, which re-points the kit's tone variables for that group,
// so the part keeps the kit's four-tone shading in its own hue.

const TINTS = {
  green: {
    dark: ["#071a0d", "#0b2513", "#10311a", "#153e21", "#1a4a28", "#8dffad", "#43b86a", "#2a6e40", "#1b4529"],
    light: ["#9fd9b0", "#b5e3c2", "#c9ecd3", "#dbf3e2", "#e9f8ee", "#0f5c2a", "#2f8a4d", "#7cc596", "#b7e1c4"],
  },
  pink: {
    dark: ["#2a0f1c", "#361426", "#431a30", "#50203a", "#5e2644", "#ff9cc8", "#c45c8c", "#7a3557", "#4a2236"],
    light: ["#f2a6c6", "#f5b8d2", "#f8cadd", "#fbdbe8", "#fde8f1", "#8a1c4e", "#c2477f", "#e79ab9", "#f3c6d8"],
  },
  pearl: {
    dark: ["#3a3a3e", "#4a4a4f", "#5c5c62", "#6e6e74", "#7e7e85", "#f4f4ef", "#b9b9b4", "#77777a", "#4a4a4e"],
    light: ["#cfcfd4", "#dcdce0", "#e8e8eb", "#f2f2f4", "#fafafa", "#222220", "#8a8983", "#b5b4ad", "#d5d4cd"],
  },
  red: {
    dark: ["#2a0b0d", "#3a0f12", "#4a1418", "#5a191e", "#6a1e24", "#ff9a9a", "#c4484f", "#7a2a2f", "#4a1c20"],
    light: ["#b8323a", "#c8424a", "#d6575e", "#e26e74", "#ec888d", "#5a0a0e", "#9a1f26", "#d9767b", "#efb3b6"],
  },
  gold: {
    dark: ["#2a1f08", "#3a2b0b", "#4a370f", "#5a4313", "#6a5017", "#ffd77a", "#c49a3a", "#7a5e22", "#4a3a18"],
    light: ["#c9a23c", "#d6b252", "#e2c46d", "#ecd58c", "#f4e4ae", "#5a400a", "#94701e", "#d8bd78", "#ecdcae"],
  },
  steel: {
    dark: ["#141518", "#1a1c20", "#212329", "#282b31", "#30343b", "#dfe3ea", "#8a919c", "#4a4f58", "#2e3238"],
    light: ["#3a3d44", "#4a4e56", "#5b5f68", "#6c717b", "#80858f", "#111214", "#3c4048", "#9aa0aa", "#c4c8cf"],
  },
  purple: {
    dark: ["#170f33", "#1f1542", "#281b52", "#312262", "#3a2972", "#c2b0ff", "#7c66d6", "#4a3a8a", "#2e2556"],
    light: ["#a99ae6", "#bbaeed", "#cdc3f3", "#ded6f8", "#ece7fb", "#3b2a8f", "#6a56c9", "#b4a8ea", "#d6cff5"],
  },
};

/** Flat colours: the stones, the gem, the fluid, the buttons. Same in both themes, with a glow per theme. */
const FLAT = {
  power: "#a855f7",
  space: "#3b82f6",
  reality: "#ef4444",
  soul: "#f59e0b",
  mind: "#facc15",
  time: "#22c55e",
  lantern: "#3ddc6e",
  red: "#e5484d",
};

function tintCss(theme) {
  return Object.entries(TINTS)
    .map(([name, sets]) => {
      const [s0, s1, s2, s3, top, hi, mid, lo, faint] = sets[theme];
      return `.wl-${name}{--anatomy-paper:${s0};--anatomy-face:${top};--anatomy-top:${top};--anatomy-shade-0:${s0};--anatomy-shade-1:${s1};--anatomy-shade-2:${s2};--anatomy-shade-3:${s3};--anatomy-lit-top:${top};--anatomy-lit-shade:${s3};--anatomy-hi:${hi};--anatomy-mid:${mid};--anatomy-lo:${lo};--anatomy-faint:${faint}}`;
    })
    .join("");
}

const FLAT_CSS = Object.entries(FLAT)
  .map(([name, c]) => `.wl-c-${name}{fill:${c};stroke:none}`)
  .join("");

/** Per-theme CSS for `write(…, { themes })`. */
export const THEMES = {
  dark: `${tintCss("dark")}${FLAT_CSS}.wl-white{fill:#f4f4ef;stroke:none}.wl-mark{fill:none;stroke:#f4f4ef;stroke-linecap:round;stroke-linejoin:round}`,
  light: `${tintCss("light")}${FLAT_CSS}.wl-white{fill:#ffffff;stroke:none}.wl-mark{fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round}`,
};

export const COLOURS = FLAT;

/** Wraps markup so its solids and lines take an accent's tones. */
export const tint = (name, markup) => `<g class="wl-${name}">${markup}</g>`;
