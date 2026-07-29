"use client";
import { useEffect, useState } from "react";
import McButton from "@/components/McButton";
import { sfx } from "@/lib/voice";

export default function PinPad({
  title,
  subtitle,
  onSubmit,
  onCancel,
  onForgot,
}: {
  title: string;
  subtitle?: string;
  onSubmit: (pin: string) => void | Promise<void>;
  onCancel?: () => void;
  onForgot?: () => void;
}) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (value: string) => {
    if (value.length !== 4 || busy) return;
    setBusy(true);
    setErr("");
    try {
      await onSubmit(value);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "PIN incorreto");
      setPin("");
    } finally {
      setBusy(false);
    }
  };

  // Auto-submete assim que os 4 dígitos são inseridos.
  useEffect(() => {
    if (pin.length === 4) submit(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const digit = (d: string) => {
    if (busy || pin.length >= 4) return;
    sfx.click();
    setErr("");
    setPin((p) => p + d);
  };

  return (
    <div className="min-h-screen bg-[#0f0620] flex flex-col items-center justify-center p-4 text-white">
      <div className="w-16 h-16 mc-block bg-[#7a3fbe] mb-3 flex items-center justify-center text-2xl">
        🛡
      </div>
      <div className="text-base font-bold uppercase tracking-widest mb-1 text-center">
        {title}
      </div>
      {subtitle && (
        <div className="text-[10px] opacity-70 mb-6 text-center">{subtitle}</div>
      )}

      <div className="flex gap-3 mb-6">
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className={`w-5 h-5 rounded-full border-2 transition-all ${
              pin.length > n
                ? "bg-[#4fd0e0] border-[#4fd0e0] scale-110"
                : "border-white/50"
            }`}
          />
        ))}
      </div>

      {err && (
        <div className="mc-block bg-[#c0392b] px-4 py-2 text-[10px] mb-4">
          ✕ {err}
        </div>
      )}
      {busy && <div className="text-[10px] mb-4 opacity-70">A verificar…</div>}

      <div className="grid grid-cols-3 gap-2 w-full max-w-[260px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            onClick={() => digit(String(d))}
            className="mc-btn bg-[#8b8b8b] text-white py-5 text-base font-bold"
          >
            {d}
          </button>
        ))}
        <button
          onClick={() => {
            setPin("");
            setErr("");
          }}
          className="mc-btn bg-[#8b8b8b] text-white py-5 text-xs"
        >
          C
        </button>
        <button
          onClick={() => digit("0")}
          className="mc-btn bg-[#8b8b8b] text-white py-5 text-base font-bold"
        >
          0
        </button>
        <button
          onClick={() => setPin((p) => p.slice(0, -1))}
          className="mc-btn bg-[#8b8b8b] text-white py-5 text-xs"
        >
          ⌫
        </button>
      </div>

      <div className="mt-6 flex gap-3 flex-wrap justify-center">
        {onCancel && (
          <McButton color="stone" onClick={onCancel}>
            ← VOLTAR
          </McButton>
        )}
        {onForgot && (
          <McButton color="wood" onClick={onForgot}>
            🔑 ESQUECI O PIN
          </McButton>
        )}
      </div>
    </div>
  );
}
