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
import { buildAdaptiveQueue, type WeakItem } from "@/lib/adaptive";

// BATALHA ÉPICA CONTRA MONSTRO DOS MAUS HÁBITOS.
// Fogo, tremor, explosões, sons. A criança lê para atacar.
//
// GARANTIA DE ESTABILIDADE: a batalha NUNCA prende a criança.
// - Depois de 2 tentativas erradas, o jogo ENSINA a palavra e segue.
// - As palavras erradas voltam no FIM para revisão (repetição espaçada).
// - As vidas nunca dão "game over": ao zerar, o herói RECARREGA com
//   uma poção e continua — para um miúdo de 6 anos, nunca há derrota.
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

  // Palavras/sílabas base da batalha.
  const baseItems = useMemo(() => {
    const base = plan.syllables.length ? plan.syllables : plan.words;
    const arr = base.slice(0, Math.max(monster.hp, 5));
    while (arr.length < monster.hp) arr.push(base[arr.length % base.length]);
    return arr.slice(0, monster.hp);
  }, [plan, monster.hp]);

  // Fila de ataque (pode ser reordenada pelo motor adaptativo e crescer
  // quando uma palavra errada volta para revisão).
  const [queue, setQueue] = useState<string[]>(baseItems);
  const goal = baseItems.length; // nº de acertos para derrotar o monstro
  const requeued = useRef<Set<string>>(new Set());

  const [pos, setPos] = useState(0);
  const [defeated, setDefeated] = useState(0); // acertos válidos
  const [tries, setTries] = useState(0);
  const [combo, setCombo] = useState(0);
  const [heroHp, setHeroHp] = useState(3);
  const [shake, setShake] = useState(false);
  const [fire, setFire] = useState(false);
  const [hit, setHit] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [phase, setPhase] = useState<"intro" | "fight" | "win">("intro");
  const [locked, setLocked] = useState(false);

  const item = queue[pos];

  // Prioriza o que a criança mais erra — sem sair do conteúdo de hoje.
  useEffect(() => {
    let alive = true;
    api<{ weak: WeakItem[] }>(`/api/attempts?heroId=${hero.id}`)
      .then((res) => {
        const weak = res?.data?.weak;
        if (!alive || !weak?.length) return;
        setQueue((q) => buildAdaptiveQueue(q, weak));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [hero.id]);

  useEffect(() => {
    say(`${monster.name}! ${monster.taunt}`, { mood: "boss" });
    sfx.explode();
    const t = setTimeout(() => setPhase("fight"), 2600);
    return () => clearTimeout(t);
  }, [monster]);

  useEffect(() => {
    if (phase !== "fight" || !item) return;
    setTries(0);
    setLocked(false);
    say(`Lê para atacar: ${pronounce(item)}`);
  }, [pos, phase, item]);

  // Avança para o próximo alvo da fila (ou vence se já cumpriu a meta).
  const goNext = useCallback(
    (nextDefeated: number) => {
      if (nextDefeated >= goal) {
        sfx.explode();
        setPhase("win");
        setConfetti(Date.now());
        say(`${monster.defeat} Venceste, ${hero.name}!`, { mood: "epic" });
        setTimeout(onDone, 3600);
        return;
      }
      if (pos + 1 < queue.length) {
        setPos(pos + 1);
      } else {
        // Sem mais itens na fila mas ainda falta meta: recomeça do que resta.
        setPos(0);
      }
    },
    [goal, monster.defeat, hero.name, onDone, pos, queue.length]
  );

  const answer = async (text: string, alts: string[]) => {
    if (locked || phase !== "fight" || !item) return;
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
    }).catch(() => {});

    if (correct) {
      setFire(true);
      setHit(true);
      sfx.correct();
      setConfetti(Date.now());
      const nCombo = combo + 1;
      setCombo(nCombo);
      const nDefeated = defeated + 1;
      setDefeated(nDefeated);
      // Feedback de combo para manter o miúdo empolgado.
      if (nCombo >= 3) say(`${item}! Combo x${nCombo}! Estás em chamas!`, { mood: "hype" });
      else say(`${item}! Golpe de fogo!`, { mood: "hype" });
      setTimeout(() => {
        setFire(false);
        setHit(false);
      }, 700);
      setTimeout(() => goNext(nDefeated), 1600);
    } else {
      setShake(true);
      sfx.wrong();
      setCombo(0);
      const n = tries + 1;
      setTries(n);
      setTimeout(() => setShake(false), 500);

      // Vidas: ao zerar, RECARREGA (nunca game over para uma criança).
      setHeroHp((h) => {
        const nh = h - 1;
        if (nh <= 0) {
          setTimeout(
            () => say("Bebe a poção mágica! Corações cheios outra vez. Continua!", { mood: "cheer" }),
            300
          );
          sfx.levelUp();
          return 3;
        }
        return nh;
      });

      if (n >= 2) {
        // ENSINA e segue — a palavra errada volta ao fim para revisão.
        if (!requeued.current.has(item)) {
          requeued.current.add(item);
          setQueue((q) => [...q, item]);
        }
        say(`A palavra é ${pronounce(item)}. Diz comigo: ${pronounce(item)}. Vamos à próxima!`, {
          mood: "gentle",
        });
        setTimeout(() => goNext(defeated), 3200);
      } else {
        say(`Quase! Era ${pronounce(item)}. Tenta outra vez!`, { mood: "gentle" });
        setTimeout(() => setLocked(false), 2200);
      }
    }
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
          {Math.min(defeated + 1, goal)}/{goal}
        </div>
      </div>

      {/* Combo */}
      {combo >= 2 && phase === "fight" && (
        <div className="absolute top-16 right-4 z-10 mc-block bg-orange-500 px-3 py-1 text-[10px] font-bold text-white animate-pop">
          🔥 COMBO x{combo}
        </div>
      )}

      {/* Nome + HP do monstro */}
      <div className="z-10 text-center mb-1">
        <div className="text-[11px] font-bold text-red-300 uppercase">
          {monster.name}
        </div>
      </div>
      <div className="w-64 mc-hp h-4 mb-4 z-10">
        <div
          style={{
            width: `${Math.max(0, ((goal - defeated) / goal) * 100)}%`,
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
