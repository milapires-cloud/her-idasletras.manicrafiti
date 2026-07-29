"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import VoiceAnswer from "@/components/VoiceAnswer";
import { say, sfx } from "@/lib/voice";

type Hero = { id: number; name: string; currentDay: number };

const MOODS = [
  { key: "feliz", emoji: "😄", label: "Feliz" },
  { key: "animado", emoji: "🤩", label: "Animado" },
  { key: "cansado", emoji: "😴", label: "Cansado" },
  { key: "triste", emoji: "😢", label: "Triste" },
  { key: "bravo", emoji: "😠", label: "Bravo" },
];

// PROTEÇÃO INFANTIL: nada de "segredo com a máquina". O mascote diz
// a verdade — o que ele contar chega à mãe, para ela poder ajudar.
// Isto mantém a criança segura e transforma o desabafo em ação real
// de cuidado parental.
const QUESTIONS = [
  {
    key: "school",
    q: "Foste à escola hoje? Conta-me uma coisa que aconteceu!",
    icon: "🎒",
  },
  {
    key: "friend",
    q: "Tens um melhor amigo? Como se chama?",
    icon: "👥",
  },
  {
    key: "dream",
    q: "Qual é o teu maior sonho quando fores grande?",
    icon: "💭",
  },
  {
    key: "secret",
    q: "Agora o mais importante: há alguma coisa que te deixou triste ou com medo? Conta-me. Eu vou contar à tua mãe para ela te poder ajudar — ela gosta muito de ti.",
    icon: "💗",
  },
];

export default function EmotionalCheckin({
  hero,
  onDone,
}: {
  hero: Hero;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [heard, setHeard] = useState("");

  const currentQ = step > 0 ? QUESTIONS[step - 1] : null;

  useEffect(() => {
    if (step === 0) {
      say(
        `Olá ${hero.name}! Que bom ver-te outra vez! Antes da missão: como te sentes hoje? Toca na carinha!`
      );
    } else if (currentQ) {
      say(currentQ.q);
      setHeard("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finish = async (final: Record<string, string>) => {
    await fetch("/api/diary", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: hero.currentDay,
        mood,
        ...final,
      }),
    });
    fetch("/api/attendance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroId: hero.id, day: hero.currentDay }),
    });
    onDone();
  };

  const saveAndNext = (value: string) => {
    if (!currentQ) return;
    const next = { ...answers, [currentQ.key]: value };
    setAnswers(next);
    setHeard("");
    if (step >= QUESTIONS.length) {
      say("Obrigado por me contares! Agora vamos à missão!");
      setTimeout(() => finish(next), 2200);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen mc-sky flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full flex flex-col items-center">
        <Mascot
          autoSpeak={false}
          text={
            step === 0
              ? `Olá ${hero.name}! Como te sentes hoje?`
              : currentQ!.q
          }
        />

        {step === 0 && (
          <div className="mt-6 grid grid-cols-5 gap-2 w-full">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  sfx.click();
                  setMood(m.key);
                  setStep(1);
                }}
                className="mc-block bg-white text-black p-3 flex flex-col items-center hover:brightness-110"
              >
                <div className="text-3xl">{m.emoji}</div>
                <div className="text-[8px] mt-1">{m.label}</div>
              </button>
            ))}
          </div>
        )}

        {step > 0 && currentQ && (
          <div className="mt-5 w-full flex flex-col items-center gap-3">
            <div className="text-4xl">{currentQ.icon}</div>

            <VoiceAnswer
              onTranscript={(text) => {
                setHeard(text);
                sfx.correct();
                say("Obrigado por me contares!");
              }}
              label="CONTA-ME"
              showTranscript
            />

            {currentQ.key === "secret" && (
              <div className="mc-block bg-[#f5c518] text-black px-3 py-2 text-[9px] max-w-xs text-center">
                💗 A tua mãe vai ver isto para te poder ajudar. Não é segredo —
                é cuidado.
              </div>
            )}

            <div className="flex gap-2 w-full">
              <McButton
                color="stone"
                onClick={() => {
                  sfx.click();
                  saveAndNext("");
                }}
              >
                PULAR
              </McButton>
              <McButton
                color="grass"
                className="flex-1"
                disabled={!heard}
                onClick={() => {
                  sfx.click();
                  saveAndNext(heard);
                }}
              >
                {step >= QUESTIONS.length ? "TERMINAR ✔" : "PRÓXIMA →"}
              </McButton>
            </div>

            <div className="text-[9px] opacity-70">
              {step}/{QUESTIONS.length}
            </div>

            <McButton
              color="gold"
              className="w-full"
              onClick={() => {
                sfx.click();
                say("Vamos direto para a missão! Bora minar letras!");
                finish(answers);
              }}
            >
              ⏩ IR DIRETO PARA O JOGO
            </McButton>
          </div>
        )}
      </div>
    </div>
  );
}
