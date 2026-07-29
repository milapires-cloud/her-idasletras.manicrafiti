"use client";
import { useEffect, useRef, useState } from "react";
import McButton from "@/components/McButton";
import PixelConfetti from "@/components/PixelConfetti";
import { say, sfx, stopSpeaking } from "@/lib/voice";

type Msg = { id: number; fromRole: string; text: string; audioUrl: string };

// CAIXA DE SURPRESA — mensagem de voz gravada pela mãe/pai.
// Aparece como um baú do Minecraft depois de uma conquista.
export default function VoiceSurprise({
  heroId,
  onDone,
}: {
  heroId: number;
  onDone: () => void;
}) {
  const [msg, setMsg] = useState<Msg | null>(null);
  const [opened, setOpened] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [checked, setChecked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch(`/api/voice-messages?heroId=${heroId}&unplayed=1`)
      .then((r) => r.json())
      .then((d) => {
        const m = d.messages?.[0];
        setChecked(true);
        if (m) {
          setMsg(m);
          say("Espera! Chegou uma caixa surpresa para ti! Abre!");
          sfx.levelUp();
        } else {
          onDone();
        }
      })
      .catch(() => onDone());
  }, [heroId, onDone]);

  if (!checked || !msg) return null;

  const open = async () => {
    setOpened(true);
    setConfetti(Date.now());
    sfx.levelUp();
    stopSpeaking();

    const who = msg.fromRole === "mae" ? "a tua MÃE" : "o teu PAI";
    say(`Uma mensagem d${msg.fromRole === "mae" ? "a" : "o"} ${who === "a tua MÃE" ? "tua mãe" : "teu pai"}!`);

    setTimeout(() => {
      if (msg.audioUrl && audioRef.current) {
        audioRef.current.play().catch(() => {
          if (msg.text) say(msg.text);
        });
      } else if (msg.text) {
        say(msg.text);
      }
    }, 2000);

    fetch("/api/voice-messages", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: msg.id }),
    });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#0f0620]/95 flex flex-col items-center justify-center p-4">
      <PixelConfetti trigger={confetti} />

      {!opened ? (
        <button onClick={open} className="flex flex-col items-center animate-float">
          <div className="text-8xl mb-4">🎁</div>
          <div className="mc-btn bg-[#f5c518] text-black px-8 py-5 text-sm font-bold animate-pulse">
            ABRIR CAIXA SURPRESA!
          </div>
        </button>
      ) : (
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-3 animate-pop">
            {msg.fromRole === "mae" ? "👑" : "🛡️"}
          </div>
          <div className="mc-block bg-[#a06b3a] p-5">
            <div className="text-[10px] uppercase tracking-widest mb-3">
              Mensagem d{msg.fromRole === "mae" ? "a Mãe" : "o Pai"}
            </div>
            {msg.audioUrl ? (
              <>
                <audio ref={audioRef} src={msg.audioUrl} className="hidden" />
                <McButton
                  color="gold"
                  size="lg"
                  onClick={() => audioRef.current?.play()}
                >
                  ▶️ OUVIR OUTRA VEZ
                </McButton>
              </>
            ) : (
              <div className="text-xs leading-relaxed">{msg.text}</div>
            )}
          </div>
          <McButton color="grass" size="lg" className="mt-5" onClick={onDone}>
            ❤️ CONTINUAR A MISSÃO
          </McButton>
        </div>
      )}
    </div>
  );
}
