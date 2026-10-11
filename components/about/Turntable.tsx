import styles from "./Turntable.module.css";

/**
 * A turntable seen from above, filling its cell. The deck is a square stage
 * (the largest that fits), so every part is placed in % of one box and the
 * tonearm SVG shares its 100 × 100 coordinates.
 *
 * Platter centre (44, 46), r 40; record r ≈ 36.5; the stylus sits in the
 * lead-in grooves at (63, 66.5). The record turns at 33⅓ rpm (1.8 s a turn)
 * while its reflections stay put, which is what sells the spin.
 */
export function Turntable() {
  return (
    <div className={styles.deck} role="img" aria-label="A record player, playing">
      <div className={styles.stage}>
        <div className={styles.platter}>
          <div className={styles.record}>
            <div className={styles.label}>
              <span>SIDE A</span>
              <span>33⅓</span>
            </div>
          </div>
          <div className={styles.sheen} />
          <div className={styles.spindle} />
        </div>

        <svg viewBox="0 0 100 100" className={styles.arm} aria-hidden="true">
          <defs>
            <linearGradient id="tt-steel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f4f6" />
              <stop offset="0.45" stopColor="#a9aab0" />
              <stop offset="0.7" stopColor="#e2e3e6" />
              <stop offset="1" stopColor="#7c7d83" />
            </linearGradient>
            <radialGradient id="tt-base" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#3a3a3f" />
              <stop offset="1" stopColor="#141416" />
            </radialGradient>
            <filter id="tt-lift" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.1" dy="1.8" stdDeviation="0.9" floodColor="#000" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* arm rest */}
          <circle cx="93" cy="57" r="2.4" fill="url(#tt-base)" stroke="#000" strokeOpacity="0.5" strokeWidth="0.3" />
          <path d="M91.6 56.2h2.8" stroke="#8e8f95" strokeWidth="0.8" strokeLinecap="round" />

          {/* pivot housing */}
          <circle cx="87" cy="17" r="7.6" fill="url(#tt-base)" stroke="#000" strokeOpacity="0.6" strokeWidth="0.4" />
          <circle cx="87" cy="17" r="7.6" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.4" />

          <g filter="url(#tt-lift)">
            {/* counterweight, behind the pivot, knurled */}
            <line x1="88.1" y1="12.4" x2="90" y2="4.4" stroke="url(#tt-steel)" strokeWidth="5.4" />
            <line
              x1="88.4"
              y1="11"
              x2="89.8"
              y2="5.2"
              stroke="#000"
              strokeOpacity="0.28"
              strokeWidth="5.4"
              strokeDasharray="0.3 0.5"
            />
            <line x1="88.3" y1="11.4" x2="88.55" y2="10.4" stroke="#1a1a1c" strokeWidth="5.6" />
            {/* S-shaped arm tube */}
            <path
              d="M87 17 L81.5 40 Q79 51 70.5 59.5"
              fill="none"
              stroke="url(#tt-steel)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* headshell + cartridge + finger lift */}
            <g transform="rotate(44 66.2 63.6)">
              <rect x="63.4" y="59.4" width="5.6" height="8.6" rx="0.8" fill="#1c1c1f" stroke="#c9cace" strokeWidth="0.35" />
              <rect x="64.4" y="62.6" width="3.6" height="4.4" rx="0.4" fill="#2d2d31" />
              <path d="M69 61.2l2.6 0.6" stroke="url(#tt-steel)" strokeWidth="0.7" strokeLinecap="round" />
            </g>
            {/* gimbal cap */}
            <circle cx="87" cy="17" r="3.8" fill="url(#tt-steel)" />
            <circle cx="87" cy="17" r="1.2" fill="#2a2a2e" />
          </g>
        </svg>

        {/* Controls: keys sit in recessed wells; 33 is latched in */}
        <span className={`${styles.well} ${styles.start}`}>
          <i className={styles.key}>START·STOP</i>
        </span>
        <span className={`${styles.led} ${styles.led33}`} />
        <span className={`${styles.well} ${styles.speed} ${styles.s33}`}>
          <i className={`${styles.key} ${styles.pressed}`}>33</i>
        </span>
        <span className={`${styles.well} ${styles.speed} ${styles.s45}`}>
          <i className={styles.key}>45</i>
        </span>

        <span className={styles.fader}>
          <span className={styles.slot} />
          <span className={styles.knob} />
        </span>
      </div>
    </div>
  );
}
