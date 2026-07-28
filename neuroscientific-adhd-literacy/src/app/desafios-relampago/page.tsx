"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import PixelConfetti from "@/components/PixelConfetti";
import { speak } from "@/components/Mascot";

// DESAFIO RELÂMPAGO — 30 segundos, quantas palavras ler certo?
// Anti-tédio, alta dopamina.

const POOL = ["MAPA", "BOLA", "PATO", "SAPO", "LATA", "MESA", "DEDO", "FITA", "BALA", "PIPA", "TATU", "NENE"];

export default function DesafioRelampago() {
  const [state, setState] = useState<"ready" | "running" | "done">("ready");
  const [word, setWord] = useState<string>(POOL[0]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [time, setTime] = useState(30);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    if (time <= 0) {
      setState("done");
      setConfetti(Date.now());
      speak(`Fim! Fizeste ${score} pontos!`);
      return;
    }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time, state, score]);

  const next = useMemo(
    () => () => setWord(POOL[Math.floor(Math.random() * POOL.length)]),
    []
  );

  const start = () => {
    setScore(0);
    setErrors(0);
    setTime(30);
    next();
    setState("running");
    setTimeout(() => speak(POOL[0]), 200);
  };

  return (
    <div className="min-h-screen mc-sky p-4 relative">
      <PixelConfetti trigger={confetti} />
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">⚡ DESAFIO RELÂMPAGO</McTitle>
          <Link href="/"><McButton color="stone" size="sm">← HOME</McButton></Link>
        </div>

        {state === "ready" && (
          <div className="mc-panel p-6 text-center">
            <div className="text-4xl">⚡</div>
            <div className="text-sm mt-2 font-bold">30 segundos. Quantas palavras acertas?</div>
            <div className="text-[10px] mt-2 opacity-80">Pai/mãe julga: acertou ou errou.</div>
            <McButton color="gold" className="mt-4" onClick={start}>COMEÇAR!</McButton>
          </div>
        )}

        {state === "running" && (
          <div className="mc-panel p-6 text-center">
            <div className="text-[10px] uppercase opacity-80">Tempo: {time}s</div>
            <div className="mt-4 mc-hp h-3">
              <div style={{ width: `${(time / 30) * 100}%`, background: "linear-gradient(180deg,#4fd0e0,#0aa)" }} />
            </div>

            <div className="text-6xl font-bold my-8" style={{ textShadow: "3px 3px 0 #000" }}>
              {word}
            </div>

            <div className="flex gap-2 justify-center">
              <McButton color="red" onClick={() => { setErrors(errors + 1); next(); }}>
                ✕ ERROU
              </McButton>
              <McButton color="grass" onClick={() => { setScore(score + 1); next(); }}>
                ✓ LEU!
              </McButton>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px]">
              <div>✓ Acertos: <b>{score}</b></div>
              <div>✕ Erros: <b>{errors}</b></div>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="mc-panel p-6 text-center">
            <div className="text-4xl">🏆</div>
            <div className="text-lg font-bold mt-2">{score} palavras!</div>
            <div className="text-[10px] opacity-80">Erros: {errors}</div>
            <div className="mt-4 flex gap-2 justify-center">
              <McButton color="grass" onClick={start}>🔁 OUTRA VEZ</McButton>
              <Link href="/"><McButton color="stone">🏠 CASA</McButton></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
