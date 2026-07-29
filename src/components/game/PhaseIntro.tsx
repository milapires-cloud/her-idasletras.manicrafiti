"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import { say, sfx } from "@/lib/voice";
import type { Mood } from "@/lib/voice";

// EXPLICAÇÃO DA FASE. Aparece antes de cada etapa com narração
// expressiva e uma frase clara do que fazer.
export default function PhaseIntro({
  title,
  emoji,
  color = "#5aab3a",
  narration,
  mood = "story",
  onStart,
  buttonLabel = "COMEÇAR!",
}: {
  title: string;
  emoji: string;
  color?: string;
  narration: string;
  mood?: Mood;
  onStart: () => void;
  buttonLabel?: string;
}) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    say(narration, { mood });
    // pequena animação de entrada
    const t = setTimeout(() => setStep(1), 250);
    return () => clearTimeout(t);
  }, [narration, mood]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 text-white"
      style={{
        background: `radial-gradient(circle at 50% 30%, ${color}, #0f0620)`,
      }}
    >
      <div className={`text-8xl mb-4 ${step ? "animate-pop" : "opacity-0"}`}>
        {emoji}
      </div>
      <div className="mc-block bg-[#f5c518] text-black px-5 py-3 text-lg font-bold text-center mb-4">
        {title}
      </div>
      <div className="mc-block bg-white text-black px-4 py-3 text-[11px] max-w-sm text-center leading-relaxed">
        {narration}
      </div>
      <div className="flex gap-2 mt-6">
        <McButton
          color="stone"
          size="sm"
          onClick={() => say(narration, { mood })}
        >
          🔊 OUVIR
        </McButton>
        <McButton
          color="gold"
          size="lg"
          onClick={() => {
            sfx.click();
            onStart();
          }}
        >
          ▶ {buttonLabel}
        </McButton>
      </div>
    </div>
  );
}
