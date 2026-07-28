"use client";
import { useCallback, useEffect, useState } from "react";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";

type Day = { date: string; day: number; minutes: number };

export default function CalendarioPresenca() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [days, setDays] = useState<Day[]>([]);

  const load = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/attendance?heroId=${sel.id}`).then((r) => r.json());
    setDays(d.days ?? []);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageShell title="📅 CALENDÁRIO">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="📅 CALENDÁRIO">
        <EmptyHeroes />
      </PageShell>
    );

  const present = new Map(days.map((d) => [d.date, d]));
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  const totalMin = days.reduce((s, d) => s + d.minutes, 0);

  // Streak real: dias consecutivos até hoje
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (present.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0 && key === today.toISOString().slice(0, 10)) {
      cursor.setDate(cursor.getDate() - 1); // hoje ainda não jogou
    } else break;
    if (streak > 400) break;
  }

  const monthName = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <PageShell title="📅 CALENDÁRIO DE PRESENÇA">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="mc-panel p-4 mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="mc-block bg-black/40 p-3">
          <div className="text-[9px]">STREAK</div>
          <div className="text-xl font-bold">🔥 {streak}</div>
        </div>
        <div className="mc-block bg-black/40 p-3">
          <div className="text-[9px]">DIAS</div>
          <div className="text-xl font-bold">{days.length}</div>
        </div>
        <div className="mc-block bg-black/40 p-3">
          <div className="text-[9px]">MINUTOS</div>
          <div className="text-xl font-bold">{totalMin}</div>
        </div>
      </div>

      <div className="mc-panel p-4">
        <div className="text-[11px] uppercase tracking-widest mb-3 text-center">
          {monthName}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[8px] mb-1 opacity-70">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dnum = i + 1;
            const key = new Date(year, month, dnum).toISOString().slice(0, 10);
            const rec = present.get(key);
            const isToday = dnum === today.getDate();
            return (
              <div
                key={dnum}
                className={`mc-block aspect-square flex flex-col items-center justify-center text-[9px] ${
                  rec
                    ? "bg-[#5aab3a]"
                    : isToday
                      ? "bg-[#f5c518] text-black"
                      : "bg-[#5a5a5a] opacity-50"
                }`}
              >
                <div className="font-bold">{dnum}</div>
                {rec && <div className="text-[10px]">⛏</div>}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 justify-center mt-3 text-[8px]">
          <span>🟩 Jogou</span>
          <span>🟨 Hoje</span>
          <span>⬜ Faltou</span>
        </div>
      </div>

      <div className="mc-block bg-[#a06b3a] p-3 mt-4 text-[9px] leading-relaxed">
        💡 <b>Porquê o streak importa:</b> a consolidação da memória depende de
        prática distribuída e diária. Um dia de intervalo custa mais do que
        parece — melhor 10 minutos todos os dias do que 1 hora ao sábado.
      </div>
    </PageShell>
  );
}
