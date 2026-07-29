"use client";
import { useEffect, useState } from "react";

const COLORS = ["#f5c518", "#4fd0e0", "#4caf50", "#c0392b", "#ffffff", "#a06b3a"];

export default function PixelConfetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<
    { id: number; x: number; color: string; delay: number }[]
  >([]);

  useEffect(() => {
    if (!trigger) return;
    const arr = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.4,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 1800);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="pixel-confetti"
          style={{
            left: `${p.x}vw`,
            background: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}
