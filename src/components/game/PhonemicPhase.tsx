"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import VoiceAnswer from "@/components/VoiceAnswer";
import PixelConfetti from "@/components/PixelConfetti";
import { DayPlan } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";
import { matchesTarget } from "@/lib/speech";
import { pronounce } from "@/lib/pronounce";

// FASE 0 — CONSCIÊNCIA FONÊMICA (oral, SEM letras).
// É o preditor nº1 do sucesso na leitura (NRP 2000). A criança
// responde FALANDO — nunca escrevendo.
export default function PhonemicPhase({
  hero,
  plan,
  onDone,
}: {
  hero: { id: number; name: string };
  plan: DayPlan;
  onDone: () => void;
}) {
  const tasks = plan.phonemic;
  const [i, setI] = useState(0);
  const [result, setResult] = useState<"none" | "ok" | "no">("none");
  const [confetti, setConfetti] = useState(0);
  const [tries, setTries] = useState(0);

  const task = tasks[i];

  useEffect(() => {
    if (!task) return;
    setResult("none");
    setTries(0);
    const intro =
      i === 0
        ? `${hero.name}, treino de ouvido! Ouve bem e responde FALANDO. ${task.prompt}`
        : task.prompt;
    say(intro);
  }, [i, task, hero.name]);

  if (!task) {
    return null;
  }

  const record = async (correct: boolean) => {
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: plan.day,
        phase: "phonemic",
        target: task.answer,
        correct,
      }),
    });
  };

  const advance = () => {
    if (i + 1 < tasks.length) setI(i + 1);
    else {
      sfx.levelUp();
      say("Ouvido afinado! Agora vamos minerar as letras!");
      setTimeout(onDone, 2400);
    }
  };

  const handle = (text: string, alts: string[]) => {
    const ok = matchesTarget(task.answer, [text, ...alts]);
    if (ok) {
      sfx.correct();
      setResult("ok");
      setConfetti(Date.now());
      say("Isso mesmo! Ouvido de herói!");
      record(true);
      setTimeout(advance, 2400);
    } else {
      const n = tries + 1;
      setTries(n);
      sfx.wrong();
      setResult("no");
      if (n >= 2) {
        // Após 2 falhas: ENSINA a resposta (não deixa a criança frustrada)
        say(
          `A resposta é ${pronounce(task.answer)}. Diz comigo: ${pronounce(task.answer)}. Vamos ao próximo!`
        );
        record(false);
        setTimeout(advance, 3800);
      } else {
        say(`Quase! Ouve outra vez: ${task.prompt}`);
      }
    }
  };

  return (
    <div className="min-h-screen mc-sky flex flex-col items-center justify-center p-4 relative">
      <PixelConfetti trigger={confetti} />
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="mc-block bg-black/60 px-3 py-2 text-[9px]">
          👂 FASE 1 · OUVIDO DE HERÓI
        </div>
        <div className="mc-block bg-black/60 px-3 py-2 text-[9px]">
          {i + 1}/{tasks.length}
        </div>
      </div>

      <Mascot
        text={task.prompt}
        autoSpeak={false}
        mood={result === "ok" ? "excited" : result === "no" ? "sad" : "happy"}
      />

      {/* Se houver opções, mostra botões grandes; senão só voz */}
      {task.options && (
        <div className="flex gap-3 mt-4">
          {task.options.map((o) => (
            <button
              key={o}
              onClick={() => handle(o, [o])}
              className="mc-block bg-[#a06b3a] w-20 h-20 flex items-center justify-center text-3xl font-bold"
            >
              {o}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5">
        <VoiceAnswer
          onTranscript={handle}
          label="RESPONDE"
          showTranscript
        />
      </div>

      {result === "ok" && (
        <div className="mc-block bg-[#5aab3a] px-5 py-3 mt-4 animate-pop text-sm">
          ✔ CERTÍSSIMO!
        </div>
      )}
      {result === "no" && (
        <div className="mc-block bg-[#c0392b] px-5 py-3 mt-4 text-[10px]">
          Tenta outra vez! Fala bem perto.
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <McButton color="stone" size="sm" onClick={() => say(task.prompt)}>
          🔊 REPETIR
        </McButton>
        <McButton
          color="wood"
          size="sm"
          onClick={() => {
            say(`A resposta é ${pronounce(task.answer)}`);
            record(false);
            setTimeout(advance, 2400);
          }}
        >
          🤔 NÃO SEI
        </McButton>
      </div>
    </div>
  );
}
