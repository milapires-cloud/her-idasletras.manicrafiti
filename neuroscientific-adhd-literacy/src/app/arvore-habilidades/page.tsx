"use client";
import { useCallback, useEffect, useState } from "react";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";
import { SKILL_TREE } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";

type Progress = { day: number; completed: boolean; accuracy: number };

export default function ArvoreHabilidades() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [progress, setProgress] = useState<Progress[]>([]);

  const load = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/panel?heroId=${sel.id}`).then((r) => r.json());
    setProgress(d.progress ?? []);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageShell title="🌳 ÁRVORE DE HABILIDADES">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🌳 ÁRVORE DE HABILIDADES">
        <EmptyHeroes />
      </PageShell>
    );

  const doneDays = new Set(progress.filter((p) => p.completed).map((p) => p.day));
  const tiers = [...new Set(SKILL_TREE.map((s) => s.tier))].sort();
  const unlocked = SKILL_TREE.filter((s) => doneDays.has(s.day)).length;

  return (
    <PageShell title="🌳 ÁRVORE DE HABILIDADES">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="mc-panel p-4 mb-4 text-center">
        <div className="text-sm font-bold uppercase">{sel.name}</div>
        <div className="text-[10px] mt-1">
          {unlocked}/{SKILL_TREE.length} habilidades desbloqueadas
        </div>
        <div className="mt-2 mc-hp h-3">
          <div
            style={{
              width: `${(unlocked / SKILL_TREE.length) * 100}%`,
              background: "linear-gradient(180deg,#7fd977,#4caf50)",
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => (
          <div key={tier}>
            <div className="text-[9px] uppercase tracking-widest opacity-70 mb-1 text-center">
              ── Nível {tier} ──
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {SKILL_TREE.filter((s) => s.tier === tier).map((s) => {
                const on = doneDays.has(s.day);
                const current = sel.currentDay === s.day;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      sfx.click();
                      say(
                        on
                          ? `${s.name}: desbloqueado! Dominaste isto no dia ${s.day}.`
                          : `${s.name}: bloqueado. Chega ao dia ${s.day} para desbloquear.`
                      );
                    }}
                    className={`mc-block w-24 p-2 text-center ${
                      on
                        ? "bg-[#5aab3a]"
                        : current
                          ? "bg-[#f5c518] text-black animate-pulse"
                          : "bg-[#5a5a5a] opacity-60"
                    }`}
                  >
                    <div className="text-2xl">{on ? s.icon : "🔒"}</div>
                    <div className="text-[8px] leading-tight mt-1">{s.name}</div>
                    <div className="text-[7px] opacity-70">Dia {s.day}</div>
                  </button>
                );
              })}
            </div>
            {tier < tiers.length && (
              <div className="text-center text-lg opacity-40">↓</div>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
