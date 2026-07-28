"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import PixelConfetti from "@/components/PixelConfetti";
import { say, sfx } from "@/lib/voice";

// TUTORIAL DA CRIANÇA — 100% narrado, sem exigir leitura.
const STEPS = [
  {
    icon: "🎤",
    title: "FALA COMIGO",
    speech:
      "Olá herói! Eu sou o teu guia. Tu não precisas de escrever nada. Quando vires o microfone azul, toca nele e FALA. Eu ouço-te!",
  },
  {
    icon: "⛏️",
    title: "MINA AS LETRAS",
    speech:
      "Vais bater em blocos de pedra até partirem. Lá dentro estão escondidas as letras. Bate, bate, bate!",
  },
  {
    icon: "🔗",
    title: "JUNTA OS SONS",
    speech:
      "Depois juntas os sons: mmm mais á faz MÁ. É assim que se lê! Cada som é uma peça.",
  },
  {
    icon: "💚",
    title: "VENCE O CREEPER",
    speech:
      "O Creeper da Confusão vai aparecer. Cada palavra que leres certo tira-lhe uma vida. Tu és mais forte que ele!",
  },
  {
    icon: "✍️",
    title: "ESCREVE E TIRA FOTO",
    speech:
      "No fim, escreves num papel e tiras uma foto. Os teus pais vão ver e ficar muito orgulhosos!",
  },
  {
    icon: "🎁",
    title: "GANHA GEMAS",
    speech:
      "Cada acerto dá-te XP e gemas. Com gemas compras capas, espadas e coroas na Loja!",
  },
  {
    icon: "🧠",
    title: "O TEU CÉREBRO",
    speech:
      "Cada letra que aprendes constrói uma estrada nova no teu cérebro. Ver televisão não constrói nada. Aqui ficas mais forte a sério!",
  },
];

export default function TutorialJogador() {
  const [i, setI] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  useEffect(() => {
    say(step.speech);
  }, [i, step.speech]);

  return (
    <div className="min-h-screen mc-sky flex flex-col items-center justify-center p-4">
      <PixelConfetti trigger={confetti} />

      <div className="text-[10px] uppercase tracking-widest mb-3">
        Tutorial · {i + 1}/{STEPS.length}
      </div>

      <div className="text-7xl mb-3 animate-float">{step.icon}</div>
      <div className="mc-block bg-[#f5c518] text-black px-5 py-3 mb-4 font-bold text-sm">
        {step.title}
      </div>

      <Mascot autoSpeak={false} text={step.speech} />

      <div className="flex gap-2 mt-6">
        {i > 0 && (
          <McButton
            color="stone"
            onClick={() => {
              sfx.click();
              setI(i - 1);
            }}
          >
            ← ANTES
          </McButton>
        )}
        {!last ? (
          <McButton
            color="grass"
            size="lg"
            onClick={() => {
              sfx.click();
              setI(i + 1);
            }}
          >
            PRÓXIMO →
          </McButton>
        ) : (
          <Link href="/jogar">
            <McButton
              color="gold"
              size="lg"
              onClick={() => {
                setConfetti(Date.now());
                sfx.levelUp();
                say("Estás pronto! Vamos à aventura!");
              }}
            >
              🎮 COMEÇAR A JOGAR!
            </McButton>
          </Link>
        )}
      </div>

      <div className="flex gap-1 mt-5">
        {STEPS.map((_, n) => (
          <div
            key={n}
            className={`w-3 h-3 mc-block ${n <= i ? "bg-[#f5c518]" : "bg-white/30"}`}
          />
        ))}
      </div>

      <Link href="/" className="mt-6">
        <McButton color="stone" size="sm">
          ← SAIR
        </McButton>
      </Link>
    </div>
  );
}
