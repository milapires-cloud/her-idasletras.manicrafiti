// Converte alvo (letra/sílaba/palavra) no texto que o TTS deve dizer.
// Regra fonética: para uma criança em alfabetização, o que importa é o
// SOM da letra, não o nome dela. Vogais dizem-se abertas.

const LETTER_SOUND: Record<string, string> = {
  A: "á",
  E: "é",
  I: "i",
  O: "ó",
  U: "u",
  B: "bê",
  C: "cê",
  D: "dê",
  F: "éfe",
  G: "guê",
  H: "agá",
  J: "jóta",
  K: "cá",
  L: "éle",
  M: "eme",
  N: "ene",
  P: "pê",
  Q: "quê",
  R: "érre",
  S: "ésse",
  T: "tê",
  V: "vê",
  W: "dáblio",
  X: "xis",
  Y: "ípsilon",
  Z: "zê",
};

export function pronounce(s: string): string {
  const t = s.trim().toUpperCase();
  if (!t) return "";
  if (t.length === 1) return LETTER_SOUND[t] ?? t;
  // Múltiplas letras separadas por espaço: fala uma a uma.
  if (t.includes(" ")) {
    return t
      .split(/\s+/)
      .map((p) => (p.length === 1 ? LETTER_SOUND[p] ?? p : p))
      .join(", ");
  }
  // Sílaba ou palavra: o TTS lê naturalmente.
  return t.toLowerCase();
}

// Soletra letra a letra (para a fase de escrita).
export function spellOut(s: string): string {
  return s
    .toUpperCase()
    .split("")
    .map((c) => (c === " " ? "espaço" : (LETTER_SOUND[c] ?? c)))
    .join(", ");
}
