"use client";
import { useCallback, useEffect, useState } from "react";
import McButton from "@/components/McButton";
import VoiceAnswer from "@/components/VoiceAnswer";
import Mascot from "@/components/Mascot";
import PixelConfetti from "@/components/PixelConfetti";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";
import { say, sfx } from "@/lib/voice";

type Ch = { id: number; title: string; toRole: string; status: string };

// A CRIANÇA DESAFIA OS PAIS.
// Autonomia é um dos 3 motores da motivação intrínseca (Deci & Ryan).
// Ao poder mandar nos pais dentro do jogo, o menino sente-se poderoso —
// e passa a aceitar melhor as regras que vêm de volta.
const IDEIAS = [
  "Ler uma história para mim hoje",
  "Ficar sem telemóvel 1 hora",
  "Brincar comigo 15 minutos",
  "Fazer o meu lanche favorito",
  "Correr comigo no parque",
  "Desenhar comigo",
];

export default function DesafioPais() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [list, setList] = useState<Ch[]>([]);
  const [title, setTitle] = useState("");
  const [toRole, setToRole] = useState("mae");
  const [confetti, setConfetti] = useState(0);

  const load = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/kid-challenges?heroId=${sel.id}`).then((r) => r.json());
    setList(d.challenges ?? []);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    say("Aqui és TU que mandas! Escolhe um desafio para a mãe ou para o pai!");
  }, []);

  const send = async (t?: string) => {
    const final = t ?? title;
    if (!sel || !final.trim()) return;
    await fetch("/api/kid-challenges", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroId: sel.id, title: final, toRole }),
    });
    setTitle("");
    setConfetti(Date.now());
    sfx.levelUp();
    say(`Desafio enviado para ${toRole === "mae" ? "a mãe" : "o pai"}! Agora é com eles!`);
    load();
  };

  const resolve = async (id: number, status: string) => {
    await fetch("/api/kid-challenges", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (status === "cumprido") {
      sfx.correct();
      say("Os teus pais cumpriram! Ganhaste XP!");
      setConfetti(Date.now());
    }
    load();
  };

  if (loading) return <PageShell title="⚡ DESAFIA OS PAIS">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="⚡ DESAFIA OS PAIS">
        <EmptyHeroes />
      </PageShell>
    );

  return (
    <PageShell title="⚡ DESAFIA OS PAIS">
      <PixelConfetti trigger={confetti} />
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="flex justify-center mb-4">
        <Mascot
          small
          autoSpeak={false}
          text="Agora és TU o comandante! O que queres pedir?"
        />
      </div>

      <div className="mc-panel p-4 mb-4">
        <div className="flex gap-2 mb-3">
          {["mae", "pai"].map((r) => (
            <button
              key={r}
              onClick={() => {
                sfx.click();
                setToRole(r);
              }}
              className={`mc-btn flex-1 py-3 text-[11px] ${toRole === r ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
            >
              {r === "mae" ? "👑 PARA A MÃE" : "🛡 PARA O PAI"}
            </button>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-widest mb-2">
          Escolhe um desafio
        </div>
        <div className="grid grid-cols-2 gap-2">
          {IDEIAS.map((idea) => (
            <button
              key={idea}
              onClick={() => send(idea)}
              className="mc-btn bg-[#a06b3a] p-3 text-[9px] leading-tight"
            >
              {idea}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="text-[10px] uppercase">Ou inventa um falando!</div>
          <VoiceAnswer
            onTranscript={(t) => setTitle(t)}
            label="FALA O DESAFIO"
          />
          {title && (
            <McButton color="grass" className="w-full" onClick={() => send()}>
              📤 ENVIAR: “{title}”
            </McButton>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {list.map((c) => (
          <div
            key={c.id}
            className={`mc-block p-3 flex items-center gap-2 ${
              c.status === "cumprido" ? "bg-[#5aab3a]" : "bg-[#5a4020]"
            }`}
          >
            <div className="text-2xl">{c.toRole === "mae" ? "👑" : "🛡"}</div>
            <div className="flex-1">
              <div className="text-[11px]">{c.title}</div>
              <div className="text-[9px] opacity-70 uppercase">{c.status}</div>
            </div>
            {c.status !== "cumprido" && (
              <McButton color="gold" size="sm" onClick={() => resolve(c.id, "cumprido")}>
                ✓ CUMPRIU
              </McButton>
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
