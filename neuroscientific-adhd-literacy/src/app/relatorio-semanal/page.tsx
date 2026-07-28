"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { CURRICULUM } from "@/lib/curriculum";

type Hero = { id: number; name: string; xp: number; streak: number; currentDay: number };
type Progress = { day: number; accuracy: number; completed: boolean; xpEarned: number };
type Attempt = { day: number; phase: string; correct: boolean; createdAt: string };
type Mission = { id: number; title: string; completed: boolean; reward: number };
type Panel = { hero: Hero; progress: Progress[]; lastAttempts: Attempt[]; missions: Mission[] };

export default function RelatorioPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [data, setData] = useState<Panel | null>(null);

  useEffect(() => {
    fetch("/api/heroes").then((r) => r.json()).then((d) => {
      setHeroes(d.heroes ?? []);
      if (d.heroes?.length) setSel(d.heroes[0].id);
    });
  }, []);

  useEffect(() => {
    if (!sel) return;
    fetch(`/api/panel?heroId=${sel}`).then((r) => r.json()).then(setData);
  }, [sel]);

  if (!data)
    return (
      <div className="min-h-screen mc-sky p-4">
        <McTitle size="md">📊 RELATÓRIO SEMANAL</McTitle>
        <div className="mt-4 text-[11px]">Nenhum herói ou dados ainda.</div>
        <Link href="/"><McButton color="stone" size="sm" className="mt-4">← HOME</McButton></Link>
      </div>
    );

  const totalCorrect = data.lastAttempts.filter((a) => a.correct).length;
  const totalWrong = data.lastAttempts.length - totalCorrect;
  const acc = data.lastAttempts.length ? Math.round((totalCorrect / data.lastAttempts.length) * 100) : 0;
  const missionsDone = data.missions.filter((m) => m.completed).length;

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">📊 RELATÓRIO SEMANAL</McTitle>
          <Link href="/"><McButton color="stone" size="sm">← HOME</McButton></Link>
        </div>

        {heroes.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {heroes.map((h) => (
              <button key={h.id} onClick={() => setSel(h.id)}
                className={`mc-btn px-3 py-2 text-[10px] ${sel === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}>
                {h.name}
              </button>
            ))}
          </div>
        )}

        <div className="mc-panel p-4 mb-4">
          <div className="text-sm uppercase font-bold mb-3">{data.hero.name} · Semana</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px]">PRECISÃO</div>
              <div className="text-xl font-bold">{acc}%</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px]">ACERTOS</div>
              <div className="text-xl font-bold">{totalCorrect}</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px]">ERROS</div>
              <div className="text-xl font-bold">{totalWrong}</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px]">STREAK</div>
              <div className="text-xl font-bold">🔥 {data.hero.streak}</div>
            </div>
          </div>
        </div>

        <div className="mc-panel p-4 mb-4">
          <div className="text-[11px] uppercase mb-3 tracking-widest">Progresso 15 dias</div>
          {data.progress.length === 0 && <div className="text-[10px] opacity-80">Sem dados ainda</div>}
          <div className="space-y-1">
            {data.progress.map((p) => {
              const dp = CURRICULUM.find((c) => c.day === p.day);
              return (
                <div key={p.day} className="flex justify-between items-center text-[10px]">
                  <div className="flex-1">
                    <b>Dia {p.day}:</b> {dp?.world} · {p.accuracy}%
                  </div>
                  <div className={`px-2 py-1 mc-block ${p.completed ? "bg-[#5aab3a]" : "bg-[#c0392b]"}`}>
                    {p.completed ? "✓ DOMINADO" : "REPETIR"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mc-panel p-4">
          <div className="text-[11px] uppercase mb-3 tracking-widest">Comportamento (Missões)</div>
          <div className="text-[10px]">
            {missionsDone}/{data.missions.length} missões cumpridas
          </div>
          <div className="mt-3 space-y-1">
            {data.missions.slice(0, 5).map((m) => (
              <div key={m.id} className="text-[10px] flex justify-between">
                <span>{m.completed ? "✓" : "○"} {m.title}</span>
                <span>+{m.reward} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
