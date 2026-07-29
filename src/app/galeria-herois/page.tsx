"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";

type Hero = { id: number; name: string };
type Photo = { id: number; day: number; target: string; dataUrl: string; createdAt: string };

export default function GaleriaPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetch("/api/heroes")
      .then((r) => r.json())
      .then((d) => {
        setHeroes(d.heroes ?? []);
        if (d.heroes?.length) setSel(d.heroes[0].id);
      });
  }, []);

  useEffect(() => {
    if (!sel) return;
    fetch(`/api/photos?heroId=${sel}`)
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos ?? []));
  }, [sel]);

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">🖼️ GALERIA DE HERÓIS</McTitle>
          <Link href="/">
            <McButton color="stone" size="sm">← HOME</McButton>
          </Link>
        </div>

        {heroes.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {heroes.map((h) => (
              <button
                key={h.id}
                onClick={() => setSel(h.id)}
                className={`mc-btn px-3 py-2 text-[10px] ${sel === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}

        <div className="mc-panel p-4 mb-4 text-center">
          <div className="text-lg">🏆 {photos.length} obras no troféu</div>
          <div className="text-[10px] opacity-80">Cada foto é uma letra que dominaste!</div>
        </div>

        {photos.length === 0 ? (
          <div className="mc-block bg-black/30 p-6 text-center text-[11px]">
            📷 Ainda sem fotos. Completa a Fase de Escrita no jogo!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="mc-block bg-[#a06b3a] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={p.target}
                  className="w-full h-40 object-contain bg-white mc-block"
                />
                <div className="mt-2 text-[10px] uppercase text-center">
                  Dia {p.day} · {p.target}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
