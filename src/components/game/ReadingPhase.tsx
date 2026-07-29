"use client";
import { useEffect, useMemo, useState } from "react";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import VoiceAnswer from "@/components/VoiceAnswer";
import PixelConfetti from "@/components/PixelConfetti";
import { DayPlan, isDecodable } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";
import { matchesTarget } from "@/lib/speech";

// FASE 4 — LEITURA DE PALAVRAS E FRASES 100% DECODÁVEIS.
// Aqui a criança lê DE VERDADE. Todas as palavras usam apenas
// letras já ensinadas — ela não pode adivinhar, tem de decodificar.
export default function ReadingPhase({
  hero,
  plan,
  onDone,
}: {
  hero: { id: number; name: string };
  plan: DayPlan;
  onDone: () => void;
}) {
  const list = useMemo(() => {
    const words = plan.words.slice(0, 6);
    const sentences = plan.sentences.slice(0, 2);
    return [...words, ...sentences];
  }, [plan]);

  const [i, setI] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [feedback, setFeedback] = useState<"none" | "ok" | "no">("none");
  const [showHelp, setShowHelp] = useState(false);

  const item = list[i];
  const isSentence = item?.includes(" ");

  useEffect(() => {
    if (!item) {
      onDone();
      return;
    }
    setFeedback("none");
    setShowHelp(false);
    say(
      i === 0
        ? `${hero.name}, agora lês a sério! Olha para a palavra e lê em voz alta.`
        : isSentence
          ? "Agora uma frase inteira! Lê devagar."
          : "Próxima palavra! Lê alto."
    );
  }, [i, item, hero.name, isSentence, onDone]);

  if (!item) return null;

  const next = () => {
    if (i + 1 < list.length) setI(i + 1);
    else {
      sfx.levelUp();
      say("Leste tudo! Vamos escrever agora!");
      setTimeout(onDone, 2200);
    }
  };

  const answer = async (text: string, alts: string[]) => {
    const correct = matchesTarget(item, [text, ...alts]);
    fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: plan.day,
        phase: isSentence ? "sentence" : "word",
        target: item,
        correct,
      }),
    });
    if (correct) {
      sfx.correct();
      setFeedback("ok");
      setConfetti(Date.now());
      say(`${item}! Leste certinho! És um leitor a sério!`, { mood: "hype" });
      setTimeout(next, 2600);
    } else {
      sfx.wrong();
      setFeedback("no");
      setShowHelp(true);
      say(`Vamos com calma. Lê comigo, som a som.`, { mood: "gentle" });
    }
  };

  // Ajuda: soletra em pedaços (sílaba a sílaba)
  const sound = () => {
    const chunks = item.split(" ");
    say(chunks.join(", "), { rate: 0.6 });
  };

  const decodable = isDecodable(item, plan.cumulative);

  return (
    <div className="min-h-screen mc-sand-bg text-black flex flex-col items-center justify-center p-4 relative">
      <PixelConfetti trigger={confetti} />
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px] text-white">
          📖 FASE 4 · LEITURA REAL
        </div>
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px] text-white">
          {i + 1}/{list.length}
        </div>
      </div>

      <Mascot
        small
        autoSpeak={false}
        mood={feedback === "ok" ? "excited" : feedback === "no" ? "thinking" : "happy"}
        text={isSentence ? "Lê a frase toda!" : "Lê esta palavra!"}
      />

      {/* A palavra em enorme, alto contraste — crítico para TDAH */}
      <button
        onClick={sound}
        className={`mc-block px-6 py-8 my-5 text-center max-w-full ${
          feedback === "ok" ? "bg-[#5aab3a] text-white" : "bg-white"
        }`}
      >
        <span
          className="font-bold tracking-wider"
          style={{
            fontSize: isSentence ? 26 : item.length > 5 ? 42 : 60,
            lineHeight: 1.3,
          }}
        >
          {item}
        </span>
      </button>

      {decodable && (
        <div className="text-[8px] uppercase opacity-60 mb-2">
          ✓ 100% decodificável com o que já aprendeste
        </div>
      )}

      {feedback !== "ok" && (
        <VoiceAnswer onTranscript={answer} label="LÊ ALTO" />
      )}

      {feedback === "ok" && (
        <div className="mc-block bg-[#5aab3a] text-white px-6 py-4 animate-pop text-sm">
          ✔ LESTE! +XP
        </div>
      )}

      {showHelp && (
        <div className="mc-block bg-[#f5c518] p-3 mt-4 max-w-xs text-center">
          <div className="text-[10px] mb-2">
            Vai devagar, som a som. Depois junta tudo!
          </div>
          <div className="flex gap-1 justify-center flex-wrap">
            {item.replace(/\s/g, "").split("").map((c, n) => (
              <button
                key={n}
                onClick={() => say(c, { rate: 0.7 })}
                className="mc-block bg-white w-9 h-9 font-bold"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2 flex-wrap justify-center">
        <McButton color="stone" size="sm" onClick={() => say(item, { rate: 0.7 })}>
          🔊 OUVIR
        </McButton>
        <McButton color="wood" size="sm" onClick={sound}>
          🐢 DEVAGAR
        </McButton>
        {feedback !== "ok" && (
          <McButton color="grass" size="sm" onClick={() => answer(item, [item])}>
            ✅ EU LI
          </McButton>
        )}
      </div>
    </div>
  );
}
