"use client";
import { useEffect, useRef } from "react";
import { say } from "@/lib/voice";

// Re-export para compatibilidade com componentes antigos.
export function speak(text: string, opts: { rate?: number; pitch?: number } = {}) {
  say(text, opts);
}

export default function Mascot({
  text,
  small = false,
  autoSpeak = true,
  mood = "happy",
}: {
  text?: string;
  small?: boolean;
  autoSpeak?: boolean;
  mood?: "happy" | "excited" | "sad" | "thinking";
}) {
  const last = useRef("");

  useEffect(() => {
    if (autoSpeak && text && text !== last.current) {
      last.current = text;
      say(text);
    }
  }, [text, autoSpeak]);

  const size = small ? "w-16 h-20" : "w-24 h-32";
  const eyes =
    mood === "sad" ? "h-1" : mood === "excited" ? "h-3" : "h-2";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${size} relative animate-float`}>
        <div className="mc-block bg-[#e0b48a] w-full h-1/2 flex items-center justify-center gap-1">
          <div className={`w-1.5 ${eyes} bg-black`} />
          <div className={`w-1.5 ${eyes} bg-black`} />
        </div>
        <div
          className={`absolute top-[36%] left-1/2 -translate-x-1/2 bg-[#5a3a20] ${mood === "excited" ? "w-5 h-2" : "w-4 h-1"}`}
        />
        <div className="mc-block bg-[#4fd0e0] w-full h-1/2" />
      </div>
      {text && (
        <button
          onClick={() => say(text)}
          className="mc-block bg-white text-black px-3 py-2 text-[9px] leading-tight max-w-[280px] text-center cursor-pointer hover:brightness-95"
        >
          {text}
          <span className="block mt-1 opacity-50 text-[8px]">🔊 toca p/ repetir</span>
        </button>
      )}
    </div>
  );
}
