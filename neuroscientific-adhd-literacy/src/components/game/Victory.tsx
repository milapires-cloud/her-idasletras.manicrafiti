"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import PixelConfetti from "@/components/PixelConfetti";
import { say, sfx } from "@/lib/voice";
import { saveXpBackup } from "@/lib/storage";
import { DayPlan } from "@/lib/curriculum";

type Result = {
  accuracy: number;
  mastered: boolean;
  totalAttempts: number;
  armorUp?: boolean;
};

export default function Victory({
  hero,
  plan,
  onReplay,
  onHome,
}: {
  hero: { id: number; name: string; currentDay: number };
  plan: DayPlan;
  onReplay: () => void;
  onHome: () => void;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    const close = async () => {
      const r = await fetch("/api/attempts", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          heroId: hero.id,
          day: plan.day,
          xpEarned: 200,
        }),
      });
      const d: Result = await r.json();
      setResult(d);
      setConfetti(Date.now());
      // BACKUP local do progresso — garante que o XP nunca some.
      try {
        const fresh = await fetch(`/api/heroes/${hero.id}`).then((x) => x.json());
        if (fresh?.hero) {
          saveXpBackup(hero.id, {
            xp: fresh.hero.xp,
            gems: fresh.hero.gems,
            currentDay: fresh.hero.currentDay,
          });
        }
      } catch {
        /* mesmo se falhar, o servidor já gravou */
      }
      if (d.mastered) {
        sfx.levelUp();
        say(
          `Vitória, ${hero.name}! Dominaste este mundo com ${d.accuracy} por cento de acertos! O teu cérebro ficou mais forte hoje! Amanhã abre um mundo novo!`
        );
      } else {
        say(
          `${hero.name}, estiveste quase! ${d.accuracy} por cento de acertos. Precisamos de oitenta para avançar. Vamos treinar mais um bocadinho e ficar mestres!`
        );
      }
    };
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen mc-gold-bg flex flex-col items-center justify-center p-4 relative text-black">
      <PixelConfetti trigger={confetti} />

      <div className="mc-block bg-[#a06b3a] p-6 max-w-md w-full text-center text-white">
        <McTitle size="md">
          {result?.mastered ? "🏆 VITÓRIA!" : "⛏️ QUASE LÁ!"}
        </McTitle>
        <div className="text-[10px] mt-3 opacity-90 uppercase tracking-widest">
          {plan.world} · Dia {plan.day}
        </div>

        {result && (
          <>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="mc-block bg-black/40 p-3">
                <div className="text-[9px] opacity-80">PRECISÃO</div>
                <div className="text-2xl font-bold">{result.accuracy}%</div>
              </div>
              <div className="mc-block bg-black/40 p-3">
                <div className="text-[9px] opacity-80">TENTATIVAS</div>
                <div className="text-2xl font-bold">{result.totalAttempts}</div>
              </div>
              <div className="mc-block bg-black/40 p-3">
                <div className="text-[9px] opacity-80">XP</div>
                <div className="text-2xl font-bold">+200</div>
              </div>
            </div>

            <div className={`mt-6 mc-block p-3 text-[10px] ${result.mastered ? "bg-[#5aab3a]" : "bg-[#c0392b]"}`}>
              {result.mastered
                ? "Cérebro DOMINOU esta fase. Amanhã: novo desafio!"
                : "Precisa 80% pra avançar. Vamos repetir e ficar MESTRE!"}
            </div>

            {result.armorUp && (
              <div className="mt-3 mc-block bg-[#f5c518] text-black p-3 animate-pop">
                <div className="text-sm font-bold">🛡️ ARMADURA MELHOROU!</div>
                <div className="text-[9px]">
                  A tua proteção subiu de nível! Vê no teu Perfil.
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex gap-2 justify-center">
          <McButton color="grass" onClick={onReplay}>
            🔁 JOGAR OUTRA VEZ
          </McButton>
          <McButton color="stone" onClick={onHome}>
            🏠 CASA
          </McButton>
        </div>
      </div>
    </div>
  );
}
