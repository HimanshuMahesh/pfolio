/**
 * Hima's wake-up sound, synthesised (no file): an airy swell of filtered
 * noise, a glassy major-ninth chord that blooms upward note by note, and a
 * few high sparkles, all through a short generated reverb. Soft and quick,
 * in the spirit of the Apple Intelligence chime rather than a copy of it.
 *
 * Call it from a click or key press: browsers only start audio after one.
 */
let ctx: AudioContext | null = null;
let room: ConvolverNode | null = null;

function setup() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  // A 2.4s room: stereo noise falling away exponentially
  const len = Math.floor(ctx.sampleRate * 2.4);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  room = ctx.createConvolver();
  room.buffer = ir;
  return ctx;
}

export function playChime(volume = 0.5) {
  if (typeof window === "undefined") return;
  const ac = setup();
  if (ac.state === "suspended") void ac.resume();
  const t0 = ac.currentTime + 0.02;

  const out = ac.createGain();
  out.gain.value = volume;
  const dry = ac.createGain();
  dry.gain.value = 0.55;
  const wet = ac.createGain();
  wet.gain.value = 0.7;
  dry.connect(out);
  wet.connect(room!).connect(out);
  out.connect(ac.destination);
  const bus = ac.createGain();
  bus.connect(dry);
  bus.connect(wet);

  // 1. Breath: noise through a band-pass that sweeps upward
  const noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const air = ac.createBufferSource();
  air.buffer = noise;
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(500, t0);
  band.frequency.exponentialRampToValueAtTime(5200, t0 + 0.55);
  const airGain = ac.createGain();
  airGain.gain.setValueAtTime(0.0001, t0);
  airGain.gain.exponentialRampToValueAtTime(0.09, t0 + 0.28);
  airGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
  air.connect(band).connect(airGain).connect(bus);
  air.start(t0);
  air.stop(t0 + 0.85);

  // 2. Bloom: C major 9, rising note by note, each sliding up into pitch
  const chord = [261.63, 392.0, 523.25, 659.25, 987.77, 1174.66];
  chord.forEach((f, i) => {
    const at = t0 + 0.05 + i * 0.045;
    const o = ac.createOscillator();
    o.type = i < 2 ? "triangle" : "sine";
    o.frequency.setValueAtTime(f * 0.985, at);
    o.frequency.exponentialRampToValueAtTime(f, at + 0.12);
    // A twin, a few cents sharp, for shimmer
    const o2 = ac.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 1.004;
    const g = ac.createGain();
    const peak = (i < 2 ? 0.05 : 0.07) / (1 + i * 0.15);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.07);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.5 - i * 0.08);
    o.connect(g);
    o2.connect(g);
    g.connect(bus);
    o.start(at);
    o2.start(at);
    o.stop(at + 1.6);
    o2.stop(at + 1.6);
  });

  // 3. Sparkles: tiny high pings scattered over the top
  [2093, 2637, 3136, 3951].forEach((f, i) => {
    const at = t0 + 0.2 + i * 0.07 + Math.random() * 0.03;
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.018, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
    const pan = ac.createStereoPanner();
    pan.pan.value = (i % 2 ? 1 : -1) * 0.5;
    o.connect(g).connect(pan).connect(bus);
    o.start(at);
    o.stop(at + 0.4);
  });

  // Let the room ring out, then tidy up
  setTimeout(() => out.disconnect(), 4200);
}
