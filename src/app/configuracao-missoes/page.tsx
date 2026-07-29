"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import McButton from "@/components/McButton";
import {
  useHeroes,
  HeroTabs,
  PageShell,
  EmptyHeroes,
} from "@/components/HeroPicker";

type Mission = {
  id: number;
  title: string;
  reward: number;
  kind: string;
  completed: boolean;
};
type VMsg = { id: number; fromRole: string; text: string; audioUrl: string; played: boolean };

const PRESETS = [
  { t: "Obedecer à primeira vez", k: "obediencia", r: 200 },
  { t: "Guardar os brinquedos sem reclamar", k: "obediencia", r: 100 },
  { t: "Escovar os dentes sozinho", k: "obediencia", r: 100 },
  { t: "Ficar só 30 min de TV hoje", k: "anti-tela", r: 300 },
  { t: "Não pedir o celular hoje", k: "anti-tela", r: 300 },
  { t: "Fazer a tarefa da escola", k: "escola", r: 200 },
  { t: "Ler uma palavra para a família", k: "escola", r: 150 },
];

export default function ConfigMissoes() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [tab, setTab] = useState<"missoes" | "voz">("missoes");

  if (loading) return <PageShell title="🎯 MISSÕES">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🎯 MISSÕES">
        <EmptyHeroes />
      </PageShell>
    );

  return (
    <PageShell title="🎯 CONFIGURAÇÃO DE MISSÕES">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("missoes")}
          className={`mc-btn flex-1 py-2 text-[10px] ${tab === "missoes" ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
        >
          🎯 MISSÕES
        </button>
        <button
          onClick={() => setTab("voz")}
          className={`mc-btn flex-1 py-2 text-[10px] ${tab === "voz" ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
        >
          🎙 MENSAGEM DE VOZ
        </button>
      </div>
      {tab === "missoes" ? (
        <MissionEditor heroId={sel.id} />
      ) : (
        <VoiceRecorder heroId={sel.id} heroName={sel.name} />
      )}
    </PageShell>
  );
}

