"use client";
import { useEffect, useRef, useState } from "react";
import McButton from "@/components/McButton";
import Mascot from "@/components/Mascot";
import { DayPlan } from "@/lib/curriculum";
import { say, sfx } from "@/lib/voice";
import { spellOut } from "@/lib/pronounce";

// FASE 3 — CRAFTING TABLE. A criança escreve no papel o alvo e
// tira uma FOTO. Também pode desenhar direto no canvas (arrastando
// com o dedo). Se enviar foto, vai pro mural dos pais.

export default function Writing({
  hero,
  plan,
  onDone,
}: {
  hero: { id: number; name: string };
  plan: DayPlan;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    say(
      `Última missão! Agora escreve ${plan.writingTarget}. Podes escrever com o dedo aqui na tábua, ou num papel e tirar foto! As letras são: ${spellOut(plan.writingTarget)}`
    );
  }, [plan.writingTarget]);

  const start = (e: React.PointerEvent) => {
    setDrawing(true);
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    setLastPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing || !lastPos) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = "#1a0f2e";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPos({ x, y });
  };
  const end = () => {
    setDrawing(false);
    setLastPos(null);
  };
  const clear = () => {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };

  const send = async (dataUrl: string) => {
    await fetch("/api/photos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: plan.day,
        target: plan.writingTarget,
        dataUrl,
      }),
    });
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: hero.id,
        day: plan.day,
        phase: "writing",
        target: plan.writingTarget,
        correct: true,
      }),
    });
    setSent(true);
    sfx.levelUp();
    say(
      `Enviado para o Quartel General! Os teus comandantes vão ver isto! Excelente trabalho!`
    );
    setTimeout(onDone, 3200);
  };

  const sendDrawing = () => {
    const c = canvasRef.current!;
    // fill white background before export
    const tmp = document.createElement("canvas");
    tmp.width = c.width;
    tmp.height = c.height;
    const tctx = tmp.getContext("2d")!;
    tctx.fillStyle = "white";
    tctx.fillRect(0, 0, c.width, c.height);
    tctx.drawImage(c, 0, 0);
    send(tmp.toDataURL("image/png"));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Resize p/ evitar payloads gigantes
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement("canvas");
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        send(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="min-h-screen mc-wood-bg flex flex-col items-center justify-start p-4 relative">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="mc-block bg-black/70 px-3 py-2 text-[9px] text-white">
          FASE 3 · CRAFT · ESCRITA
        </div>
      </div>

      <div className="mt-12 mb-2">
        <Mascot
          text={`Escreve ${plan.writingTarget} aqui na tábua com o dedo, ou no papel e tira foto!`}
          small
          autoSpeak={false}
        />
      </div>

      <div className="mc-panel p-4 my-4">
        <button
          onClick={() => say(`Escreve ${spellOut(plan.writingTarget)}`)}
          className="mc-block bg-[#f5c518] px-4 py-2 mb-3 text-center w-full"
        >
          <div className="text-[10px] text-black uppercase">Escreve isto</div>
          <div className="text-black font-bold" style={{ fontSize: 32 }}>
            {plan.writingTarget}
          </div>
          <div className="text-[8px] text-black opacity-60">🔊 ouvir</div>
        </button>
        <canvas
          ref={canvasRef}
          width={320}
          height={220}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="mc-block bg-white touch-none"
          style={{ touchAction: "none" }}
        />
      </div>

      {!sent && (
        <div className="flex flex-wrap gap-2 justify-center">
          <McButton color="stone" onClick={clear}>
            🧹 LIMPAR
          </McButton>
          <McButton color="grass" onClick={sendDrawing}>
            📤 ENVIAR DESENHO
          </McButton>
          <McButton color="gold" onClick={() => fileRef.current?.click()}>
            📷 FOTO
          </McButton>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="hidden"
          />
        </div>
      )}
      {sent && (
        <div className="mc-block bg-[#5aab3a] px-6 py-3 mt-4 animate-pop">
          ✔ ENVIADO PRO QG!
        </div>
      )}
    </div>
  );
}
