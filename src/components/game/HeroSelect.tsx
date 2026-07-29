"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { setActiveHeroId } from "@/lib/storage";
import { api, getFamilyId } from "@/lib/session";
import { say, sfx } from "@/lib/voice";
import { armorForXp } from "@/lib/monsters";

type Hero = {
  id: number;
  name: string;
  age: number;
  xp: number;
  currentDay: number;
  isTest: boolean;
  isAdult: boolean;
};

// A criança só ESCOLHE quem joga. Quem cadastra é a mãe.
// O perfil de teste só aparece se veio explicitamente do modo teste.
export default function HeroSelect({
  onPick,
  forceTest = false,
}: {
  onPick: (hero: Hero) => void;
  forceTest?: boolean;
}) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const fam = getFamilyId();
    const path = fam ? `/api/heroes?familyId=${fam}` : "/api/heroes";
    const { data } = await api<{ heroes: Hero[] }>(path);
    setHeroes(data.heroes ?? []);
    setLoading(false);
    return (data.heroes ?? []) as Hero[];
  }, []);

  const enterTest = useCallback(
    async (list?: Hero[]) => {
      const arr = list ?? heroes;
      const test = arr.find((h) => h.isTest);
      if (test) {
        setActiveHeroId(test.id);
        onPick(test);
        return;
      }
      const { data } = await api<{ hero: Hero }>("/api/heroes", {
        method: "POST",
        body: { name: "Herói de Teste", isTest: true },
      });
      if (data.hero) {
        setActiveHeroId(data.hero.id);
        onPick(data.hero);
      }
    },
    [heroes, onPick]
  );

  useEffect(() => {
    load().then((list) => {
      if (forceTest) enterTest(list);
      else say("Escolhe o teu herói! Toca no teu nome para começar!");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceTest]);

  // No modo normal, esconde perfis de teste.
  const visible = heroes.filter((h) => (forceTest ? true : !h.isTest));

  return (
    <div className="min-h-screen mc-sky flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-20 mx-auto mb-3 relative animate-float">
            <div className="mc-block bg-[#e0b48a] w-full h-1/2 flex items-center justify-center gap-1">
              <div className="w-1.5 h-2 bg-black" />
              <div className="w-1.5 h-2 bg-black" />
            </div>
            <div className="mc-block bg-[#4fd0e0] w-full h-1/2" />
          </div>
          <McTitle size="md">ESCOLHE O HERÓI</McTitle>
        </div>

        {loading ? (
          <div className="text-center text-[10px]">A carregar...</div>
        ) : (
          <div className="space-y-3">
            {visible.map((h) => {
              const armor = armorForXp(h.xp);
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    sfx.click();
                    say(`Vamos lá, ${h.name}! A tua missão começa agora!`);
                    setActiveHeroId(h.id);
                    onPick(h);
                  }}
                  className="mc-block bg-[#5a4020] w-full p-4 flex items-center gap-3 text-left hover:brightness-110"
                >
                  <div
                    className="w-10 h-10 mc-block flex items-center justify-center text-lg font-bold uppercase"
                    style={{ background: armor.color }}
                  >
                    {armor.helmet || h.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase">
                      {h.name}
                      {h.isAdult && (
                        <span className="ml-1 text-[8px] bg-[#4fd0e0] text-black px-1">
                          ADULTO
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] opacity-80">
                      Dia {h.currentDay}/15 · ⛏ {h.xp} XP · {armor.name}
                    </div>
                  </div>
                  <div className="text-xl">🎮</div>
                </button>
              );
            })}

            {visible.length === 0 && (
              <div className="mc-block bg-[#5a4020] p-4 text-center">
                <div className="text-3xl mb-2">👑</div>
                <div className="text-[10px] leading-relaxed">
                  Ainda não há heróis. A <b>MÃE</b> precisa de te adicionar!
                </div>
                <Link href="/mae">
                  <McButton color="gold" size="sm" className="mt-3">
                    👑 CHAMAR A MÃE
                  </McButton>
                </Link>
              </div>
            )}

            <Link href="/">
              <McButton color="stone" className="w-full">
                ← VOLTAR
              </McButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
