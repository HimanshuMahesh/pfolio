"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { FRAGMENT, VERTEX } from "./HoloCard.shaders";
import styles from "./HoloCard.module.css";

/**
 * A collectible card with holographic foil and glitter that sparkles as it
 * tilts. Ported from React Bits (HoloCard-JS-CSS): WebGL2 draws the foil over
 * the image, a spring leans the card toward the pointer, and it drifts gently
 * when left alone. Without WebGL the plain image still shows.
 */

export const HOLO_PRESETS = ["bursts", "stars", "shards", "cosmos", "rainbow", "swirl", "glitter", "gold"] as const;
export type HoloPreset = (typeof HOLO_PRESETS)[number];

const PERSPECTIVE = 1100;
const CARD_RATIO = 63 / 88;
const UNIFORMS = [
  "uArt", "uSize", "uAspect", "uTilt", "uLight", "uDistance", "uPreset", "uIntensity",
  "uScale", "uEdge", "uFrame", "uRadius", "uGlare", "uFoil", "uReady", "uArea", "uOutside",
] as const;

type Props = {
  image: string;
  alt?: string;
  preset?: HoloPreset;
  /** Foil strength, 0–1. */
  intensity?: number;
  /** Foil pattern size multiplier. */
  scale?: number;
  /** Glitter along the frame, 0–1. */
  edgeSparkle?: number;
  /** Width of the glitter frame, as a percent of the card. */
  frame?: number;
  glare?: number;
  foilColor?: string;
  /** Where the foil shows at full strength, as [x, y, w, h] fractions of the card. */
  foilArea?: [number, number, number, number];
  /** Foil strength outside foilArea, as a fraction of full. */
  foilOutside?: number;
  /** Width as any CSS length. */
  width?: string;
  radius?: number;
  tiltMax?: number;
  hoverScale?: number;
  idle?: boolean;
  shadow?: boolean;
  className?: string;
  style?: CSSProperties;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Any CSS colour, as linear RGB. */
function parseColor(value: string): [number, number, number] {
  const fallback: [number, number, number] = [0.78, 0.8, 0.84];
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return fallback;
  ctx.fillStyle = "#000000";
  ctx.fillStyle = value;
  const hex = ctx.fillStyle;
  if (!hex.startsWith("#") || hex.length !== 7) return fallback;
  const [r, g, b] = [1, 3, 5].map((i) => Math.pow(parseInt(hex.slice(i, i + 2), 16) / 255, 2.2));
  return [r, g, b];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function HoloCard({
  image,
  alt = "",
  preset = "bursts",
  intensity = 0.85,
  scale = 1,
  edgeSparkle = 0.8,
  frame = 4,
  glare = 0.5,
  foilColor = "#e2e6ec",
  foilArea = [0, 0, 1, 1],
  foilOutside = 1,
  width = "320px",
  radius = 14,
  tiltMax = 14,
  hoverScale = 1.04,
  idle = true,
  shadow = true,
  className,
  style,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5, inside: false });
  const wakeRef = useRef<(() => void) | null>(null);
  const loadRef = useRef<((src: string) => void) | null>(null);
  const [ratio, setRatio] = useState(CARD_RATIO);
  const [ready, setReady] = useState(false);

  const settings = {
    preset: Math.max(0, HOLO_PRESETS.indexOf(preset)),
    intensity: clamp(intensity, 0, 1),
    scale: clamp(scale, 0.25, 4),
    edgeSparkle: clamp(edgeSparkle, 0, 1),
    frame: clamp(frame, 0, 20) / 100,
    glare: clamp(glare, 0, 1),
    foilColor,
    area: foilArea,
    outside: clamp(foilOutside, 0, 1),
    radius: Math.max(0, radius),
    tiltMax: clamp(tiltMax, 0, 45),
    hoverScale: clamp(hoverScale, 0.8, 1.3),
    idle,
  };
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
    wakeRef.current?.();
  });

  useEffect(() => {
    loadRef.current?.(image);
  }, [image]);

  useEffect(() => {
    const root = rootRef.current;
    const rotor = rotorRef.current;
    const canvas = canvasRef.current;
    if (!root || !rotor || !canvas) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    let program: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let buffer: WebGLBuffer | null = null;
    const u = {} as Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;
    let textureReady = false;
    let foilColorKey = "";
    let foil: [number, number, number] = [0.78, 0.8, 0.84];

    if (gl) {
      const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      if (vertex && fragment) {
        program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.bindAttribLocation(program, 0, "position");
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          gl.deleteProgram(program);
          program = null;
        }
      }
      if (program) {
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        for (const name of UNIFORMS) u[name] = gl.getUniformLocation(program, name);
      }
    }

    const state = {
      tiltX: 0, tiltY: 0, tiltVX: 0, tiltVY: 0,
      lightX: 0.36, lightY: 0.26, lightVX: 0, lightVY: 0,
      lift: 1, liftV: 0,
      clock: Math.random() * 40,
    };
    let raf = 0;
    let last = 0;
    let visible = true;
    let alive = true;
    let calm = 0;

    const draw = () => {
      if (!gl || !program) return;
      const s = settingsRef.current;
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;
      if (s.foilColor !== foilColorKey) {
        foilColorKey = s.foilColor;
        foil = parseColor(s.foilColor);
      }
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(u.uArt, 0);
      gl.uniform2f(u.uSize, w, h);
      gl.uniform1f(u.uAspect, h / w);
      gl.uniform2f(u.uTilt, (state.tiltX * Math.PI) / 180, (state.tiltY * Math.PI) / 180);
      gl.uniform2f(u.uLight, state.lightX, state.lightY);
      gl.uniform1f(u.uDistance, PERSPECTIVE / Math.max(1, canvas.clientWidth));
      gl.uniform1i(u.uPreset, s.preset);
      gl.uniform1f(u.uIntensity, s.intensity);
      gl.uniform1f(u.uScale, s.scale);
      gl.uniform1f(u.uEdge, s.edgeSparkle);
      gl.uniform1f(u.uFrame, s.frame);
      gl.uniform1f(u.uRadius, s.radius / Math.max(1, canvas.clientWidth));
      gl.uniform1f(u.uGlare, s.glare);
      gl.uniform3f(u.uFoil, foil[0], foil[1], foil[2]);
      gl.uniform1f(u.uReady, textureReady ? 1 : 0);
      gl.uniform4f(u.uArea, s.area[0], s.area[1], s.area[2], s.area[3]);
      gl.uniform1f(u.uOutside, s.outside);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const spring = (value: number, velocity: number, target: number, stiffness: number, damping: number, dt: number) => {
      const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next] as const;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      const s = settingsRef.current;
      const pointer = pointerRef.current;
      let targetX = 0;
      let targetY = 0;
      let lightX = 0.36;
      let lightY = 0.26;
      let lift = 1;
      const drifting = s.idle && !reduce && !pointer.inside;
      if (pointer.inside && !reduce) {
        targetX = (0.5 - pointer.y) * 2 * s.tiltMax;
        targetY = (pointer.x - 0.5) * 2 * s.tiltMax;
        lightX = pointer.x;
        lightY = pointer.y;
        lift = s.hoverScale;
      } else if (drifting) {
        state.clock += dt;
        const t = state.clock;
        targetX = Math.sin(t * 0.7) * s.tiltMax * 0.28;
        targetY = Math.sin(t * 0.53 + 1.2) * s.tiltMax * 0.4;
        lightX = 0.5 + Math.sin(t * 0.41) * 0.42;
        lightY = 0.38 + Math.sin(t * 0.33 + 0.6) * 0.3;
      }
      const steps = Math.ceil(dt / (1 / 240));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        [state.tiltX, state.tiltVX] = spring(state.tiltX, state.tiltVX, targetX, 150, 16, h);
        [state.tiltY, state.tiltVY] = spring(state.tiltY, state.tiltVY, targetY, 150, 16, h);
        [state.lightX, state.lightVX] = spring(state.lightX, state.lightVX, lightX, 220, 30, h);
        [state.lightY, state.lightVY] = spring(state.lightY, state.lightVY, lightY, 220, 30, h);
        [state.lift, state.liftV] = spring(state.lift, state.liftV, lift, 320, 30, h);
      }
      rotor.style.transform = `perspective(${PERSPECTIVE}px) scale(${state.lift}) rotateX(${state.tiltX}deg) rotateY(${state.tiltY}deg)`;
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate(${-state.tiltY * 0.7}px, ${state.tiltX * 0.7}px) scale(${0.9 + (state.lift - 1) * 1.5})`;
      }
      draw();
      const motion =
        Math.abs(state.tiltVX) +
        Math.abs(state.tiltVY) +
        Math.abs(state.liftV) * 40 +
        (Math.abs(state.lightVX) + Math.abs(state.lightVY)) * 60 +
        Math.abs(state.tiltX - targetX) +
        Math.abs(state.tiltY - targetY);
      calm = motion > 0.02 ? 0 : calm + dt;
      if (!visible || (!drifting && !pointer.inside && calm > 0.3)) return;
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !alive) return;
      calm = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      draw();
      wake();
    };

    loadRef.current = (src) => {
      textureReady = false;
      setReady(false);
      if (!src) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        if (!alive) return;
        if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
        if (!gl || !program) return;
        try {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          textureReady = true;
          setReady(true);
          draw();
          wake();
        } catch {
          textureReady = false;
        }
      };
      img.src = src;
    };
    loadRef.current(image);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) wake();
    });
    visibility.observe(root);
    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      loadRef.current = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      if (gl) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const track = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && e.type === "pointermove" && !e.buttons) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
      inside: true,
    };
    wakeRef.current?.();
  };

  const leave = () => {
    pointerRef.current = { ...pointerRef.current, inside: false };
    wakeRef.current?.();
  };

  return (
    <div
      ref={rootRef}
      className={className ? `${styles.card} ${className}` : styles.card}
      role="img"
      aria-label={alt || undefined}
      data-ready={ready || undefined}
      onPointerEnter={track}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={leave}
      onPointerCancel={leave}
      style={{ "--hc-w": width, "--hc-ratio": ratio, "--hc-radius": `${radius}px`, ...style } as CSSProperties}
    >
      {shadow && <span ref={shadowRef} className={styles.shadow} aria-hidden="true" />}
      <div ref={rotorRef} className={styles.rotor}>
        <div className={styles.face}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a generated data URL, shown until the foil is drawn */}
          <img src={image} alt="" draggable={false} />
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
