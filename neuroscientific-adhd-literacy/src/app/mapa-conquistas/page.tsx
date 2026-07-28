"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { CURRICULUM } from "@/lib/curriculum";

type Hero = { id: number; name: string; currentDay: number };
type Progress = { day: number; accuracy: number; completed: boolean };

export default function MapaConquistas() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [hero, setHero] = useState<Hero | null>(null);

  useEffect(() => {
    fetch("/api/heroes")
      .then((r) => r.json())
      .then((d) => {
        setHeroes(d.heroes ?? []);
        if (d.heroes?.length) setSel(d.heroes[0].id);
      });
  }, []);

  useEffect(() => {
    if (!sel) return;
    fetch(`/api/panel?heroId=${sel}`)
      .then((r) => r.json())
      .then((d) => {
        setHero(d.hero);
        setProgress(d.progress || []);
      });
  }, [sel]);

  const byDay = new Map(progress.map((p) => [p.day, p]));
  const donePct = hero ? Math.round(((hero.currentDay - 1) / 15) * 100) : 0;

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">🗺️ MAPA DE CONQUISTAS</McTitle>
          <Link href="/">
            <McButton color="stone" size="sm">← HOME</McButton>
          </Link>
        </div>

        {heroes.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {heroes.map((h) => (
              <button
                key={h.id}
                onClick={() => setSel(h.id)}
                className={`mc-btn px-3 py-2 text-[10px] ${sel === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}

        {hero && (
          <div className="mc-panel p-4 mb-4">
            <div className="flex justify-between items-baseline">
              <div className="text-sm font-bold uppercase">{hero.name}</div>
              <div className="text-xs">{donePct}% completo</div>
            </div>
            <div className="mt-2 mc-hp h-3">
              <div style={{ width: `${donePct}%`, background: "linear-gradient(180deg,#ffe066,#f5c518)" }} />
            </div>
            <div className="mt-2 text-[10px] opacity-90">
              Faltam {Math.max(0, 15 - hero.currentDay + 1)} dias para o Prémio de Chefe 🏆
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2">
          {CURRICULUM.map((d) => {
            const p = byDay.get(d.day);
            const unlocked = hero ? d.day <= hero.currentDay : false;
            const active = hero?.currentDay === d.day;
            const done = p?.completed;
            return (
              <div
                key={d.day}
                className={`mc-block p-3 ${done ? "bg-[#5aab3a]" : active ? "bg-[#f5c518] text-black" : unlocked ? "bg-[#a06b3a]" : "bg-[#8b8b8b] opacity-60"}`}
              >
                <div className="text-[9px] uppercase">Dia {d.day}</div>
                <div className="text-lg">{done ? "🏆" : unlocked ? "⛏️" : "🔒"}</div>
                <div className="text-[8px] opacity-90 leading-tight">{d.world}</div>
                {p && !done && (
                  <div className="text-[8px] mt-1 opacity-90">{p.accuracy}%</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 mc-block bg-[#f5c518] text-black p-4 text-center">
          <div className="text-2xl">👑</div>
          <div className="text-sm font-bold uppercase">Prémio de Chefe</div>
          <div className="text-[10px]">Completa os 15 dias e recebe o título de HERÓI DA LEITURA!</div>
        </div>
      </div>
    </div>
  );
}
