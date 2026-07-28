"use client";
import { useEffect, useRef, useState } from "react";
import { isSpeechSupported, listen, ListenHandle, cleanTranscript } from "@/lib/speech";
import { say, sfx, stopSpeaking } from "@/lib/voice";

type State = "idle" | "listening" | "heard" | "error";

// BOTÃO DE MICROFONE GIGANTE — a criança fala, não escreve.
// Usado tanto para responder a exercícios como para o diário.
export default function VoiceAnswer({
  prompt,
  onTranscript,
  label = "FALA AQUI",
  autoStart = false,
  showTranscript = true,
}: {
  prompt?: string;
  onTranscript: (text: string, alternatives: string[]) => void;
  label?: string;
  autoStart?: boolean;
  showTranscript?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [heard, setHeard] = useState("");
  const [supported, setSupported] = useState(true);
  const handleRef = useRef<ListenHandle | null>(null);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  useEffect(() => {
    return () => handleRef.current?.stop();
  }, []);

  const start = () => {
    if (state === "listening") {
      handleRef.current?.stop();
      setState("idle");
      return;
    }
    stopSpeaking(); // não escutar a própria voz do mascote
    sfx.click();
    setHeard("");
    setState("listening");
    handleRef.current = listen({
      onStart: () => setState("listening"),
      onResult: (text, alts) => {
        const clean = cleanTranscript(text);
        setHeard(clean);
        setState("heard");
        onTranscript(clean, alts.map(cleanTranscript));
      },
      onError: (err) => {
        setState("error");
        if (err === "not-allowed") {
          say("Preciso da tua permissão para ouvir! Pede ajuda a um adulto.");
        } else if (err === "no-speech") {
          say("Não ouvi nada. Fala mais alto, mesmo pertinho!");
        }
      },
      onEnd: () => {
        setState((s) => (s === "listening" ? "idle" : s));
      },
    });
  };

  useEffect(() => {
    if (autoStart && supported) {
      const t = setTimeout(start, 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, supported]);

  if (!supported) {
    return (
      <div className="mc-block bg-[#c0392b] p-3 text-[9px] text-center max-w-xs">
        🎤 Este navegador não ouve. Usa o Chrome para falar com o mascote!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {prompt && (
        <button
          onClick={() => say(prompt)}
          className="mc-block bg-white text-black px-3 py-2 text-[9px] max-w-[280px] text-center"
        >
          {prompt} <span className="opacity-50">🔊</span>
        </button>
      )}

      <button
        onClick={start}
        className={`mc-btn w-32 h-32 flex flex-col items-center justify-center ${
          state === "listening"
            ? "bg-[#c0392b] animate-pulse"
            : state === "heard"
              ? "bg-[#5aab3a]"
              : "bg-[#4fd0e0] text-black"
        }`}
      >
        <span className="text-5xl">{state === "listening" ? "👂" : "🎤"}</span>
        <span className="text-[9px] mt-1 font-bold">
          {state === "listening" ? "A OUVIR…" : label}
        </span>
      </button>

      {state === "listening" && (
        <div className="text-[9px] animate-pulse">🔴 Fala agora!</div>
      )}
      {showTranscript && heard && (
        <div className="mc-block bg-black/50 px-3 py-2 text-[10px] max-w-[280px] text-center">
          Ouvi: <b>“{heard}”</b>
        </div>
      )}
      {state === "error" && (
        <button onClick={start} className="mc-btn bg-[#f5c518] text-black px-3 py-2 text-[9px]">
          🔁 TENTAR OUTRA VEZ
        </button>
      )}
    </div>
  );
}