function MissionEditor({ heroId }: { heroId: number }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState(150);
  const [kind, setKind] = useState("obediencia");
  const [role, setRole] = useState("mae");

  const load = useCallback(async () => {
    const d = await fetch(`/api/missions?heroId=${heroId}`).then((r) => r.json());
    setMissions(d.missions ?? []);
  }, [heroId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (t?: string, k?: string, r?: number) => {
    const finalTitle = t ?? title;
    if (!finalTitle.trim()) return;
    await fetch("/api/missions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId,
        title: finalTitle,
        kind: k ?? kind,
        reward: r ?? reward,
        createdBy: role,
      }),
    });
    setTitle("");
    load();
  };

  const complete = async (id: number) => {
    await fetch("/api/missions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/missions?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="mc-panel p-4">
        <div className="text-[11px] uppercase tracking-widest mb-3">
          Missões rápidas (toca para criar)
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.t}
              onClick={() => add(p.t, p.k, p.r)}
              className="mc-btn bg-[#a06b3a] px-2 py-2 text-[9px]"
            >
              + {p.t} <span className="opacity-70">({p.r}xp)</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mc-panel p-4 space-y-2">
        <div className="text-[11px] uppercase tracking-widest mb-1">
          Missão personalizada
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Ajudar a pôr a mesa"
          className="w-full mc-block bg-white text-black p-2 text-xs outline-none"
        />
        <div className="flex gap-2">
          {[
            { k: "obediencia", l: "🎯 Obediência" },
            { k: "escola", l: "🎒 Escola" },
            { k: "anti-tela", l: "📵 Anti-Tela" },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setKind(o.k)}
              className={`mc-btn flex-1 py-1 text-[9px] ${kind === o.k ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["mae", "pai"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`mc-btn flex-1 py-1 text-[9px] ${role === r ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
            >
              {r === "mae" ? "👑 Mãe" : "🛡 Pai"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-[10px]">XP</label>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="mc-block bg-white text-black p-2 text-xs w-20 outline-none"
          />
          <McButton color="grass" onClick={() => add()} className="flex-1">
            CRIAR MISSÃO
          </McButton>
        </div>
      </div>

      <div className="space-y-2">
        {missions.map((m) => (
          <div
            key={m.id}
            className={`mc-block p-3 flex justify-between items-center gap-2 ${m.completed ? "bg-[#5aab3a]" : "bg-[#a06b3a]"}`}
          >
            <div className="flex-1">
              <div className="text-[11px] font-bold">{m.title}</div>
              <div className="text-[9px] opacity-80">
                {m.kind} · +{m.reward} XP
              </div>
            </div>
            {!m.completed ? (
              <McButton color="gold" size="sm" onClick={() => complete(m.id)}>
                ✓ CUMPRIU
              </McButton>
            ) : (
              <span className="text-[9px] bg-black/40 px-2 py-1">FEITO</span>
            )}
            <McButton color="red" size="sm" onClick={() => del(m.id)}>
              🗑
            </McButton>
          </div>
        ))}
      </div>
    </div>
  );
}

// GRAVADOR DE VOZ dos pais — vira caixa-surpresa no jogo.
function VoiceRecorder({ heroId, heroName }: { heroId: number; heroName: string }) {
  const [messages, setMessages] = useState<VMsg[]>([]);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [text, setText] = useState("");
  const [role, setRole] = useState("mae");
  const [status, setStatus] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const load = useCallback(async () => {
    const d = await fetch(`/api/voice-messages?heroId=${heroId}`).then((r) => r.json());
    setMessages(d.messages ?? []);
  }, [heroId]);

  useEffect(() => {
    load();
  }, [load]);

  const start = async () => {
    setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => setAudioUrl(String(reader.result));
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setTimeout(() => {
        if (recorderRef.current?.state === "recording") stop();
      }, 30000);
    } catch {
      setStatus("Não consegui aceder ao microfone. Permite o acesso.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const send = async () => {
    if (!audioUrl && !text.trim()) {
      setStatus("Grava um áudio ou escreve uma mensagem.");
      return;
    }
    await fetch("/api/voice-messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroId, fromRole: role, text, audioUrl }),
    });
    setAudioUrl("");
    setText("");
    setStatus("✔ Mensagem enviada! Vai aparecer como caixa-surpresa no jogo.");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="mc-panel p-4">
        <div className="text-[11px] uppercase tracking-widest mb-2">
          🎙 Mensagem surpresa para {heroName}
        </div>
        <p className="text-[9px] opacity-80 mb-3 leading-relaxed">
          Grava a tua voz. Ela aparece como um baú surpresa quando ele começa a
          missão. Nada motiva mais uma criança do que ouvir os pais a acreditar
          nela.
        </p>

        <div className="flex gap-2 mb-3">
          {["mae", "pai"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`mc-btn flex-1 py-2 text-[10px] ${role === r ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
            >
              {r === "mae" ? "👑 Da Mãe" : "🛡 Do Pai"}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={recording ? stop : start}
            className={`mc-btn w-28 h-28 flex flex-col items-center justify-center ${recording ? "bg-[#c0392b] animate-pulse" : "bg-[#4fd0e0] text-black"}`}
          >
            <span className="text-4xl">{recording ? "⏹" : "🎤"}</span>
            <span className="text-[9px] mt-1 font-bold">
              {recording ? "PARAR" : "GRAVAR"}
            </span>
          </button>
          {recording && (
            <div className="text-[9px] animate-pulse">🔴 A gravar… (máx 30s)</div>
          )}
          {audioUrl && (
            <div className="flex flex-col items-center gap-2">
              <audio controls src={audioUrl} className="h-8" />
              <McButton color="red" size="sm" onClick={() => setAudioUrl("")}>
                🗑 APAGAR
              </McButton>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="text-[10px] uppercase">
            Ou escreve (o mascote lê em voz alta)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Ex: Filho, estou muito orgulhosa de ti!"
            className="w-full mc-block bg-white text-black p-2 text-xs outline-none mt-1"
          />
        </div>

        {status && (
          <div className="mc-block bg-[#5aab3a] px-3 py-2 text-[10px] mt-3">
            {status}
          </div>
        )}

        <McButton color="grass" className="w-full mt-3" onClick={send}>
          📤 ENVIAR SURPRESA
        </McButton>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="mc-block bg-[#5a4020] p-3 flex items-center gap-3">
            <div className="text-2xl">{m.fromRole === "mae" ? "👑" : "🛡"}</div>
            <div className="flex-1">
              <div className="text-[10px]">{m.text || "🎙 Áudio gravado"}</div>
              <div className="text-[9px] opacity-70">
                {m.played ? "✔ Já ouvida" : "⏳ Aguarda o herói"}
              </div>
            </div>
            {m.audioUrl && <audio controls src={m.audioUrl} className="h-7 w-32" />}
            <McButton
              color="red"
              size="sm"
              onClick={async () => {
                await fetch(`/api/voice-messages?id=${m.id}`, { method: "DELETE" });
                load();
              }}
            >
              🗑
            </McButton>
          </div>
        ))}
      </div>
    </div>
  );
}
