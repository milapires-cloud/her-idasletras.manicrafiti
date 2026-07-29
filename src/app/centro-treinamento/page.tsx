"use client";
import { useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { speak } from "@/components/Mascot";

const DRILLS = [
  { label: "Vogais A E I O U", targets: ["A", "E", "I", "O", "U"] },
  { label: "P B", targets: ["P", "B", "PA", "BA"] },
  { label: "T D", targets: ["T", "D", "TA", "DA"] },
  { label: "M N", targets: ["M", "N", "MA", "NA"] },
  { label: "Sílabas com A", targets: ["BA", "PA", "MA", "TA", "LA"] },
  { label: "Palavras curtas", targets: ["MAPA", "BOLA", "PATO", "LATA"] },
];

export default function CentroTreino() {
  const [active, setActive] = useState<number | null>(null);
  const [i, setI] = useState(0);

  const play = (n: number) => {
    setActive(n);
    setI(0);
    speak(DRILLS[n].targets[0]);
  };

  const next = () => {
    if (active === null) return;
    const arr = DRILLS[active].targets;
    const ni = (i + 1) % arr.length;
    setI(ni);
    speak(arr[ni]);
  };

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">⛏️ CENTRO DE TREINO</McTitle>
          <Link href="/"><McButton color="stone" size="sm">← HOME</McButton></Link>
        </div>

        <p className="text-[10px] opacity-90 mb-4">Reforço rápido sem grade — treina o que quiseres.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {DRILLS.map((d, n) => (
            <button key={n} onClick={() => play(n)}
              className={`mc-btn p-3 text-center text-[11px] ${active === n ? "bg-[#f5c518] text-black" : "bg-[#a06b3a]"}`}>
              {d.label}
            </button>
          ))}
        </div>

        {active !== null && (
          <div className="mc-panel p-6 text-center">
            <div className="text-[10px] uppercase opacity-80 mb-2">{DRILLS[active].label}</div>
            <div className="text-6xl font-bold my-6" style={{ textShadow: "3px 3px 0 #000" }}>
              {DRILLS[active].targets[i]}
            </div>
            <div className="flex gap-2 justify-center">
              <McButton color="stone" onClick={() => speak(DRILLS[active].targets[i])}>🔊 OUVIR</McButton>
              <McButton color="grass" onClick={next}>PRÓXIMO →</McButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
