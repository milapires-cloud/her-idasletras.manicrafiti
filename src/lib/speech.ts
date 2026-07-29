// RECONHECIMENTO DE FALA (pt-BR) — a criança responde FALANDO.
// Ela tem 6 anos e não sabe escrever: tudo se resolve pela voz.
//
// Notas técnicas importantes:
// - Web Speech API só existe em Chrome/Edge/Safari. Fazemos fallback.
// - A fala infantil é imprecisa: usamos correspondência TOLERANTE
//   (normalização + variantes fonéticas + distância de edição).

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export type ListenHandle = { stop: () => void };

export function listen(opts: {
  onResult: (transcript: string, alternatives: string[]) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
  timeoutMs?: number;
}): ListenHandle {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError?.("unsupported");
    return { stop: () => {} };
  }
  const rec = new Ctor();
  rec.lang = "pt-BR";
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 5;

  let done = false;
  const timer = setTimeout(() => {
    if (!done) {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    }
  }, opts.timeoutMs ?? 7000);

  rec.onstart = () => opts.onStart?.();
  rec.onresult = (e) => {
    done = true;
    clearTimeout(timer);
    const alts: string[] = [];
    const last = e.results[e.results.length - 1];
    for (let i = 0; i < last.length; i++) alts.push(last[i].transcript);
    opts.onResult(alts[0] ?? "", alts);
  };
  rec.onerror = (e) => {
    clearTimeout(timer);
    opts.onError?.(e.error);
  };
  rec.onend = () => {
    clearTimeout(timer);
    opts.onEnd?.();
  };

  try {
    rec.start();
  } catch {
    opts.onError?.("start-failed");
  }

  return {
    stop: () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
    },
  };
}

// ---------------- CORRESPONDÊNCIA TOLERANTE ----------------

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Como uma criança pode dizer cada letra/som.
const VARIANTS: Record<string, string[]> = {
  A: ["a", "á", "ah", "aa", "ha"],
  E: ["e", "é", "eh", "ee"],
  I: ["i", "í", "ih", "e"],
  O: ["o", "ó", "oh", "oo"],
  U: ["u", "ú", "uh", "oo"],
  B: ["b", "be", "bê", "bee"],
  C: ["c", "ce", "cê", "se"],
  D: ["d", "de", "dê", "dee"],
  F: ["f", "efe", "éfe", "fe"],
  G: ["g", "ge", "gue", "guê"],
  J: ["j", "jota", "ji"],
  L: ["l", "ele", "éle", "le"],
  M: ["m", "eme", "me", "mm"],
  N: ["n", "ene", "ne"],
  P: ["p", "pe", "pê", "pee"],
  Q: ["q", "que", "quê", "ke"],
  R: ["r", "erre", "ere", "rr"],
  S: ["s", "esse", "ese", "ss"],
  T: ["t", "te", "tê", "tee"],
  V: ["v", "ve", "vê"],
  X: ["x", "xis", "chis"],
  Z: ["z", "ze", "zê"],
};

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
}

// Verifica se alguma das hipóteses do reconhecedor bate com o alvo.
export function matchesTarget(
  target: string,
  transcripts: string[]
): boolean {
  const t = target.trim().toUpperCase();
  const accepted = new Set<string>();
  accepted.add(normalize(t));

  if (t.length === 1 && VARIANTS[t]) {
    VARIANTS[t].forEach((v) => accepted.add(normalize(v)));
  }
  // Sílabas/palavras: aceita também sem espaços
  accepted.add(normalize(t).replace(/\s/g, ""));

  for (const raw of transcripts) {
    const n = normalize(raw);
    if (!n) continue;
    const noSpace = n.replace(/\s/g, "");

    for (const a of accepted) {
      if (!a) continue;
      if (n === a || noSpace === a) return true;
      // A criança pode dizer a palavra dentro de uma frase
      if (n.split(" ").includes(a)) return true;
      // Tolerância de 1 erro em alvos com 3+ letras
      if (a.length >= 3 && levenshtein(noSpace, a) <= 1) return true;
      // Alvos de 1-2 letras: exige o som isolado ou como 1ª palavra
      if (a.length <= 2 && n.split(" ")[0] === a) return true;
    }
  }
  return false;
}

// Extrai um "nome próprio" ou resposta livre limpa.
export function cleanTranscript(s: string): string {
  return s.trim().replace(/\s+/g, " ").slice(0, 300);
}
