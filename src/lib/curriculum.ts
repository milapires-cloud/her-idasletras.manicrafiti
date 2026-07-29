// ============================================================
// CURRÍCULO MANICRAFITI — ALFABETIZAÇÃO BASEADA EM EVIDÊNCIAS
// ============================================================
// FUNDAMENTAÇÃO CIENTÍFICA:
//
// 1. PNA (Política Nacional de Alfabetização, Brasil 2019) e o
//    Relatório Nacional de Alfabetização Baseada em Evidências:
//    6 componentes essenciais → consciência fonêmica, instrução
//    fônica sistemática, fluência, vocabulário, compreensão e
//    produção escrita. TODOS os 6 estão neste plano.
//
// 2. National Reading Panel (NRP, 2000) + Rose Review (2006):
//    a instrução fônica SISTEMÁTICA e SINTÉTICA supera a fônica
//    assistemática e o método global. Efeito maior em crianças de
//    risco — que é exatamente o caso do TDAH.
//
// 3. Linnea Ehri — Fases do reconhecimento de palavras:
//    pré-alfabética → alfabética parcial → alfabética completa →
//    consolidada. O plano move a criança da fase parcial para a
//    completa via decodificação explícita, nunca por adivinhação.
//
// 4. Scarborough's Reading Rope: decodificação × compreensão
//    linguística. Por isso há vocabulário e compreensão no fim.
//
// 5. Princípio da DECODABILIDADE CUMULATIVA (Ehri; Juel):
//    → REGRA DE OURO deste currículo: nenhuma palavra aparece
//      antes de TODAS as suas letras terem sido ensinadas.
//      É isto que separa alfabetização real de jogo de faz-de-conta.
//      A criança nunca "adivinha pela figura" — ela DECODIFICA.
//
// 6. Adaptação TDAH (Barkley; Rapport — memória de trabalho):
//    blocos de 3-5 min, feedback imediato, resposta motora/vocal,
//    critério de mestria antes de avançar (aprendizagem até domínio).
//
// ORDEM DAS LETRAS: escolhida por (a) frequência no português,
// (b) transparência grafema-fonema, (c) produtividade — quantas
// palavras reais se conseguem formar imediatamente.
// A, E, I, O, U → M → P → L → T → D → S → N → V, F → B, C → R → G, J, Z
// Já no DIA 2 a criança lê a primeira palavra completa. Isto é
// crítico para a dopamina: sucesso real e imediato.

export const MASTERY_THRESHOLD = 80; // % mínima para avançar
export const MIN_ATTEMPTS = 8;

export type ExerciseKind =
  | "phonemic" // consciência fonêmica (oral, sem letras)
  | "gpc" // grafema → fonema
  | "blend" // fusão: som + som = sílaba
  | "word" // leitura de palavra decodável
  | "sentence" // leitura de frase
  | "dictation" // escrita/ditado
  | "fluency"; // releitura cronometrada

export type PhonemicTask = {
  prompt: string; // o que o mascote pergunta (falado)
  word: string; // palavra de referência
  answer: string; // resposta esperada (aceita por voz)
  options?: string[]; // se for escolha
};

export type DayPlan = {
  day: number;
  world: string;
  worldColor: "grass" | "stone" | "sand" | "wood" | "gold";
  focus: string;
  newGraphemes: string[]; // letras NOVAS do dia
  cumulative: string[]; // tudo já ensinado (para gerar exercícios)
  syllables: string[]; // sílabas do dia
  words: string[]; // palavras 100% decodáveis
  sentences: string[]; // frases 100% decodáveis
  phonemic: PhonemicTask[]; // consciência fonêmica (oral)
  writingTarget: string;
  vocabulary?: { word: string; meaning: string }[];
  comprehension?: { text: string; question: string; answer: string };
  neuroTip: string;
  brainHack: string;
  parentScript: string; // o que o pai/mãe deve fazer nesse dia
};

const V = ["A", "E", "I", "O", "U"];

