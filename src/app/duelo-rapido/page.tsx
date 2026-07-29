"use client";
import { useEffect, useMemo, useState } from "react";
import McButton from "@/components/McButton";
import PixelConfetti from "@/components/PixelConfetti";
import { PageShell } from "@/components/HeroPicker";
import { CURRICULUM } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";

// DUELO RÁPIDO — criança contra pai/mãe (ou irmão), no mesmo aparelho.
// Formato de reconhecimento rápido: aparece uma sílaba/palavra e quem
// bater primeiro no seu botão ganha o ponto. Só funciona se a criança
// realmente decodificar — e o adulto pode "atrasar-se" de propósito.
export default function DueloRapido() {
  const pool = useMemo(() => {
    const all: string[] = [];
    CURRICULUM.forEach((d) => {
      all.push(...d.syllables, ...d.words);
    });
    return [...new Set(all)];
  }, []);

  const [state, setState] = useState<"ready" | "playing" | "over">("ready");
  const [word, setWord] = useState("");
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [round, setRound] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [locked, setLocked] = useState(false);
  const ROUNDS = 10;

  const nextWord = () => {
    const w = pool[Math.floor(Math.random() * pool.length)];
    setWord(w);
    setLocked(false);
    setTimeout(() => say(w, { rate: 0.85 }), 400);
  };

  useEffect(() => {
    if (state === "playing" && round === 0) nextWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const score = (who: 1 | 2) => {
    if (locked) return;
    setLocked(true);
    sfx.correct();
    if (who === 1) setP1((s) => s + 1);
    else setP2((s) => s + 1);
    say(who === 1 ? "Ponto do herói!" : "Ponto do comandante!");
    const r = round + 1;
    setRound(r);
    setTimeout(() => {
      if (r >= ROUNDS) {
        setState("over");
        setConfetti(Date.now());
        sfx.levelUp();
      } else nextWord();
    }, 1200);
  };

  const start = () => {
    setP1(0);
    setP2(0);
    setRound(0);
    setState("playing");
    say("Duelo! Quem lê primeiro ganha o ponto! Preparados?");
  };

  return (
    <PageShell title="⚔️ DUELO RÁPIDO">
      <PixelConfetti trigger={confetti} />

      {state === "ready" && (
        <div className="mc-panel p-6 text-center">
          <div className="text-5xl mb-3">⚔️</div>
          <div className="text-sm font-bold mb-2">HERÓI vs COMANDANTE</div>
          <p className="text-[10px] opacity-90 leading-relaxed">
            Aparece uma palavra. Quem a ler primeiro em voz alta bate no seu
            botão. 10 rondas. Pais: deixem-no ganhar às vezes, mas não sempre —
            a vitória só sabe bem quando é real.
          </p>
          <McButton color="gold" size="lg" className="mt-4" onClick={start}>
            COMEÇAR DUELO!
          </McButton>
        </div>
      )}

      {state === "playing" && (
        <div>
          <div className="flex justify-between mc-panel p-3 mb-3">
            <div className="text-center flex-1">
              <div className="text-[9px]">🧒 HERÓI</div>
              <div className="text-2xl font-bold">{p1}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-[9px]">RONDA</div>
              <div className="text-lg font-bold">
                {round + 1}/{ROUNDS}
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="text-[9px]">👑 COMANDANTE</div>
              <div className="text-2xl font-bold">{p2}</div>
            </div>
          </div>

          <button
            onClick={() => say(word, { rate: 0.7 })}
            className="mc-block bg-white text-black w-full py-10 mb-3"
          >
            <div
              className="font-bold tracking-wider"
              style={{ fontSize: word.length > 5 ? 40 : 64 }}
            >
              {word}
            </div>
            <div className="text-[8px] opacity-50 mt-1">🔊 ouvir</div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => score(1)}
              disabled={locked}
              className="mc-btn bg-[#4fd0e0] text-black py-10 text-sm font-bold"
            >
              🧒 EU LI!
            </button>
            <button
              onClick={() => score(2)}
              disabled={locked}
              className="mc-btn bg-[#c0392b] py-10 text-sm font-bold"
            >
              👑 EU LI!
            </button>
          </div>
        </div>
      )}

      {state === "over" && (
        <div className="mc-panel p-6 text-center">
          <div className="text-6xl mb-3">
            {p1 > p2 ? "🏆" : p1 === p2 ? "🤝" : "👑"}
          </div>
          <div className="text-lg font-bold">
            {p1 > p2
              ? "O HERÓI VENCEU!"
              : p1 === p2
                ? "EMPATE ÉPICO!"
                : "O COMANDANTE VENCEU!"}
          </div>
          <div className="text-sm mt-2">
            🧒 {p1} — {p2} 👑
          </div>
          <div className="mt-4 flex gap-2 justify-center">
            <McButton color="grass" onClick={start}>
              🔁 REVANCHE
            </McButton>
          </div>
        </div>
      )}
    </PageShell>
  );
}
