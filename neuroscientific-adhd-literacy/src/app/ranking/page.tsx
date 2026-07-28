"use client";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/HeroPicker";

type Row = {
  id: number;
  name: string;
  xp: number;
  gems: number;
  streak: number;
  currentDay: number;
  isTest: boolean;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Ranking() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/heroes")
      .then((r) => r.json())
      .then((d) => {
        const list: Row[] = (d.heroes ?? []).filter((h: Row) => !h.isTest);
        list.sort((a, b) => b.xp - a.xp);
        setRows(list);
      });
  }, []);

  const max = Math.max(1, ...rows.map((r) => r.xp));

  return (
    <PageShell title="🏆 RANKING">
      <div className="mc-panel p-4 mb-4 text-center">
        <div className="text-[10px] opacity-90 leading-relaxed">
          Compara o desempenho entre irmãos e amiguinhos da escola. A competição
          saudável multiplica a motivação — mas cada herói avança no seu ritmo.
        </div>
      </div>

      {rows.length === 0 && (
        <div className="mc-block bg-black/30 p-4 text-center text-[10px]">
          Ainda não há heróis no ranking.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={r.id}
            className={`mc-block p-3 ${
              i === 0 ? "bg-[#f5c518] text-black" : i === 1 ? "bg-[#b0b0b0] text-black" : i === 2 ? "bg-[#a06b3a]" : "bg-[#5a4020]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl w-8 text-center">
                {MEDALS[i] ?? `${i + 1}º`}
              </div>
              <div className="w-9 h-9 mc-block bg-[#7a3fbe] text-white flex items-center justify-center font-bold uppercase">
                {r.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-bold uppercase">{r.name}</div>
                <div className="text-[9px] opacity-80">
                  Dia {r.currentDay}/15 · 💎 {r.gems} · 🔥 {r.streak}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{r.xp}</div>
                <div className="text-[8px]">XP</div>
              </div>
            </div>
            <div className="mt-2 mc-hp h-2">
              <div
                style={{
                  width: `${(r.xp / max) * 100}%`,
                  background: "linear-gradient(180deg,#7fd977,#4caf50)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
