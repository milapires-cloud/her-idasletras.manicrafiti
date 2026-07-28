// MONSTROS DOS MAUS HÁBITOS.
// Cada monstro personifica um comportamento que "come" o cérebro.
// Derrotá-lo com leitura é a metáfora central: aprender vence o vício.
// Cada dia enfrenta um monstro diferente, com escalada de dificuldade.

export type Monster = {
  id: string;
  name: string;
  emoji: string;
  color: string; // corpo
  taunt: string; // o que diz ao aparecer (falado)
  defeat: string; // o que diz ao ser derrotado
  hp: number;
};

export const MONSTERS: Monster[] = [
  {
    id: "preguica",
    name: "Monstro da Preguiça",
    emoji: "🦥",
    color: "#8a6d3b",
    taunt: "Fica deitado a ver TV comigo… ler dá muito trabalho!",
    defeat: "Nãão! A tua energia é forte demais!",
    hp: 5,
  },
  {
    id: "desobediencia",
    name: "Creeper da Desobediência",
    emoji: "💣",
    color: "#4caf50",
    taunt: "Não obedeças a ninguém! Faz o que TU queres!",
    defeat: "Impossível! Tu ouves e obedeces como um herói!",
    hp: 5,
  },
  {
    id: "tela",
    name: "Fantasma da Tela",
    emoji: "📱",
    color: "#3a3a5a",
    taunt: "Mais um vídeo… só mais um… nunca páres de rolar!",
    defeat: "Argh! Preferes LER a rolar vídeos vazios!",
    hp: 6,
  },
  {
    id: "birra",
    name: "Ogro da Birra",
    emoji: "👹",
    color: "#c0392b",
    taunt: "GRITA! CHORA! Bate o pé até conseguires o que queres!",
    defeat: "Como? Ficaste calmo e venceste-me!",
    hp: 6,
  },
  {
    id: "confusao",
    name: "Bruxo da Confusão",
    emoji: "🧙",
    color: "#6d3f9e",
    taunt: "As letras são todas iguais… nunca vais decifrar!",
    defeat: "Tu decodificas tudo! A minha magia falhou!",
    hp: 7,
  },
  {
    id: "desistencia",
    name: "Dragão da Desistência",
    emoji: "🐉",
    color: "#b8860b",
    taunt: "É difícil demais… desiste… deixa para depois…",
    defeat: "NUNCA desistes! És imparável!",
    hp: 8,
  },
];

export function monsterForDay(day: number): Monster {
  return MONSTERS[(day - 1) % MONSTERS.length];
}

// ARMADURAS — evoluem à medida que o herói avança.
// A cada 3 dias dominados, sobe um tier automaticamente (via XP).
export type Armor = {
  tier: number;
  name: string;
  color: string;
  helmet: string;
  emoji: string;
  minXp: number;
};

export const ARMORS: Armor[] = [
  { tier: 0, name: "Roupa Simples", color: "#7a5230", helmet: "", emoji: "👕", minXp: 0 },
  { tier: 1, name: "Armadura de Couro", color: "#a0672e", helmet: "🎽", emoji: "🥾", minXp: 400 },
  { tier: 2, name: "Armadura de Ferro", color: "#b0b0b0", helmet: "⛑️", emoji: "🛡️", minXp: 1200 },
  { tier: 3, name: "Armadura de Ouro", color: "#f5c518", helmet: "👑", emoji: "✨", minXp: 2500 },
  { tier: 4, name: "Armadura de Diamante", color: "#4fd0e0", helmet: "💎", emoji: "🔷", minXp: 4500 },
  { tier: 5, name: "Armadura de Netherite", color: "#3a2a3a", helmet: "🔥", emoji: "⚡", minXp: 7000 },
];

export function armorForXp(xp: number): Armor {
  return [...ARMORS].reverse().find((a) => xp >= a.minXp) ?? ARMORS[0];
}

export function nextArmor(xp: number): Armor | null {
  return ARMORS.find((a) => a.minXp > xp) ?? null;
}
