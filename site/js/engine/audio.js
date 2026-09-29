// Tiny WebAudio chiptune engine: square/triangle blips and an original looping theme.
let ac = null;
let master = null;
let musicGain = null;
let musicTimer = null;
let enabled = true;

function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.18;
    master.connect(ac.destination);
    musicGain = ac.createGain();
    musicGain.gain.value = 0.5;
    musicGain.connect(master);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function tone(freq, start, dur, type = 'square', vol = 0.6, dest = null) {
  const a = ctx();
  if (!a || !enabled) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(start);
  o.stop(start + dur + 0.02);
}

const N = (n) => 440 * 2 ** ((n - 69) / 12);

export const sfx = {
  blip() {
    const a = ctx();
    if (a) tone(N(84), a.currentTime, 0.03, 'square', 0.15);
  },
  select() {
    const a = ctx();
    if (!a) return;
    tone(N(76), a.currentTime, 0.06);
    tone(N(83), a.currentTime + 0.06, 0.08);
  },
  back() {
    const a = ctx();
    if (!a) return;
    tone(N(72), a.currentTime, 0.06);
    tone(N(65), a.currentTime + 0.06, 0.08);
  },
  bump() {
    const a = ctx();
    if (a) tone(N(40), a.currentTime, 0.08, 'triangle', 0.5);
  },
  door() {
    const a = ctx();
    if (!a) return;
    [60, 64, 67, 72].forEach((n, i) => tone(N(n), a.currentTime + i * 0.05, 0.1, 'square', 0.35));
  },
  chime() {
    const a = ctx();
    if (!a) return;
    tone(N(88), a.currentTime, 0.12, 'square', 0.4);
    tone(N(100), a.currentTime + 0.1, 0.6, 'square', 0.4);
  },
  card() {
    const a = ctx();
    if (!a) return;
    [72, 76, 79, 84, 79, 84, 88].forEach((n, i) => tone(N(n), a.currentTime + i * 0.08, 0.14, 'square', 0.4));
  },
  fanfare() {
    const a = ctx();
    if (!a) return;
    const seq = [67, 67, 67, 72, null, 76, 74, 76, 79];
    seq.forEach((n, i) => n && tone(N(n), a.currentTime + i * 0.13, i === seq.length - 1 ? 0.8 : 0.12, 'square', 0.45));
  },
  bark() {
    const a = ctx();
    if (!a) return;
    tone(N(55), a.currentTime, 0.06, 'sawtooth', 0.4);
    tone(N(50), a.currentTime + 0.12, 0.08, 'sawtooth', 0.4);
  },
};

// Original 8-bar theme ("Barcelona Tech Coast"), 16th-note grid.
const LEAD = [
  76, null, 79, null, 84, null, 83, 81, 79, null, 76, null, 74, null, 76, null,
  77, null, 81, null, 84, null, 83, 81, 79, null, null, null, 76, 77, 79, null,
  76, null, 79, null, 84, null, 86, 88, 86, null, 84, null, 81, null, 79, null,
  77, null, 76, null, 74, null, 77, 76, 72, null, null, null, null, null, null, null,
];
const BASS = [48, 55, 57, 53, 48, 55, 53, 55];

export function startMusic() {
  const a = ctx();
  if (!a || musicTimer || !enabled) return;
  const step = 60 / 132 / 2;
  let i = 0;
  let next = a.currentTime + 0.1;
  musicTimer = setInterval(() => {
    while (next < a.currentTime + 0.3) {
      const n = LEAD[i % LEAD.length];
      if (n) tone(N(n), next, step * 0.9, 'square', 0.22, musicGain);
      if (i % 8 === 0) tone(N(BASS[Math.floor(i / 8) % BASS.length]), next, step * 7, 'triangle', 0.6, musicGain);
      if (i % 4 === 2) tone(N(96), next, 0.02, 'square', 0.05, musicGain);
      next += step;
      i++;
    }
  }, 80);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

export function setSound(on) {
  enabled = on;
  if (!on) stopMusic();
}

export function soundEnabled() {
  return enabled;
}

export function unlockAudio() {
  ctx();
}