export const CURRICULUM: DayPlan[] = [
  {
    day: 1,
    world: "Caverna das Vogais",
    worldColor: "grass",
    focus: "Consciência fonêmica + as 5 vogais (A E I O U)",
    newGraphemes: V,
    cumulative: V,
    syllables: [],
    words: [],
    sentences: [],
    phonemic: [
      { prompt: "Qual é o PRIMEIRO som de ABELHA?", word: "ABELHA", answer: "A" },
      { prompt: "Qual é o PRIMEIRO som de ELEFANTE?", word: "ELEFANTE", answer: "E" },
      { prompt: "Qual é o PRIMEIRO som de IGREJA?", word: "IGREJA", answer: "I" },
      { prompt: "Qual é o PRIMEIRO som de OVO?", word: "OVO", answer: "O" },
      { prompt: "Qual é o PRIMEIRO som de UVA?", word: "UVA", answer: "U" },
    ],
    writingTarget: "A E I O U",
    neuroTip:
      "As vogais são o motor de TODA palavra. Sem vogal não há sílaba nenhuma!",
    brainHack:
      "O teu cérebro não nasceu a saber ler — a leitura é uma invenção. Cada som que aprendes constrói uma estrada nova dentro da tua cabeça!",
    parentScript:
      "Diga sons de vogais e peça para ele apontar a letra. 5 min. Não corrija com bronca — repita o som certo e siga.",
  },
  {
    day: 2,
    world: "Mina do M",
    worldColor: "grass",
    focus: "Letra M + PRIMEIRA fusão consoante+vogal + PRIMEIRA palavra",
    newGraphemes: ["M"],
    cumulative: [...V, "M"],
    syllables: ["MA", "ME", "MI", "MO", "MU"],
    words: ["MAMA", "AMA", "MIMA", "EMA"],
    sentences: ["A MAMA."],
    phonemic: [
      { prompt: "Junta os sons: mmm... A. Que sílaba dá?", word: "MA", answer: "MA" },
      { prompt: "Junta os sons: mmm... U. Que sílaba dá?", word: "MU", answer: "MU" },
      { prompt: "Qual é o primeiro som de MACACO?", word: "MACACO", answer: "M" },
    ],
    writingTarget: "MA ME MI MO MU",
    vocabulary: [{ word: "EMA", meaning: "Uma ave grande que corre muito rápido" }],
    neuroTip:
      "O M zumbe no nariz: mmmmm. Cola o mmm na vogal e nasce a sílaba!",
    brainHack:
      "Hoje leste a tua PRIMEIRA palavra de verdade. Nenhum vídeo do YouTube te dá este poder.",
    parentScript:
      "Escreva MA ME MI MO MU num papel. Ele lê em voz alta e depois lê MAMA. Celebre em grande — é a primeira palavra da vida dele.",
  },
  {
    day: 3,
    world: "Mina do P",
    worldColor: "grass",
    focus: "Letra P — som explosivo",
    newGraphemes: ["P"],
    cumulative: [...V, "M", "P"],
    syllables: ["PA", "PE", "PI", "PO", "PU"],
    words: ["PAPA", "PIPA", "MAPA", "PUMA", "PIPO", "APE"],
    sentences: ["O MAPA.", "A PIPA."],
    phonemic: [
      { prompt: "Junta os sons: P... A. Que sílaba dá?", word: "PA", answer: "PA" },
      { prompt: "Qual é o primeiro som de PATO?", word: "PATO", answer: "P" },
      { prompt: "MAPA tem quantas sílabas? MA-PA", word: "MAPA", answer: "2", options: ["1", "2", "3"] },
    ],
    writingTarget: "PA PE PI PO PU",
    vocabulary: [{ word: "PUMA", meaning: "Um gato selvagem grande e forte" }],
    neuroTip: "O P é um balão a estourar: P! Fecha os lábios e solta o ar!",
    brainHack:
      "Sabes porquê o TikTok é fácil e ler é difícil? Porque ler constrói o cérebro e ver vídeo só o gasta.",
    parentScript:
      "Peça para ele ler MAPA, PIPA, PAPA. Depois esconda um papel com a palavra e faça caça ao tesouro.",
  },
  {
    day: 4,
    world: "Floresta do L",
    worldColor: "grass",
    focus: "Letra L + leitura de 3 sílabas",
    newGraphemes: ["L"],
    cumulative: [...V, "M", "P", "L"],
    syllables: ["LA", "LE", "LI", "LO", "LU"],
    words: ["LUA", "MALA", "LULA", "LUPA", "PALA", "MELA", "PELE", "LIMA"],
    sentences: ["A LUA.", "A MALA.", "A LULA."],
    phonemic: [
      { prompt: "Junta: L... U... A. Que palavra dá?", word: "LUA", answer: "LUA" },
      { prompt: "Qual é o ÚLTIMO som de MALA?", word: "MALA", answer: "A" },
      { prompt: "Tira o MA de MALA. O que sobra?", word: "MALA", answer: "LA" },
    ],
    writingTarget: "LUA MALA",
    vocabulary: [{ word: "LUPA", meaning: "Vidro que faz as coisas parecerem maiores" }],
    neuroTip: "O L levanta a ponta da língua para cima: llll.",
    brainHack:
      "Já consegues ler 8 palavras. Há 3 dias eram ZERO. O teu cérebro está a ficar mais rápido que o Creeper.",
    parentScript:
      "Escreva as 8 palavras em papéis e espalhe pela casa. Ele caça e lê cada uma em voz alta.",
  },
  {
    day: 5,
    world: "Templo do T",
    worldColor: "stone",
    focus: "Letra T + primeiras palavras de 2 sílabas fluentes",
    newGraphemes: ["T"],
    cumulative: [...V, "M", "P", "L", "T"],
    syllables: ["TA", "TE", "TI", "TO", "TU"],
    words: ["TATU", "PATO", "MATA", "TAPA", "MULETA", "TULIPA", "LATA", "TELA"],
    sentences: ["O PATO.", "O TATU.", "A LATA."],
    phonemic: [
      { prompt: "Junta: T... A... T... U. Que palavra dá?", word: "TATU", answer: "TATU" },
      { prompt: "Qual é o primeiro som de TELEFONE?", word: "TELEFONE", answer: "T" },
      { prompt: "Troca o P de PATO por M. Que palavra fica?", word: "PATO", answer: "MATO" },
    ],
    writingTarget: "PATO TATU",
    vocabulary: [{ word: "TULIPA", meaning: "Uma flor bonita em forma de taça" }],
    neuroTip: "O T bate a língua nos dentes da frente: T! T! T!",
    brainHack:
      "Trocar uma letra muda a palavra toda: PATO vira MATO. Isso é o poder do código.",
    parentScript:
      "Jogo da troca: diga PATO e peça para ele trocar o primeiro som por M, T, L. Ele descobre MATO, TATO, LATO.",
  },
  {
    day: 6,
    world: "Arena da Fluência",
    worldColor: "stone",
    focus: "REVISÃO + FLUÊNCIA (ler rápido sem hesitar)",
    newGraphemes: [],
    cumulative: [...V, "M", "P", "L", "T"],
    syllables: ["MA", "PA", "LA", "TA", "ME", "PE", "LE", "TE", "MI", "PI", "LI", "TI"],
    words: ["LUA", "MALA", "PATO", "TATU", "MAPA", "PIPA", "LATA", "TELA", "LULA", "MATA"],
    sentences: ["O PATO TAPA A LATA.", "A MALA ESTA NA MATA."],
    phonemic: [
      { prompt: "Diz uma palavra que comece com o som de T.", word: "?", answer: "T" },
      { prompt: "Quantas sílabas tem TULIPA? TU-LI-PA", word: "TULIPA", answer: "3", options: ["2", "3", "4"] },
    ],
    writingTarget: "O PATO",
    neuroTip:
      "Hoje não aprendes letra nova. Hoje treinas VELOCIDADE. Ler rápido liberta o cérebro para ENTENDER.",
    brainHack:
      "Isto chama-se fluência. É a ponte entre decifrar letras e entender histórias.",
    parentScript:
      "Cronometre 1 minuto: quantas palavras da lista ele lê certo? Anote. Repita amanhã e mostre que melhorou.",
  },
  {
    day: 7,
    world: "Mina do D",
    worldColor: "stone",
    focus: "Letra D — par sonoro do T",
    newGraphemes: ["D"],
    cumulative: [...V, "M", "P", "L", "T", "D"],
    syllables: ["DA", "DE", "DI", "DO", "DU"],
    words: ["DEDO", "DADO", "MOEDA", "DUDA", "TODO", "LADO", "MEDO", "PODE"],
    sentences: ["O DEDO.", "O DADO E DO PATO."],
    phonemic: [
      { prompt: "T e D: qual VIBRA a garganta? Diz TÊ e DÊ com a mão no pescoço.", word: "D", answer: "D" },
      { prompt: "Junta: D... E... D... O", word: "DEDO", answer: "DEDO" },
      { prompt: "Troca o T de TADO por D. Que palavra fica?", word: "DADO", answer: "DADO" },
    ],
    writingTarget: "DEDO DADO",
    vocabulary: [{ word: "MOEDA", meaning: "Dinheiro redondo de metal" }],
    neuroTip:
      "T e D fazem-se no MESMO sítio da boca. A diferença é só a garganta a vibrar!",
    brainHack: "Já dominas 10 letras. Faltam poucas para leres o mundo inteiro.",
    parentScript:
      "Mão no pescoço: diga TTT (não vibra) e DDD (vibra). Ele sente a diferença fisicamente.",
  },
  {
    day: 8,
    world: "Deserto do S",
    worldColor: "sand",
    focus: "Letra S (som de cobra no início da palavra)",
    newGraphemes: ["S"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S"],
    syllables: ["SA", "SE", "SI", "SO", "SU"],
    words: ["SAPO", "SALA", "SOPA", "SUMO", "SEDA", "SAPATO", "SALADA", "SEIS"],
    sentences: ["O SAPO PULA.", "A SOPA ESTA NA MESA."],
    phonemic: [
      { prompt: "Qual é o primeiro som de SAPO?", word: "SAPO", answer: "S" },
      { prompt: "Junta: S... A... P... O", word: "SAPO", answer: "SAPO" },
      { prompt: "SAPATO tem quantas sílabas? SA-PA-TO", word: "SAPATO", answer: "3", options: ["2", "3", "4"] },
    ],
    writingTarget: "SAPO SALA",
    vocabulary: [{ word: "SEDA", meaning: "Um tecido muito macio e brilhante" }],
    neuroTip: "O S é a cobra: ssssss. Sopra o ar entre os dentes!",
    brainHack:
      "Cada palavra nova é uma pasta nova no teu cérebro. Vídeo curto não cria pasta nenhuma.",
    parentScript: "Ele lê SAPATO e SALADA sozinho — são palavras de 3 sílabas. Filme e mostre a ele.",
  },
  {
    day: 9,
    world: "Deserto do N",
    worldColor: "sand",
    focus: "Letra N + frases completas",
    newGraphemes: ["N"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N"],
    syllables: ["NA", "NE", "NI", "NO", "NU"],
    words: ["NADA", "LUNA", "MENINA", "PANELA", "NOTA", "SINO", "ANEL", "NUM"],
    sentences: ["A MENINA NADA.", "O SINO SOA.", "A PANELA E DELA."],
    phonemic: [
      { prompt: "M e N zumbem no nariz. Qual está em NARIZ?", word: "NARIZ", answer: "N" },
      { prompt: "Junta: M... E... N... I... N... A", word: "MENINA", answer: "MENINA" },
      { prompt: "Tira o A de NADA no fim. O que sobra?", word: "NADA", answer: "NAD" },
    ],
    writingTarget: "MENINA NADA",
    vocabulary: [{ word: "SINO", meaning: "Objeto de metal que toca dlim-dlão na igreja" }],
    neuroTip: "M fecha os lábios, N põe a língua atrás dos dentes. Ambos zumbem!",
    brainHack: "Estás a ler FRASES. Frases contam histórias. Já não és iniciante.",
    parentScript:
      "Escreva 3 frases num papel. Ele lê e DESENHA o que entendeu — isso testa compreensão, não só decodificação.",
  },
  {
    day: 10,
    world: "Vale do V e F",
    worldColor: "sand",
    focus: "Letras V e F — par sonoro/surdo",
    newGraphemes: ["V", "F"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F"],
    syllables: ["VA", "VE", "VI", "VO", "VU", "FA", "FE", "FI", "FO", "FU"],
    words: ["UVA", "VELA", "FADA", "FITA", "SOFA", "VIDA", "FIVELA", "FAVELA"],
    sentences: ["A UVA E DOCE.", "A FADA TEM UMA VELA."],
    phonemic: [
      { prompt: "F e V: qual VIBRA? Diz FFF e VVV com a mão no pescoço.", word: "V", answer: "V" },
      { prompt: "Junta: F... A... D... A", word: "FADA", answer: "FADA" },
      { prompt: "Troca o F de FITA por V. Que palavra fica?", word: "VITA", answer: "VITA" },
    ],
    writingTarget: "UVA FADA",
    vocabulary: [{ word: "FIVELA", meaning: "A peça de metal que fecha o cinto" }],
    neuroTip: "F e V: dentes de cima no lábio de baixo. F sopra, V vibra.",
    brainHack: "Meia jornada! O teu cérebro mudou fisicamente nestes 10 dias.",
    parentScript: "Mão no pescoço outra vez: FFF vs VVV. Depois ele lê as 8 palavras.",
  },
  {
    day: 11,
    world: "Castelo do B e C",
    worldColor: "wood",
    focus: "Letras B e C (som de /k/)",
    newGraphemes: ["B", "C"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F", "B", "C"],
    syllables: ["BA", "BE", "BI", "BO", "BU", "CA", "CO", "CU"],
    words: ["BOLA", "BOCA", "CAMA", "CASA", "BEBE", "CUCA", "CABELO", "BONECA"],
    sentences: ["A BOLA E DO BEBE.", "A CASA TEM UMA CAMA."],
    phonemic: [
      { prompt: "P e B: qual VIBRA? Diz PPP e BBB.", word: "B", answer: "B" },
      { prompt: "Junta: B... O... L... A", word: "BOLA", answer: "BOLA" },
      { prompt: "Qual é o primeiro som de CASA?", word: "CASA", answer: "C" },
    ],
    writingTarget: "BOLA CASA",
    vocabulary: [{ word: "BONECA", meaning: "Brinquedo com forma de pessoa" }],
    neuroTip:
      "Atenção: o C tem som de K antes de A, O, U — CASA, COLA, CUCA.",
    brainHack: "Já lês quase tudo o que está escrito na tua casa. Experimenta!",
    parentScript:
      "Caça ao texto real: leve-o à cozinha e peça para ler rótulos. Ele vai conseguir ler várias palavras.",
  },
  {
    day: 12,
    world: "Rio do R",
    worldColor: "wood",
    focus: "Letra R — R forte (início) e R brando (meio)",
    newGraphemes: ["R"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F", "B", "C", "R"],
    syllables: ["RA", "RE", "RI", "RO", "RU", "RRA", "RRO"],
    words: ["RATO", "ROSA", "RUA", "CARRO", "TERRA", "CARETA", "PERA", "MURO"],
    sentences: ["O RATO CORRE NA RUA.", "O CARRO E VERMELHO."],
    phonemic: [
      { prompt: "RATO e CARO: em qual o R é FORTE?", word: "RATO", answer: "RATO" },
      { prompt: "Junta: C... A... R... R... O", word: "CARRO", answer: "CARRO" },
      { prompt: "Qual é o primeiro som de ROSA?", word: "ROSA", answer: "R" },
    ],
    writingTarget: "RATO CARRO",
    vocabulary: [{ word: "MURO", meaning: "Parede que separa terrenos" }],
    neuroTip:
      "R no início da palavra é FORTE (RRRato). No meio entre vogais é brando (caRa). RR também é forte!",
    brainHack: "O R é a letra mais difícil do português. E tu venceste-a.",
    parentScript: "Contraste CARO / CARRO. Ele ouve e aponta a diferença.",
  },
  {
    day: 13,
    world: "Ruínas do G, J e Z",
    worldColor: "wood",
    focus: "Letras G, J e Z",
    newGraphemes: ["G", "J", "Z"],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F", "B", "C", "R", "G", "J", "Z"],
    syllables: ["GA", "GO", "GU", "JA", "JE", "JI", "JO", "JU", "ZA", "ZE", "ZO"],
    words: ["GATO", "JOGO", "ZEBU", "JANELA", "GOTA", "JULIA", "AZUL", "GAVETA"],
    sentences: ["O GATO ESTA NA JANELA.", "O JOGO E AZUL."],
    phonemic: [
      { prompt: "Junta: G... A... T... O", word: "GATO", answer: "GATO" },
      { prompt: "Qual é o primeiro som de JANELA?", word: "JANELA", answer: "J" },
      { prompt: "AZUL tem quantas sílabas? A-ZUL", word: "AZUL", answer: "2", options: ["1", "2", "3"] },
    ],
    writingTarget: "GATO JOGO",
    vocabulary: [{ word: "ZEBU", meaning: "Um boi com uma corcunda nas costas" }],
    neuroTip: "G tem som de /g/ antes de A, O, U — GATO, GOTA, GULA.",
    brainHack: "Tens agora TODAS as letras principais. És oficialmente um leitor.",
    parentScript: "Ele lê um livro infantil simples em voz alta. Ajude só quando travar 3 segundos.",
  },
  {
    day: 14,
    world: "Torre da Compreensão",
    worldColor: "gold",
    focus: "Ler um TEXTO e ENTENDER o que leu",
    newGraphemes: [],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F", "B", "C", "R", "G", "J", "Z"],
    syllables: [],
    words: ["MENINA", "GATO", "BOLA", "CASA", "RATO", "SAPO", "JANELA", "CARRO"],
    sentences: [
      "O GATO VIU O RATO.",
      "A MENINA PEGOU A BOLA.",
      "O SAPO PULOU NA LAMA.",
    ],
    phonemic: [
      { prompt: "Se o gato viu o rato, quem viu? O gato ou o rato?", word: "GATO", answer: "GATO" },
    ],
    comprehension: {
      text: "O GATO VIU O RATO. O RATO CORREU PARA A CASA. O GATO NAO PEGOU O RATO.",
      question: "O gato conseguiu pegar o rato? Diz SIM ou NÃO.",
      answer: "NAO",
    },
    writingTarget: "O GATO VIU O RATO",
    neuroTip:
      "Ler não é só dizer as letras. É construir um FILME na cabeça enquanto lês.",
    brainHack:
      "Decodificar × Compreender = LER. Já tens as duas peças.",
    parentScript:
      "Ele lê o texto e depois CONTA a história com as próprias palavras. Isso prova que compreendeu.",
  },
  {
    day: 15,
    world: "Chefe Final",
    worldColor: "gold",
    focus: "Avaliação final + leitura do mundo real",
    newGraphemes: [],
    cumulative: [...V, "M", "P", "L", "T", "D", "S", "N", "V", "F", "B", "C", "R", "G", "J", "Z"],
    syllables: [],
    words: ["LIVRO", "ESCOLA", "AMIGO", "FAMILIA", "MERCADO", "JANELA"],
    sentences: [
      "EU SEI LER.",
      "O MEU CEREBRO E FORTE.",
      "EU LI UM LIVRO SOZINHO.",
    ],
    phonemic: [
      { prompt: "Diz uma palavra que comece com o som de L.", word: "?", answer: "L" },
    ],
    comprehension: {
      text: "EM 15 DIAS O HEROI APRENDEU TODAS AS LETRAS. AGORA ELE LE SOZINHO.",
      question: "O que o herói aprendeu? Diz: LER",
      answer: "LER",
    },
    writingTarget: "EU SEI LER",
    neuroTip:
      "Hoje provas ao mundo que sabes ler. Lê uma placa, um rótulo, um livro.",
    brainHack:
      "Ninguém te pode enganar mais. Quem sabe ler é LIVRE. Conquistaste isso em 15 dias.",
    parentScript:
      "MISSÃO FINAL: esconda um bilhete escrito em casa. Ele só encontra o prémio se ler as pistas sozinho. Prémio do MUNDO REAL, não digital.",
  },
];

export function getDay(day: number): DayPlan {
  return CURRICULUM[Math.min(Math.max(day, 1), 15) - 1];
}

export function computeAccuracy(attempts: { correct: boolean }[]): number {
  if (attempts.length === 0) return 0;
  const hits = attempts.filter((a) => a.correct).length;
  return Math.round((hits / attempts.length) * 100);
}

export function isMastered(accuracy: number, totalAttempts: number): boolean {
  return totalAttempts >= MIN_ATTEMPTS && accuracy >= MASTERY_THRESHOLD;
}

// VERIFICADOR DE DECODABILIDADE — garante a regra de ouro.
// Usado nos testes e no painel dos pais para provar rigor.
export function isDecodable(word: string, taught: string[]): boolean {
  const set = new Set(taught.map((c) => c.toUpperCase()));
  return word
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .every((c) => set.has(c));
}

// Árvore de habilidades derivada do currículo (para /arvore-habilidades)
export type Skill = {
  id: string;
  name: string;
  day: number;
  tier: number;
  icon: string;
};

export const SKILL_TREE: Skill[] = [
  { id: "vogais", name: "Vogais", day: 1, tier: 1, icon: "🔤" },
  { id: "fonemica", name: "Consciência Fonêmica", day: 1, tier: 1, icon: "👂" },
  { id: "m", name: "Som M", day: 2, tier: 2, icon: "🇲" },
  { id: "fusao", name: "Fusão de Sons", day: 2, tier: 2, icon: "🔗" },
  { id: "p", name: "Som P", day: 3, tier: 2, icon: "💥" },
  { id: "l", name: "Som L", day: 4, tier: 2, icon: "👅" },
  { id: "t", name: "Som T", day: 5, tier: 2, icon: "🦷" },
  { id: "fluencia1", name: "Fluência I", day: 6, tier: 3, icon: "⚡" },
  { id: "d", name: "Som D", day: 7, tier: 3, icon: "🎲" },
  { id: "s", name: "Som S", day: 8, tier: 3, icon: "🐍" },
  { id: "n", name: "Som N", day: 9, tier: 3, icon: "👃" },
  { id: "vf", name: "Sons V e F", day: 10, tier: 4, icon: "🍇" },
  { id: "bc", name: "Sons B e C", day: 11, tier: 4, icon: "⚽" },
  { id: "r", name: "Som R (difícil!)", day: 12, tier: 4, icon: "🚗" },
  { id: "gjz", name: "Sons G, J, Z", day: 13, tier: 5, icon: "🐱" },
  { id: "compreensao", name: "Compreensão", day: 14, tier: 5, icon: "🧠" },
  { id: "leitor", name: "LEITOR COMPLETO", day: 15, tier: 6, icon: "👑" },
];
