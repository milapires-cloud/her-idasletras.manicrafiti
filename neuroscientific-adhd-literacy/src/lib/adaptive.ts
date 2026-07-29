// ============================================================
// MOTOR ADAPTATIVO MANICRAFITI
// ============================================================
// O que faz: olha para o histórico de tentativas da criança e
// descobre O QUE ela ainda erra, para o jogo REPETIR isso primeiro.
//
// Base científica:
// - Repetição espaçada + prática de recuperação (Ebbinghaus; Roediger):
//   rever o que se erra, no momento certo, é o que fixa a memória.
// - Aprendizagem até ao domínio (mastery learning, Bloom): não se
//   avança enquanto o alvo não estiver dominado.
// - TDAH (Barkley): feedback imediato e foco no ponto fraco evita a
//   frustração de repetir tudo — repete-se só o que falta.
//
// São funções PURAS (sem I/O), fáceis de testar e usar no cliente e
// no servidor.

export type AttemptLike = {
  target: string;
  correct: boolean;
  phase?: string;
  day?: number;
};

export type WeakItem = {
  target: string;
  attempts: number;
  misses: number;
  accuracy: number; // 0-100
};

const clean = (t: string) => (t ?? "").trim().toUpperCase();

// Agrega as tentativas por alvo (letra/sílaba/palavra).
export function aggregateByTarget(rows: AttemptLike[]): WeakItem[] {
  const map = new Map<string, { attempts: number; misses: number }>();
  for (const r of rows) {
    const key = clean(r.target);
    if (!key || key === "?") continue;
    const cur = map.get(key) ?? { attempts: 0, misses: 0 };
    cur.attempts += 1;
    if (!r.correct) cur.misses += 1;
    map.set(key, cur);
  }
  const out: WeakItem[] = [];
  for (const [target, v] of map) {
    const accuracy = Math.round(((v.attempts - v.misses) / v.attempts) * 100);
    out.push({ target, attempts: v.attempts, misses: v.misses, accuracy });
  }
  return out;
}

// Os alvos mais fracos: baixa precisão primeiro, mais erros a desempatar.
// Só entram alvos com pelo menos `minAttempts` tentativas e abaixo do
// limiar de domínio — não faz sentido "rever" algo tentado uma só vez.
export function weakestTargets(
  rows: AttemptLike[],
  opts: { minAttempts?: number; masteryPct?: number; limit?: number } = {}
): WeakItem[] {
  const minAttempts = opts.minAttempts ?? 2;
  const masteryPct = opts.masteryPct ?? 75;
  const limit = opts.limit ?? 8;
  return aggregateByTarget(rows)
    .filter((w) => w.attempts >= minAttempts && w.accuracy < masteryPct)
    .sort((a, b) => a.accuracy - b.accuracy || b.misses - a.misses)
    .slice(0, limit);
}

// Monta a fila de exercícios da fase: primeiro os alvos fracos que
// TAMBÉM fazem parte do conteúdo de hoje, depois o resto do conteúdo,
// sem repetir. Assim a criança revê o ponto fraco sem sair do currículo.
export function buildAdaptiveQueue(baseItems: string[], weak: WeakItem[]): string[] {
  const base = baseItems.map(clean).filter(Boolean);
  const baseSet = new Set(base);
  const weakInScope = weak
    .map((w) => w.target)
    .filter((t) => baseSet.has(t));
  const seen = new Set<string>();
  const queue: string[] = [];
  for (const t of [...weakInScope, ...base]) {
    if (seen.has(t)) continue;
    seen.add(t);
    queue.push(t);
  }
  return queue;
}

// Nível de dificuldade sugerido a partir da precisão recente.
// Usado para decidir se damos pistas extra (mais fácil) ou aceleramos.
export type Difficulty = "apoio" | "normal" | "desafio";

export function suggestDifficulty(recent: AttemptLike[]): Difficulty {
  if (recent.length < 4) return "normal";
  const hits = recent.filter((r) => r.correct).length;
  const acc = (hits / recent.length) * 100;
  if (acc < 60) return "apoio";
  if (acc >= 90) return "desafio";
  return "normal";
}

// Texto amigável para os pais: o que praticar hoje.
export function coachTip(weak: WeakItem[], childName: string): string {
  if (weak.length === 0) {
    return `${childName} está a acertar tudo com facilidade. Pode avançar com confiança!`;
  }
  const top = weak.slice(0, 3).map((w) => w.target).join(", ");
  return `Hoje vale a pena reforçar com ${childName}: ${top}. São os sons/palavras onde ele mais tropeça.`;
}
