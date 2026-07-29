"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";

type Hero = { id: number; name: string };
type Diary = {
  id: number;
  day: number;
  mood: string;
  school: string;
  dream: string;
  friend: string;
  createdAt: string;
};

const MOOD_EMOJI: Record<string, string> = {
  feliz: "😄",
  animado: "🤩",
  cansado: "😴",
  triste: "😢",
  bravo: "😠",
};

export default function PainelHumor() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [diary, setDiary] = useState<Diary[]>([]);

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
    fetch(`/api/diary?heroId=${sel}`)
      .then((r) => r.json())
      .then((d) => setDiary(d.diary ?? []));
  }, [sel]);

  const counts = diary.reduce<Record<string, number>>((acc, d) => {
    acc[d.mood] = (acc[d.mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">😊 PAINEL DE HUMOR</McTitle>
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
          <div className="text-[11px] uppercase mb-3 tracking-widest">Resumo emocional</div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(MOOD_EMOJI).map(([k, e]) => (
              <div key={k} className="mc-block bg-black/40 p-3 text-center">
                <div className="text-2xl">{e}</div>
                <div className="text-[9px] uppercase">{k}</div>
                <div className="text-lg font-bold">{counts[k] ?? 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {diary.length === 0 && (
            <div className="mc-block bg-black/30 p-4 text-center text-[11px]">
              Sem check-ins ainda. Aparece após a primeira sessão.
            </div>
          )}
          {diary.map((d) => (
            <div key={d.id} className="mc-block bg-[#0f0620] p-3 text-white">
              <div className="flex justify-between items-center">
                <div className="text-[10px] uppercase opacity-70">Dia {d.day} · {new Date(d.createdAt).toLocaleDateString("pt-BR")}</div>
                <div className="text-2xl">{MOOD_EMOJI[d.mood]}</div>
              </div>
              {d.school && <div className="text-[10px] mt-2"><b>🎒 Escola:</b> {d.school}</div>}
              {d.friend && <div className="text-[10px] mt-1"><b>👥 Amigo:</b> {d.friend}</div>}
              {d.dream && <div className="text-[10px] mt-1"><b>💭 Sonho:</b> {d.dream}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
