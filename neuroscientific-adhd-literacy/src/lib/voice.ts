// MOTOR DE VOZ MANICRAFITI
// -------------------------------------------------------------
// Problemas reais que isto resolve:
// 1. Browsers bloqueiam speechSynthesis até haver um gesto do user.
//    -> unlockVoice() é chamado no primeiro toque em qualquer sítio.
// 2. getVoices() volta vazio no primeiro tick.
//    -> esperamos o evento voiceschanged e guardamos a voz pt-BR.
// 3. Chrome pausa a síntese após ~15s.
//    -> keep-alive com resume().
// 4. Falas sobrepostas.
//    -> fila simples (queue) para o mascote guiar sem se atropelar.

let unlocked = false;
let ptVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;
let keepAlive: ReturnType<typeof setInterval> | null = null;
const pending: { text: string; opts: SpeakOpts }[] = [];

export type SpeakOpts = {
  rate?: number;
  pitch?: number;
  volume?: number;
  interrupt?: boolean;
  onEnd?: () => void;
};

function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  voicesReady = true;
  // Prefere vozes brasileiras infantis/expressivas quando disponíveis.
  ptVoice =
    voices.find(
      (v) => /pt[-_]BR/i.test(v.lang) && /(luciana|thalita|helena|francisca|felipe|antonio|natural)/i.test(v.name)
    ) ||
    voices.find((v) => /pt[-_]BR/i.test(v.lang) && /google/i.test(v.name)) ||
    voices.find((v) => /pt[-_]BR/i.test(v.lang)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null;
}

export function initVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    pickVoice();
    flushPending();
  };
  // Alguns browsers só populam após um tick
  setTimeout(() => {
    pickVoice();
    flushPending();
  }, 300);
}

function flushPending() {
  if (!unlocked || !voicesReady) return;
  while (pending.length) {
    const p = pending.shift()!;
    doSpeak(p.text, p.opts);
  }
}

// Chamado no primeiro gesto do utilizador (toque/clique/tecla).
export function unlockVoice() {
  if (unlocked) return;
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  unlocked = true;
  try {
    // Fala vazia "acorda" o motor de voz sem som audível.
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.lang = "pt-BR";
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
  pickVoice();
  startKeepAlive();
  flushPending();
}

function startKeepAlive() {
  if (keepAlive) return;
  keepAlive = setInterval(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    if (s.speaking && s.paused) s.resume();
  }, 5000);
}

function doSpeak(text: string, opts: SpeakOpts) {
  const s = window.speechSynthesis;
  if (!s) return;
  if (opts.interrupt !== false) s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  // Criança de 6 anos: ritmo um pouco mais lento e tom mais alto/animado.
  u.rate = opts.rate ?? 0.92;
  u.pitch = opts.pitch ?? 1.25;
  u.volume = opts.volume ?? 1;
  if (ptVoice) u.voice = ptVoice;
  if (opts.onEnd) u.onend = () => opts.onEnd!();
  try {
    s.speak(u);
    // Chrome bug: precisa de um resume logo a seguir
    setTimeout(() => {
      if (s.paused) s.resume();
    }, 100);
  } catch {
    opts.onEnd?.();
  }
}

// PRESETS DE EMOÇÃO — o mascote parece VIVO.
// Cada preset define ritmo, tom e "abertura" (exclamações) diferente.
export type Mood =
  | "epic" // início, chamado épico
  | "hype" // acertou! celebração
  | "cheer" // encorajamento suave
  | "boss" // monstro, ameaça
  | "gentle" // erro, acolhimento
  | "story"; // explicação de fase

const MOODS: Record<Mood, SpeakOpts> = {
  epic: { rate: 0.98, pitch: 1.05, volume: 1 },
  hype: { rate: 1.1, pitch: 1.45, volume: 1 },
  cheer: { rate: 1.0, pitch: 1.3, volume: 1 },
  boss: { rate: 0.85, pitch: 0.7, volume: 1 },
  gentle: { rate: 0.9, pitch: 1.15, volume: 0.95 },
  story: { rate: 0.92, pitch: 1.1, volume: 1 },
};

const HYPE_PREFIX = ["Uau!", "Isso!", "Boa!", "Iupi!", "Aê!", "Show!"];
const CHEER_PREFIX = ["Vai!", "Consegue!", "Força!", "Segura!"];
const BOSS_PREFIX = ["Cuidado!", "Uhhh!", "Grrrr!", "Aha!"];

function decorate(text: string, mood?: Mood): string {
  if (!mood) return text;
  const pool =
    mood === "hype" ? HYPE_PREFIX : mood === "cheer" ? CHEER_PREFIX : mood === "boss" ? BOSS_PREFIX : null;
  if (!pool) return text;
  // 60% de chance de adicionar interjeição para não repetir sempre.
  if (Math.random() < 0.6) {
    const pre = pool[Math.floor(Math.random() * pool.length)];
    return `${pre} ${text}`;
  }
  return text;
}

// API principal: o mascote fala.
export function say(text: string, opts: SpeakOpts & { mood?: Mood } = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  if (!text?.trim()) return;
  const final = decorate(text, opts.mood);
  const preset = opts.mood ? MOODS[opts.mood] : {};
  const merged: SpeakOpts = { ...preset, ...opts };
  if (!unlocked || !voicesReady) {
    pending.push({ text: final, opts: merged });
    pickVoice();
    if (unlocked) flushPending();
    return;
  }
  doSpeak(final, merged);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isVoiceReady() {
  return unlocked && voicesReady;
}

// ----------------- SONS DE JOGO (WebAudio, sem ficheiros) -----------------
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.15, delay = 0) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g).connect(a.destination);
  const t = a.currentTime + delay;
  o.start(t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.stop(t + dur);
}

export const sfx = {
  unlock: () => audio(),
  mine: () => tone(180 + Math.random() * 60, 0.09, "square", 0.12),
  break: () => {
    tone(320, 0.08, "square", 0.16);
    tone(220, 0.14, "square", 0.14, 0.06);
  },
  correct: () => {
    tone(523, 0.1, "square", 0.16);
    tone(659, 0.1, "square", 0.16, 0.09);
    tone(784, 0.18, "square", 0.16, 0.18);
  },
  wrong: () => {
    tone(200, 0.16, "sawtooth", 0.14);
    tone(140, 0.22, "sawtooth", 0.12, 0.12);
  },
  levelUp: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "square", 0.16, i * 0.11));
  },
  explode: () => {
    tone(90, 0.35, "sawtooth", 0.2);
    tone(60, 0.5, "sawtooth", 0.18, 0.05);
  },
  click: () => tone(440, 0.05, "square", 0.1),
};
