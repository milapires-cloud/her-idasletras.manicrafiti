"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import McButton from "@/components/McButton";
import VoiceAnswer from "@/components/VoiceAnswer";
import PixelConfetti from "@/components/PixelConfetti";
import { DayPlan } from "@/lib/curriculum";
import { monsterForDay, armorForXp } from "@/lib/monsters";
import { say, sfx } from "@/lib/voice";
import { matchesTarget } from "@/lib/speech";
import { pronounce } from "@/lib/pronounce";
import { api } from "@/lib/session";

// BATALHA ÉPICA CONTRA MONSTRO DOS MAUS HÁBITOS.
// Fogo, tremor, explosões, sons. A criança lê para atacar.
export default function MonsterBattle({
  hero,
  plan,
  onDone,
}: {
  hero: { id: number; name: string; xp: number };
  plan: DayPlan;
  onDone: () => void;
}) {
  const monster = useMemo(() => monsterForDay(plan.day), [plan.day]);
  const armor = useMemo(() => armorForXp(hero.xp), [hero.xp]);

  const items = useMemo(() => {
    const base = plan.syllables.length ? plan.syllables : plan.words;
    const arr = base.slice(0, Math.max(monster.hp, 5));
    while (arr.length < monster.hp) arr.push(base[arr.length % base.length]);
    return arr.slice(0, monster.hp);
  }, [plan, monster.hp]);

  const [i, setI] = useState(0);
  const [hp, setHp] = useState(monster.hp);
  const [heroHp, setHeroHp] = useState(3);
  const [shake, setShake] = useState(false);
  const [fire, setFire] = useState(false);
  const [hit, setHit] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [phase, setPhase] = useState<"intro" | "fight" | "win" | "lose">("intro");
  const [locked, setLocked] = useState(false);

  const item = items[i];

  useEffect(() => {
    say(`${monster.name}! ${monster.taunt}`, { mood: "boss" });
    sfx.explode();
    const t = setTimeout(() => setPhase("fight"), 2600);
    return () => clearTimeout(t);
  }, [monster]);

  useEffect(() => {
    if (phase !== "fight" || !item) return;
    say(`Lê para atacar: ${pronounce(item)}`);
    setLocked(false);
  }, [i, phase, item]);

  const answer = async (text: string, alts: string[]) => {
    if (locked || phase !== "fight") return;
    setLocked(true);
    const correct = matchesTarget(item, [text, ...alts]);
    api("/api/attempts", {
      method: "POST",
      body: {
        heroId: hero.id,
        day: plan.day,
        phase: "blend",
        target: item,
        correct,
      },
    });

    if (correct) {
      // ATAQUE: fogo no monstro
      setFire(true);
      setHit(true);
      sfx.correct();
      setConfetti(Date.now());
      const nhp = hp - 1;
      setHp(nhp);
      say(`${item}! Golpe de fogo!`, { mood: "hype" });
      setTimeout(() => {
        setFire(false);
        setHit(false);
      }, 700);
      if (nhp <= 0) {
        sfx.explode();
        setPhase("win");
        say(`${monster.defeat} Venceste, ${hero.name}!`, { mood: "epic" });
        setConfetti(Date.now());
        setTimeout(onDone, 3600);
        return;
      }
    } else {
      // Monstro contra-ataca
      setShake(true);
      sfx.wrong();
      setHeroHp((h) => Math.max(0, h - 1));
      say(`O monstro atacou! Era ${pronounce(item)}. Tenta outra vez!`, { mood: "gentle" });
      setTimeout(() => setShake(false), 500);
    }

    setTimeout(
      () => {
        if (correct) {
          if (i + 1 < items.length) setI(i + 1);
        } else {
          setLocked(false);
        }
      },
      correct ? 1600 : 2600
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden ${shake ? "animate-shake" : ""}`}
      style={{
        background:
          "radial-gradient(circle at 50% 30%, #3a1010 0%, #1a0510 60%, #0a0208 100%)",
      }}
    >
      <PixelConfetti trigger={confetti} />

      {/* Chamas de fundo animadas */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around opacity-80 pointer-events-none">
        {[...Array(10)].map((_, n) => (
          <div
            key={n}
            className="w-8 bg-gradient-to-t from-orange-600 via-orange-400 to-transparent animate-pulse"
            style={{ height: `${40 + (n % 3) * 40}px`, animationDelay: `${n * 0.12}s` }}
          />
        ))}
      </div>
      {/* Estrelas/rochas voando */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, n) => (
          <div
            key={n}
            className="absolute text-lg opacity-60 animate-float"
            style={{
              top: `${10 + n * 12}%`,
              left: `${5 + n * 14}%`,
              animationDelay: `${n * 0.4}s`,
            }}
          >
            {n % 2 ? "⭐" : "🪨"}
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px] text-white">
          ⚔ BOSS · DIA {plan.day}
        </div>
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px] text-white">
          {i + 1}/{items.length}
        </div>
      </div>

      {/* Nome + HP do monstro */}
      <div className="z-10 text-center mb-1">
        <div className="text-[11px] font-bold text-red-300 uppercase">
          {monster.name}
        </div>
      </div>
      <div className="w-64 mc-hp h-4 mb-4 z-10">
        <div
          style={{
            width: `${(hp / monster.hp) * 100}%`,
            background: "linear-gradient(180deg,#ff5555,#a00)",
          }}
        />
      </div>

      {/* MONSTRO */}
      <div className={`relative z-10 mb-6 ${hit ? "animate-shake" : "animate-float"}`}>
        <div
          className="w-32 h-32 mc-block flex items-center justify-center relative"
          style={{ background: monster.color }}
        >
          <span style={{ fontSize: 72, filter: hit ? "brightness(3)" : "none" }}>
            {monster.emoji}
          </span>
          {fire && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl animate-pop">🔥</span>
            </div>
          )}
        </div>
        {phase === "win" && (
          <div className="absolute inset-0 flex items-center justify-center text-7xl animate-pop">
            💥
          </div>
        )}
      </div>

      {phase === "intro" && (
        <div className="z-10 mc-block bg-black/80 text-red-200 px-5 py-3 text-[11px] max-w-xs text-center animate-pop">
          “{monster.taunt}”
        </div>
      )}

      {phase === "fight" && item && (
        <div className="z-10 flex flex-col items-center gap-3">
          <button
            onClick={() => say(pronounce(item), { rate: 0.75 })}
            className="mc-block bg-white text-black px-6 py-4"
          >
            <div
              className="font-bold tracking-wider"
              style={{ fontSize: item.length > 4 ? 34 : 52 }}
            >
              {item}
            </div>
            <div className="text-[8px] opacity-50">🔊 ouvir</div>
          </button>
          <VoiceAnswer onTranscript={answer} label="LÊ P/ ATACAR" />
          <div className="flex gap-2">
            <McButton color="stone" size="sm" onClick={() => say(pronounce(item), { rate: 0.7 })}>
              🔊
            </McButton>
            <McButton color="gold" size="sm" onClick={() => answer(item, [item])}>
              ⚔️ EU LI
            </McButton>
          </div>
        </div>
      )}

      {phase === "win" && (
        <div className="z-10 mc-block bg-[#5aab3a] px-6 py-4 text-center animate-pop">
          <div className="text-sm font-bold">🏆 MONSTRO DERROTADO!</div>
          <div className="text-[10px] mt-1">“{monster.defeat}”</div>
        </div>
      )}

      {/* Herói com armadura */}
      <div className="absolute bottom-4 left-4 z-10 flex items-end gap-2">
        <div className="flex flex-col items-center">
          <div className="text-lg">{armor.helmet || "🧒"}</div>
          <div
            className="w-8 h-8 mc-block"
            style={{ background: armor.color }}
          />
          <div className="text-[7px] mt-1 text-white/70">{armor.name}</div>
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((n) => (
            <span key={n} className="text-lg">
              {n < heroHp ? "❤️" : "🖤"}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
