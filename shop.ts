// LOJA RECHEADA — categorias, itens de arma, armadura, montaria,
// pet, poder, aparência e cenário. Preços progressivos criam metas
// de curto e médio prazo (economia comportamental — retenção).

export type ShopItem = {
  id: string;
  name: string;
  icon: string;
  price: number; // gemas
  category: "arma" | "armadura" | "pet" | "poder" | "aparencia" | "cenario" | "montaria";
  rarity: "comum" | "raro" | "epico" | "lendario";
};

export const SHOP_ITEMS: ShopItem[] = [
  // ARMAS
  { id: "espada-madeira", name: "Espada de Madeira", icon: "🗡️", price: 8, category: "arma", rarity: "comum" },
  { id: "espada-ferro", name: "Espada de Ferro", icon: "⚔️", price: 25, category: "arma", rarity: "comum" },
  { id: "machado", name: "Machado do Mineiro", icon: "🪓", price: 20, category: "arma", rarity: "comum" },
  { id: "arco", name: "Arco Rápido", icon: "🏹", price: 30, category: "arma", rarity: "raro" },
  { id: "tridente", name: "Tridente do Mar", icon: "🔱", price: 55, category: "arma", rarity: "raro" },
  { id: "espada-diamante", name: "Espada de Diamante", icon: "💎", price: 90, category: "arma", rarity: "epico" },
  { id: "raio", name: "Raio de Luz", icon: "⚡", price: 150, category: "arma", rarity: "epico" },
  { id: "espada-neth", name: "Espada de Netherite", icon: "🔥", price: 240, category: "arma", rarity: "lendario" },

  // ARMADURAS
  { id: "capacete-couro", name: "Capacete de Couro", icon: "🎽", price: 15, category: "armadura", rarity: "comum" },
  { id: "capacete-ferro", name: "Capacete de Ferro", icon: "⛑️", price: 40, category: "armadura", rarity: "comum" },
  { id: "escudo", name: "Escudo Anti-Creeper", icon: "🛡️", price: 45, category: "armadura", rarity: "raro" },
  { id: "coroa", name: "Coroa de Chefe", icon: "👑", price: 80, category: "armadura", rarity: "epico" },
  { id: "asas", name: "Asas Épicas", icon: "🕊️", price: 120, category: "armadura", rarity: "epico" },
  { id: "aureola", name: "Auréola Dourada", icon: "😇", price: 180, category: "armadura", rarity: "lendario" },

  // PETS
  { id: "gatinho", name: "Gatinho", icon: "🐱", price: 20, category: "pet", rarity: "comum" },
  { id: "cachorro", name: "Cãozinho", icon: "🐶", price: 25, category: "pet", rarity: "comum" },
  { id: "lobo", name: "Lobo Companheiro", icon: "🐺", price: 60, category: "pet", rarity: "raro" },
  { id: "coruja", name: "Coruja Sábia", icon: "🦉", price: 55, category: "pet", rarity: "raro" },
  { id: "leao", name: "Leão Corajoso", icon: "🦁", price: 110, category: "pet", rarity: "epico" },
  { id: "dragao", name: "Dragão Bebê", icon: "🐉", price: 200, category: "pet", rarity: "lendario" },
  { id: "unicornio", name: "Unicórnio Mágico", icon: "🦄", price: 220, category: "pet", rarity: "lendario" },

  // MONTARIAS
  { id: "cavalo", name: "Cavalo Veloz", icon: "🐴", price: 70, category: "montaria", rarity: "raro" },
  { id: "moto", name: "Moto Trovão", icon: "🏍️", price: 130, category: "montaria", rarity: "epico" },
  { id: "foguete", name: "Foguete Turbo", icon: "🚀", price: 250, category: "montaria", rarity: "lendario" },

  // PODERES
  { id: "poder-fogo", name: "Poder do Fogo", icon: "🔥", price: 40, category: "poder", rarity: "raro" },
  { id: "poder-gelo", name: "Poder do Gelo", icon: "❄️", price: 45, category: "poder", rarity: "raro" },
  { id: "poder-terra", name: "Poder da Terra", icon: "🌱", price: 50, category: "poder", rarity: "raro" },
  { id: "poder-raio", name: "Poder do Raio", icon: "⚡", price: 90, category: "poder", rarity: "epico" },
  { id: "poder-tempo", name: "Poder do Tempo", icon: "⏳", price: 160, category: "poder", rarity: "lendario" },

  // APARÊNCIA (bônus visual)
  { id: "capa-heroi", name: "Capa de Herói", icon: "🦸", price: 15, category: "aparencia", rarity: "comum" },
  { id: "oculos", name: "Óculos Legal", icon: "🕶️", price: 12, category: "aparencia", rarity: "comum" },
  { id: "medalha", name: "Medalha de Ouro", icon: "🥇", price: 35, category: "aparencia", rarity: "raro" },
  { id: "coracao", name: "Coração Extra ❤️", icon: "❤️", price: 100, category: "aparencia", rarity: "epico" },
  { id: "estrela", name: "Estrela Cadente", icon: "🌠", price: 140, category: "aparencia", rarity: "epico" },

  // CENÁRIOS (temas)
  { id: "cenario-praia", name: "Cenário Praia", icon: "🏖️", price: 60, category: "cenario", rarity: "raro" },
  { id: "cenario-floresta", name: "Cenário Floresta", icon: "🌳", price: 60, category: "cenario", rarity: "raro" },
  { id: "cenario-castelo", name: "Cenário Castelo", icon: "🏰", price: 100, category: "cenario", rarity: "epico" },
  { id: "cenario-espaco", name: "Cenário Espacial", icon: "🌌", price: 200, category: "cenario", rarity: "lendario" },
];

export const RARITY_COLOR: Record<ShopItem["rarity"], string> = {
  comum: "#8b8b8b",
  raro: "#4fd0e0",
  epico: "#7a3fbe",
  lendario: "#f5c518",
};

export const CATEGORY_LABEL: Record<ShopItem["category"], string> = {
  arma: "⚔️ Armas",
  armadura: "🛡️ Armaduras",
  pet: "🐾 Pets",
  montaria: "🐴 Montarias",
  poder: "✨ Poderes",
  aparencia: "🌟 Aparência",
  cenario: "🏞️ Cenários",
};
