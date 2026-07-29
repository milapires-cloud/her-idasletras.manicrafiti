"use client";
import { useEffect, useState } from "react";
import VoiceAnswer from "@/components/VoiceAnswer";
import McButton from "@/components/McButton";
import PixelConfetti from "@/components/PixelConfetti";
import { matchesTarget } from "@/lib/speech";
import { say, sfx } from "@/lib/voice";

const STEPS = [
  { v: "A", name: "Portal da Boca Aberta", monster: "Morcego da Preguiça", emoji: "🦇", color: "#c0392b", prompt: "Faz o som A, boca bem aberta!" },
  { v: "E", name: "Ponte do Eco", monster: "Sapo da Confusão", emoji: "🐸", color: "#5aab3a", prompt: "Agora diz É, como eco na caverna!" },
  { v: "I", name: "Trilho do Raio", monster: "Fantasma da Tela", emoji: "👻", color: "#4fd0e0", prompt: "Diz I, fininho como raio!" },
  { v: "O", name: "Lago Redondo", monster: "Ogro da Birra", emoji: "👹", color: "#a06b3a", prompt: "Diz Ó, boca redonda!" },
  { v: "U", name: "Caverna do Uivo", monster: "Lobo da Desobediência", emoji: "🐺", color: "#6d3f9e", prompt: "Diz U, como uivo de lobo!" },
];

export default function VowelAdventure({
  hero,
  onDone,
}: {
  hero: { id: number; name: string };
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(3);
  const [confetti, setConfetti] = useState(0);
  const [fire, setFire] = useState(false);
  const [heard, setHeard] = useState("");
  const s = STEPS[i];

  useEffect(() => {
    say(
      i === 0
        ? `${hero.name}, começa a Aventura das Vogais! Segue o caminho, abre os portais falando e vence os monstros! ${s.prompt}`
        : `${s.name}! ${s.monster} bloqueou o caminho. ${s.prompt}`
    );
    setHp(3);
    setHeard("");
  }, [i, hero.name, s.name, s.monster, s.prompt]);

  const record = (correct: boolean) => {
    fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: 1,
        phase: "vowel-adventure",
        target: s.v,
        correct,
      }),
    });
  };

  const attack = (text: string, alts: string[]) => {
    setHeard(text);
    const ok = matchesTarget(s.v, [text, ...alts]);
    if (!ok) {
      sfx.wrong();
      record(false);
      say(`Quase! O portal quer ouvir ${s.v}. Tenta outra vez, fala pertinho!`);
      return;
    }
    sfx.correct();
    record(true);
    setFire(true);
    setConfetti(Date.now());
    const nextHp = hp - 1;
    setHp(nextHp);
    say(`Isso! ${s.v}! Ataque de fogo!`);
    setTimeout(() => setFire(false), 500);
    if (nextHp <= 0) {
      sfx.explode();
      say(`${s.monster} derrotado! Caminho aberto!`);
      setTimeout(() => {
        if (i + 1 < STEPS.length) setI(i + 1);
        else {
          sfx.levelUp();
          say("Todas as vogais foram libertadas! Agora vem a batalha final do dia!");
          setTimeout(onDone, 2500);
        }
      }, 1800);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-4 flex flex-col items-center justify-center" style={{ background: "linear-gradient(180deg,#14213d,#1b4332 60%,#3a2512)" }}>
      <PixelConfetti trigger={confetti} />
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px]">🗺️ CAMINHO DAS VOGAIS</div>
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px]">{i + 1}/5</div>
      </div>

      <div className="absolute bottom-16 left-4 right-4 flex justify-between opacity-80">
        {STEPS.map((x, n) => (
          <div key={x.v} className={`w-10 h-10 mc-block flex items-center justify-center font-bold ${n < i ? "bg-[#5aab3a]" : n === i ? "bg-[#f5c518] text-black animate-pulse" : "bg-[#5a5a5a]"}`}>
            {n < i ? "✓" : x.v}
          </div>
        ))}
      </div>

      <div className="text-center z-10 mb-3">
        <div className="mc-block bg-[#f5c518] text-black px-4 py-2 text-[10px] mb-2">{s.name}</div>
        <div className="text-[11px] opacity-90">Diz <b>{s.v}</b> para abrir o portal</div>
      </div>

      <div className="relative z-10 mb-4 animate-float">
        <div className="w-36 h-36 mc-block flex items-center justify-center" style={{ background: s.color }}>
          <span className="text-7xl">{s.emoji}</span>
        </div>
        {fire && <div className="absolute inset-0 flex items-center justify-center text-7xl animate-pop">🔥</div>}
      </div>

      <div className="w-48 mc-hp h-4 mb-4 z-10">
        <div style={{ width: `${(hp / 3) * 100}%`, background: "linear-gradient(180deg,#ff5555,#a00)" }} />
      </div>

      <VoiceAnswer prompt={s.prompt} onTranscript={attack} label={`DIZ ${s.v}`} />
      {heard && <div className="mc-block bg-black/60 px-3 py-2 text-[9px] mt-2">Ouvi: {heard}</div>}

      <div className="grid grid-cols-5 gap-2 mt-4 z-10">
        {STEPS.map((x) => (
          <button key={x.v} onClick={() => attack(x.v, [x.v])} className="mc-btn bg-[#a06b3a] w-12 h-12 text-xl font-bold">
            {x.v}
          </button>
        ))}
      </div>

      <McButton color="stone" size="sm" className="mt-4 z-10" onClick={() => say(s.prompt)}>
        🔊 REPETIR MISSÃO
      </McButton>
    </div>
  );
}
