"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { api, getFamilyId } from "@/lib/session";

export type PickHero = {
  id: number;
  name: string;
  age: number;
  xp: number;
  gems: number;
  streak: number;
  currentDay: number;
  avatar: string;
  isTest: boolean;
  isAdult?: boolean;
  armorTier?: number;
};

export function useHeroes() {
  const [heroes, setHeroes] = useState<PickHero[]>([]);
  const [sel, setSel] = useState<PickHero | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const fam = getFamilyId();
    const path = fam ? `/api/heroes?familyId=${fam}` : "/api/heroes";
    const { data } = await api<{ heroes: PickHero[] }>(path);
    const list: PickHero[] = data.heroes ?? [];
    setHeroes(list);
    setSel((cur) => (cur ? list.find((h) => h.id === cur.id) ?? list[0] ?? null : list[0] ?? null));
    setLoading(false);
    return list;
  };

  useEffect(() => {
    reload();
  }, []);

  return { heroes, sel, setSel, loading, reload };
}

export function HeroTabs({
  heroes,
  sel,
  onSelect,
}: {
  heroes: PickHero[];
  sel: PickHero | null;
  onSelect: (h: PickHero) => void;
}) {
  if (heroes.length <= 1) return null;
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {heroes.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h)}
          className={`mc-btn px-3 py-2 text-[10px] ${
            sel?.id === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"
          }`}
        >
          {h.name}
        </button>
      ))}
    </div>
  );
}

export function PageShell({
  title,
  children,
  back = "/",
}: {
  title: string;
  children: React.ReactNode;
  back?: string;
}) {
  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4 gap-2">
          <McTitle size="sm">{title}</McTitle>
          <Link href={back}>
            <McButton color="stone" size="sm">
              ← VOLTAR
            </McButton>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyHeroes() {
  return (
    <div className="mc-block bg-black/30 p-6 text-center">
      <div className="text-3xl mb-2">👑</div>
      <div className="text-[11px]">
        Nenhuma criança adicionada. Só a <b>MÃE</b> pode adicionar heróis.
      </div>
      <Link href="/mae">
        <McButton color="gold" size="sm" className="mt-3">
          ÁREA DA MÃE
        </McButton>
      </Link>
    </div>
  );
}
