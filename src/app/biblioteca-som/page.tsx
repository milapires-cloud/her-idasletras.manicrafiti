"use client";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { speak } from "@/components/Mascot";

const LIB = [
  {
    title: "Vogais",
    sounds: [
      { l: "A", say: "a" }, { l: "E", say: "é" }, { l: "I", say: "i" },
      { l: "O", say: "ó" }, { l: "U", say: "u" },
    ],
  },
  {
    title: "Explosivas Labiais",
    sounds: [{ l: "P", say: "pê" }, { l: "B", say: "bê" }],
  },
  {
    title: "Dentais",
    sounds: [{ l: "T", say: "tê" }, { l: "D", say: "dê" }],
  },
  {
    title: "Nasais",
    sounds: [{ l: "M", say: "eme" }, { l: "N", say: "ene" }],
  },
  {
    title: "Vibrantes / Contínuas",
    sounds: [
      { l: "R", say: "erre" }, { l: "L", say: "éle" },
      { l: "S", say: "esse" }, { l: "F", say: "efe" },
    ],
  },
  {
    title: "Sílabas de exemplo",
    sounds: ["BA", "BE", "BI", "BO", "BU", "MA", "PA", "TA"].map((s) => ({ l: s, say: s })),
  },
];

export default function BibliotecaSom() {
  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">🎧 BIBLIOTECA DE SOM</McTitle>
          <Link href="/"><McButton color="stone" size="sm">← HOME</McButton></Link>
        </div>
        <p className="text-[10px] opacity-90 mb-4">Toca em qualquer bloco para ouvir a pronúncia correta.</p>

        <div className="space-y-4">
          {LIB.map((g) => (
            <div key={g.title} className="mc-panel p-4">
              <div className="text-[11px] uppercase tracking-widest mb-2">{g.title}</div>
              <div className="grid grid-cols-5 gap-2">
                {g.sounds.map((s) => (
                  <button key={s.l} onClick={() => speak(s.say)}
                    className="mc-block bg-[#a06b3a] p-3 text-center hover:brightness-110">
                    <div className="text-2xl font-bold" style={{ textShadow: "2px 2px 0 #000" }}>{s.l}</div>
                    <div className="text-[9px] mt-1 opacity-80">🔊</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
