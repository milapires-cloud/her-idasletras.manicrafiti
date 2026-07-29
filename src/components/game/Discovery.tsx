"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import VoiceAnswer from "@/components/VoiceAnswer";
import { DayPlan } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";
import { matchesTarget } from "@/lib/speech";
import { pronounce } from "@/lib/pronounce";

// FASE 2 — MINERAÇÃO GPC (grafema → fonema).
// A criança parte o bloco (motor: bom para hiperatividade) e depois
// DIZ o som da letra. Instrução fônica explícita e sistemática.
export default function Discovery({
  hero,
  plan,
  onDone,
}: {
  hero: { id: number; name: string };
  plan: DayPlan;
  onDone: () => void;
}) {
  // Alvos: letras novas do dia; se for dia de revisão, usa sílabas.
  const targets =
    plan.newGraphemes.length > 0
      ? plan.newGraphemes
      : plan.syllables.slice(0, 6);

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [said, setSaid] = useState(false);
  const HITS_NEEDED = 3;

  const target = targets[idx];

  useEffect(() => {
    if (!target) return;
    setHits(0);
    setReveal(false);
    setSaid(false);
    say(
      idx === 0
        ? `${hero.name}! Bate no bloco de pedra até partir e descobrir a letra escondida!`
        : "Próximo bloco! Bate com força!"
    );
  }, [idx, target, hero.name]);

  useEffect(() => {
    if (!target) {
      onDone();
    }
  }, [target, onDone]);

  if (!target) return null;

  const mine = () => {
    if (reveal) return;
    const n = hits + 1;
    setHits(n);
    sfx.mine();
    if (n < HITS_NEEDED) return;
    setReveal(true);
    sfx.break();
    setTimeout(() => {
      say(
        `Encontraste! Esta letra faz o som ${pronounce(target)}. Agora DIZ TU: ${pronounce(target)}`
      );
    }, 250);
  };

  const next = () => {
    if (idx + 1 < targets.length) setIdx(idx + 1);
    else {
      sfx.levelUp();
      say("Todas as letras mineradas! Agora vamos juntar os sons!");
      setTimeout(onDone, 2400);
    }
  };

  const handleSpeech = async (text: string, alts: string[]) => {
    const ok = matchesTarget(target, [text, ...alts]);
    setSaid(true);
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: plan.day,
        phase: "gpc",
        target,
        correct: ok,
      }),
    });
    if (ok) {
      sfx.correct();
      say("Perfeito! Som certinho!", { mood: "hype" });
    } else {
      sfx.wrong();
      say(`Quase! O som é ${pronounce(target)}. Diz comigo!`, { mood: "gentle" });
    }
    setTimeout(next, ok ? 2200 : 3200);
  };

  return (
    <div className="min-h-screen mc-grass flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="mc-block bg-black/60 px-3 py-2 text-[9px]">
          ⛏ FASE 2 · MINERAÇÃO
        </div>
        <div className="mc-block bg-black/60 px-3 py-2 text-[9px]">
          {idx + 1}/{targets.length}
        </div>
      </div>

      <Mascot
        small
        autoSpeak={false}
        mood={reveal ? "excited" : "happy"}
        text={reveal ? `Diz o som: ${pronounce(target)}` : "Bate no bloco!"}
      />

      <button
        onClick={mine}
        disabled={reveal}
        className={`w-52 h-52 mc-block flex items-center justify-center relative mt-3 ${
          reveal ? "bg-[#f5c518] animate-pop" : "bg-[#8b8b8b] active:animate-mine"
        }`}
      >
        <span
          className="text-white font-bold"
          style={{
            fontSize: target.length > 2 ? 44 : 76,
            textShadow: "4px 4px 0 #000",
          }}
        >
          {reveal ? target : "?"}
        </span>
        {!reveal && hits > 0 && (
          <span className="absolute inset-0 pointer-events-none">
            <span className="absolute top-6 left-6 block w-20 h-1 bg-black/50 rotate-12" />
            {hits > 1 && (
              <span className="absolute bottom-8 right-6 block w-20 h-1 bg-black/50 rotate-45" />
            )}
          </span>
        )}
      </button>

      {!reveal && (
        <>
          <div className="mt-3 w-52 mc-hp h-4">
            <div style={{ width: `${(hits / HITS_NEEDED) * 100}%` }} />
          </div>
          <div className="text-[10px] mt-2 uppercase tracking-widest animate-pulse">
            👆 TOCA PARA MINAR
          </div>
        </>
      )}

      {reveal && !said && (
        <div className="mt-4">
          <VoiceAnswer
            onTranscript={handleSpeech}
            label="DIZ O SOM"
            autoStart={false}
          />
          <div className="mt-2 flex gap-2 justify-center">
            <McButton color="stone" size="sm" onClick={() => say(pronounce(target))}>
              🔊 OUVIR
            </McButton>
            <McButton color="wood" size="sm" onClick={next}>
              ⏭ SEGUINTE
            </McButton>
          </div>
        </div>
      )}
    </div>
  );
}
