"use client";
import { useEffect, useState } from "react";
import { initVoice, unlockVoice, say, sfx } from "@/lib/voice";

// BUG CORRIGIDO: o overlay ocupava o ecrã inteiro e "comia" o primeiro
// toque do utilizador (por isso o teclado do PIN não respondia).
// Agora o overlay desaparece ANTES do clique chegar aos elementos e
// nunca bloqueia a interação depois de destravado.
export default function VoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(true); // otimista: não bloqueia UI

  useEffect(() => {
    initVoice();
    // Se já houver interação, destrava em silêncio.
    const unlock = () => {
      unlockVoice();
      sfx.unlock();
      setReady(true);
    };
    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, []);

  return (
    <>
      {children}
      {!ready && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0f0620]/95 text-white">
          <button
            onClick={() => {
              unlockVoice();
              setReady(true);
              setTimeout(() => say("Olá herói! Vamos jogar!"), 300);
            }}
            className="flex flex-col items-center"
          >
            <div className="text-6xl mb-4 animate-float">🔊</div>
            <div className="mc-btn bg-[#5aab3a] px-8 py-5 text-sm font-bold">
              TOCA PARA LIGAR O SOM
            </div>
          </button>
        </div>
      )}
    </>
  );
}
