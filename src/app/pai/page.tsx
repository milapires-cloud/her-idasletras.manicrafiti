"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import {
  api,
  setToken,
  clearToken,
  loadSession,
  saveCommander,
  Commander,
} from "@/lib/session";

// LOGIN PARA QUALQUER COMANDANTE (pai, padrinhos, avós, professores…).
// Todos entram por utilizador + PIN. A conta é criada pela mãe (admin).
export default function PaiPage() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "login" | "panel">("loading");
  const [me, setMe] = useState<Commander | null>(null);
  const [loginName, setLoginName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadSession().then((s) => {
      if (s.commander) {
        setMe(s.commander);
        setState("panel");
      } else setState("login");
    });
  }, []);

  const submit = async () => {
    setErr("");
    setBusy(true);
    const { ok, data } = await api<{
      error?: string;
      token: string;
      commander: Commander;
    }>("/api/auth/login", { method: "POST", body: { loginName, pin } });
    setBusy(false);
    if (!ok) {
      setErr(data.error || "Não foi possível entrar");
      return;
    }
    setToken(data.token);
    saveCommander(data.commander);
    setMe(data.commander);
    setState("panel");
  };

  if (state === "loading")
    return (
      <div className="min-h-screen mc-sky flex items-center justify-center text-xs">
        A carregar…
      </div>
    );

  if (state === "login")
    return (
      <div className="min-h-screen bg-[#0f0620] flex items-center justify-center p-4 text-white">
        <div className="mc-panel p-6 max-w-sm w-full">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🛡️</div>
            <McTitle size="sm">ENTRAR COMANDANTE</McTitle>
            <p className="text-[9px] opacity-70 mt-2">
              Pai, padrinho, avó, professor… A conta é criada pela mãe.
            </p>
          </div>
          <input
            placeholder="Utilizador"
            value={loginName}
            onChange={(e) =>
              setLoginName(e.target.value.replace(/\s/g, "").toLowerCase())
            }
            autoCapitalize="none"
            className="w-full mc-block bg-white text-black p-3 text-xs outline-none mb-2"
          />
          <input
            placeholder="PIN (4 dígitos)"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className="w-full mc-block bg-white text-black p-3 text-xs outline-none tracking-[0.5em]"
          />
          {err && (
            <div className="mc-block bg-[#c0392b] px-3 py-2 text-[10px] mt-3">
              {err}
            </div>
          )}
          <McButton color="grass" size="lg" className="w-full mt-4" onClick={submit} disabled={busy}>
            {busy ? "…" : "ENTRAR"}
          </McButton>
          <Link href="/">
            <McButton color="stone" className="w-full mt-2">
              ← VOLTAR
            </McButton>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center">
          <McTitle size="sm">🛡 PAINEL DO COMANDANTE</McTitle>
          <McButton
            color="stone"
            size="sm"
            onClick={async () => {
              await api("/api/auth/session", { method: "DELETE" });
              clearToken();
              setState("login");
            }}
          >
            SAIR
          </McButton>
        </div>
        <p className="text-[10px] mt-2 opacity-90">
          Olá, {me?.name} ({me?.role})
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href="/painel" className="mc-btn bg-[#5aab3a] p-4 text-center text-[10px]">
            📊 PROGRESSO
          </Link>
          <Link href="/configuracao-missoes" className="mc-btn bg-[#f5c518] text-black p-4 text-center text-[10px]">
            🎯 MISSÕES & VOZ
          </Link>
          <Link href="/tarefas-escolares" className="mc-btn bg-[#a06b3a] p-4 text-center text-[10px]">
            🎒 TAREFAS ESCOLA
          </Link>
          <Link href="/relatorio-semanal" className="mc-btn bg-[#4fd0e0] text-black p-4 text-center text-[10px]">
            📈 RELATÓRIO
          </Link>
        </div>

        <McButton
          color="grass"
          size="lg"
          className="w-full mt-4"
          onClick={() => router.push("/jogar")}
        >
          🎮 JOGAR / DUELAR
        </McButton>
      </div>
    </div>
  );
}
