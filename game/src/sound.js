// sound.js — every sound is synthesized with WebAudio oscillators, so the game
// ships no audio files and makes no network request. Call unlock() from the
// first user gesture; every effect is a short envelope, never a loop.
let ctx = null;
let muted = false;

export function unlock() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; return muted; }

function tone(freq, startAt, duration, type = 'sine', volume = 0.12) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

export function playFind(combo = 1) {
  // A bright two-note chime that climbs a little with the combo.
  const base = 660 + Math.min(combo, 6) * 40;
  tone(base, 0, 0.18, 'sine', 0.14);
  tone(base * 1.5, 0.09, 0.28, 'sine', 0.12);
}

export function playWrong() {
  tone(160, 0, 0.22, 'sawtooth', 0.06);
  tone(110, 0.05, 0.25, 'sawtooth', 0.05);
}

export function playHint() {
  tone(880, 0, 0.12, 'triangle', 0.08);
  tone(1174, 0.1, 0.2, 'triangle', 0.08);
}

export function playWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.32, 'sine', 0.13));
}

export function playLose() {
  [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.09));
}

export function playClick() {
  tone(520, 0, 0.06, 'triangle', 0.05);
}

export function playTick() {
  tone(980, 0, 0.05, 'square', 0.03);
}
