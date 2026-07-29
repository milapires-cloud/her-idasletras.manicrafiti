"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";
import { CURRICULUM, SKILL_TREE } from "@/lib/curriculum";
import { armorForXp, nextArmor, ARMORS } from "@/lib/monsters";
import { say, sfx } from "@/lib/voice";

type Progress = { day: number; completed: boolean; accuracy: number };
type Item = { id: number; icon: string; itemName: string; equipped: boolean };

function ArmorPanel({ xp }: { xp: number }) {
  const cur = armorForXp(xp);
  const next = nextArmor(xp);
  const progress = next
    ? Math.round(
        ((xp - cur.minXp) / (next.minXp - cur.minXp)) * 100
      )
    : 100;
  return (
    <div className="mc-panel p-4 mb-4">
      <div className="text-[11px] uppercase tracking-widest mb-3 text-center">
        🛡️ ARMADURA ATUAL
      </div>
      <div className="flex items-center gap-3">
        <div
          className="w-16 h-16 mc-block flex items-center justify-center text-3xl"
          style={{ background: cur.color }}
        >
          {cur.helmet || "👕"}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">{cur.name}</div>
          {next ? (
            <>
              <div className="text-[9px] opacity-80 mt-1">
                Próxima: {next.name} ({next.minXp} XP)
              </div>
              <div className="mc-hp h-3 mt-1">
                <div
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(180deg,#ffe066,#f5c518)",
                  }}
                />
              </div>
              <div className="text-[8px] mt-1">
                Faltam {next.minXp - xp} XP para melhorar!
              </div>
            </>
          ) : (
            <div className="text-[9px] text-[#f5c518] mt-1">
              ⭐ ARMADURA MÁXIMA! És uma lenda!
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-1 mt-3 justify-center">
        {ARMORS.map((a) => (
          <div
            key={a.tier}
            className={`w-9 h-9 mc-block flex items-center justify-center text-sm ${xp >= a.minXp ? "" : "opacity-30"}`}
            style={{ background: a.color }}
            title={a.name}
          >
            {xp >= a.minXp ? a.helmet || "✓" : "🔒"}
          </div>
        ))}
      </div>
    </div>
  );
}

const TITLES = [
  { min: 0, t: "Aprendiz de Minerador" },
  { min: 500, t: "Caçador de Letras" },
  { min: 1500, t: "Mestre das Sílabas" },
  { min: 3000, t: "Domador de Creepers" },
  { min: 5000, t: "Leitor de Elite" },
  { min: 8000, t: "HERÓI DA LEITURA 👑" },
];

export default function PerfilHeroi() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [photos, setPhotos] = useState<number>(0);

  const load = useCallback(async () => {
    if (!sel) return;
    const [p, inv, ph] = await Promise.all([
      fetch(`/api/panel?heroId=${sel.id}`).then((r) => r.json()),
      fetch(`/api/inventory?heroId=${sel.id}`).then((r) => r.json()),
      fetch(`/api/photos?heroId=${sel.id}`).then((r) => r.json()),
    ]);
    setProgress(p.progress ?? []);
    setItems(inv.items ?? []);
    setPhotos((ph.photos ?? []).length);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageShell title="🦸 PERFIL DO HERÓI">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🦸 PERFIL DO HERÓI">
        <EmptyHeroes />
      </PageShell>
    );

  const done = progress.filter((p) => p.completed);
  const avgAcc = progress.length
    ? Math.round(progress.reduce((s, p) => s + p.accuracy, 0) / progress.length)
    : 0;
  const title = [...TITLES].reverse().find((t) => sel.xp >= t.min)!.t;
  const equipped = items.filter((i) => i.equipped);
  const skills = SKILL_TREE.filter((s) =>
    done.some((d) => d.day === s.day)
  );
  const plan = CURRICULUM[Math.min(sel.currentDay, 15) - 1];

  return (
    <PageShell title="🦸 PERFIL DO HERÓI">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      {/* Cartão do herói */}
      <div className="mc-panel p-5 mb-4 text-center">
        <button
          onClick={() => {
            sfx.levelUp();
            say(`${sel.name}, ${title}! Já tens ${sel.xp} pontos de experiência!`);
          }}
          className="flex flex-col items-center w-full"
        >
          <div className="w-24 h-28 relative animate-float">
            <div className="mc-block bg-[#e0b48a] w-full h-1/2 flex items-center justify-center gap-1">
              <div className="w-2.5 h-3 bg-black" />
              <div className="w-2.5 h-3 bg-black" />
            </div>
            <div className="mc-block bg-[#4fd0e0] w-full h-1/2" />
          </div>
          <div className="flex gap-1 text-2xl mt-1 h-8">
            {equipped.map((e) => (
              <span key={e.id}>{e.icon}</span>
            ))}
          </div>
          <div className="text-lg font-bold uppercase mt-2">{sel.name}</div>
          <div className="mc-block bg-[#f5c518] text-black px-3 py-1 text-[10px] mt-2">
            {title}
          </div>
          <div className="text-[9px] opacity-70 mt-1">{sel.age} anos 🔊</div>
        </button>
      </div>

      {/* ARMADURA — evolui com XP */}
      <ArmorPanel xp={sel.xp} />

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { l: "XP", v: sel.xp, i: "⭐" },
          { l: "GEMAS", v: sel.gems, i: "💎" },
          { l: "STREAK", v: sel.streak, i: "🔥" },
          { l: "DIA", v: `${sel.currentDay}/15`, i: "📅" },
          { l: "PRECISÃO", v: `${avgAcc}%`, i: "🎯" },
          { l: "ESCRITAS", v: photos, i: "📷" },
        ].map((s) => (
          <div key={s.l} className="mc-block bg-[#5a4020] p-3 text-center">
            <div className="text-lg">{s.i}</div>
            <div className="text-base font-bold">{s.v}</div>
            <div className="text-[8px] opacity-80">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Missão de hoje */}
      <div className="mc-panel p-4 mb-4">
        <div className="text-[10px] uppercase tracking-widest mb-2">
          Missão de hoje
        </div>
        <div className="text-[11px] font-bold">{plan.world}</div>
        <div className="text-[10px] opacity-90 mt-1">{plan.focus}</div>
        <Link href="/jogar">
          <McButton color="grass" className="w-full mt-3">
            🎮 CONTINUAR MISSÃO
          </McButton>
        </Link>
      </div>

      {/* Medalhas de habilidade */}
      <div className="mc-panel p-4">
        <div className="text-[10px] uppercase tracking-widest mb-3">
          Medalhas conquistadas ({skills.length})
        </div>
        {skills.length === 0 ? (
          <div className="text-[10px] opacity-70 text-center">
            Ainda nenhuma. Completa o primeiro dia!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <div
                key={s.id}
                className="mc-block bg-[#5aab3a] px-2 py-2 text-center w-20"
              >
                <div className="text-xl">{s.icon}</div>
                <div className="text-[8px] leading-tight">{s.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <Link href="/arvore-habilidades">
          <McButton color="wood" size="sm">🌳 ÁRVORE</McButton>
        </Link>
        <Link href="/inventario">
          <McButton color="wood" size="sm">🎒 INVENTÁRIO</McButton>
        </Link>
        <Link href="/galeria-herois">
          <McButton color="wood" size="sm">🖼️ GALERIA</McButton>
        </Link>
      </div>
    </PageShell>
  );
}
