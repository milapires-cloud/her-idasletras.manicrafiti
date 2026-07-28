"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { CURRICULUM, MASTERY_THRESHOLD } from "@/lib/curriculum";

type Hero = { id: number; name: string; xp: number; gems: number; streak: number; currentDay: number };
type Progress = { day: number; accuracy: number; completed: boolean; xpEarned: number };
type Mission = { id: number; title: string; description: string; reward: number; kind: string; completed: boolean };
type DiaryE = {
  id: number;
  day: number;
  mood: string;
  school: string;
  dream: string;
  friend: string;
  secret: string;
  createdAt: string;
};
type Alert = { day: number; createdAt: string };
type Panel = {
  hero: Hero;
  progress: Progress[];
  missions: Mission[];
  diary: DiaryE[];
  alerts: Alert[];
};

export default function PanelPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<Panel | null>(null);
  const [tab, setTab] = useState<"overview" | "missions" | "diary">("overview");
  // A mãe (admin) vê os desabafos; o pai vê apenas o aviso.
  const [role, setRole] = useState<"mae" | "pai">("mae");

  useEffect(() => {
    fetch("/api/heroes")
      .then((r) => r.json())
      .then((d) => {
        setHeroes(d.heroes ?? []);
        if (d.heroes?.length) setSelectedId(d.heroes[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/panel?heroId=${selectedId}&role=${role}`)
      .then((r) => r.json())
      .then(setData);
  }, [selectedId, role]);

  if (!data)
    return (
      <div className="min-h-screen mc-sky p-4">
        <McTitle size="md">CARREGANDO...</McTitle>
        {heroes.length === 0 && (
          <div className="mt-6 mc-panel p-4 max-w-md">
            <p className="text-[11px]">Nenhum herói cadastrado ainda.</p>
            <Link href="/jogar">
              <McButton color="grass" className="mt-3">
                CRIAR HERÓI
              </McButton>
            </Link>
          </div>
        )}
      </div>
    );

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="md">📊 PAINEL DO HERÓI</McTitle>
          <Link href="/">
            <McButton color="stone" size="sm">← HOME</McButton>
          </Link>
        </div>

        {/* Selector de herói */}
        {heroes.length > 1 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {heroes.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedId(h.id)}
                className={`mc-btn px-3 py-2 text-[10px] ${selectedId === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
              >
                {h.name}
              </button>
            ))}
          </div>
        )}

        {/* Hero card */}
        <div className="mc-panel p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px] opacity-80">DIA ATUAL</div>
              <div className="text-2xl font-bold">{data.hero.currentDay}/15</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px] opacity-80">XP</div>
              <div className="text-2xl font-bold">{data.hero.xp}</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px] opacity-80">GEMAS</div>
              <div className="text-2xl font-bold">💎 {data.hero.gems}</div>
            </div>
            <div className="mc-block bg-black/40 p-3">
              <div className="text-[9px] opacity-80">STREAK</div>
              <div className="text-2xl font-bold">🔥 {data.hero.streak}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          {(["overview", "missions", "diary"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`mc-btn px-3 py-2 text-[10px] ${tab === t ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
            >
              {t === "overview" ? "📊 PROGRESSO" : t === "missions" ? "🎯 MISSÕES" : "📖 DIÁRIO"}
            </button>
          ))}
        </div>

        {tab === "overview" && <Overview progress={data.progress} />}
        {tab === "missions" && (
          <Missions
            heroId={data.hero.id}
            missions={data.missions}
            onChange={() =>
              fetch(`/api/panel?heroId=${data.hero.id}`)
                .then((r) => r.json())
                .then(setData)
            }
          />
        )}
        {tab === "diary" && (
          <>
            <div className="flex gap-2 mb-3">
              {(["mae", "pai"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`mc-btn flex-1 py-2 text-[10px] ${role === r ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
                >
                  {r === "mae" ? "👑 Sou a Mãe" : "🛡 Sou o Pai"}
                </button>
              ))}
            </div>
            {data.alerts?.length > 0 && role === "mae" && (
              <div className="mc-block bg-[#c0392b] p-3 mb-3">
                <div className="text-[11px] font-bold">
                  ⚠️ {data.alerts.length} desabafo(s) precisam da tua atenção
                </div>
                <div className="text-[9px] mt-1 opacity-90">
                  O teu filho mencionou algo sensível. Fala com ele hoje, com
                  calma, sem o confrontar sobre o app.
                </div>
              </div>
            )}
            <DiaryList diary={data.diary} />
          </>
        )}
      </div>
    </div>
  );
}

function Overview({ progress }: { progress: Progress[] }) {
  const byDay = new Map(progress.map((p) => [p.day, p]));
  return (
    <div className="mc-panel p-4">
      <div className="text-[11px] uppercase mb-3 tracking-widest">
        MESTRIA POR DIA (mínimo {MASTERY_THRESHOLD}% pra avançar)
      </div>
      <div className="grid grid-cols-5 gap-2">
        {CURRICULUM.map((d) => {
          const p = byDay.get(d.day);
          const done = p?.completed;
          const acc = p?.accuracy ?? 0;
          return (
            <div
              key={d.day}
              className={`mc-block p-2 text-center ${done ? "bg-[#5aab3a]" : p ? "bg-[#c0392b]" : "bg-[#8b8b8b]"}`}
            >
              <div className="text-[9px] uppercase">Dia {d.day}</div>
              <div className="text-lg font-bold">
                {done ? "✓" : p ? `${acc}%` : "🔒"}
              </div>
              <div className="text-[8px] opacity-80 leading-tight">{d.world}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Missions({
  heroId,
  missions,
  onChange,
}: {
  heroId: number;
  missions: Mission[];
  onChange: () => void;
}) {
  const [title, setTitle] = useState("");
  const [reward, setReward] = useState(100);
  const [kind, setKind] = useState("obediencia");

  const add = async () => {
    if (!title.trim()) return;
    await fetch("/api/missions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroId, title, reward, kind }),
    });
    setTitle("");
    onChange();
  };

  const complete = async (id: number) => {
    await fetch("/api/missions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onChange();
  };

  return (
    <div className="space-y-4">
      <div className="mc-panel p-4">
        <div className="text-[11px] uppercase mb-3 tracking-widest">
          + NOVA MISSÃO DO MUNDO REAL
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Escovar os dentes sem reclamar"
          className="w-full mc-block bg-white text-black p-2 text-xs outline-none mb-2"
        />
        <div className="flex gap-2 mb-2">
          {[
            { k: "obediencia", label: "🎯 Obediência" },
            { k: "escola", label: "🎒 Escola" },
            { k: "anti-tela", label: "📵 Anti-Tela" },
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setKind(o.k)}
              className={`mc-btn px-2 py-1 text-[9px] flex-1 ${kind === o.k ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-[10px] uppercase">Recompensa (XP)</label>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="mc-block bg-white text-black p-2 text-xs outline-none w-24"
          />
          <McButton color="grass" onClick={add}>
            CRIAR
          </McButton>
        </div>
      </div>

      <div className="space-y-2">
        {missions.length === 0 && (
          <div className="mc-block bg-black/30 p-4 text-center text-[10px]">
            Nenhuma missão. Cria a primeira!
          </div>
        )}
        {missions.map((m) => (
          <div
            key={m.id}
            className={`mc-block p-3 flex justify-between items-center ${m.completed ? "bg-[#5aab3a]" : "bg-[#a06b3a]"}`}
          >
            <div>
              <div className="text-xs font-bold uppercase">{m.title}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
}

function DiaryList({ diary }: { diary: DiaryE[] }) {
  if (diary.length === 0)
    return (
      <div className="mc-panel p-4 text-center text-[11px]">
        Sem registos ainda. A criança preenche no início de cada missão.
      </div>
    );
  return (
    <div className="space-y-2">
      {diary.map((d) => (
        <div key={d.id} className="mc-block bg-[#0f0620] p-3 text-white">
          <div className="flex justify-between items-center">
            <div className="text-[10px] uppercase opacity-70">Dia {d.day}</div>
            <div className="text-lg">
              {d.mood === "feliz"
                ? "😄"
                : d.mood === "animado"
                  ? "🤩"
                  : d.mood === "cansado"
                    ? "😴"
                    : d.mood === "triste"
                      ? "😢"
                      : "😠"}
            </div>
          </div>
          {d.school && (
            <div className="text-[10px] mt-2">
              <b>🎒 Escola:</b> {d.school}
            </div>
          )}
          {d.friend && (
            <div className="text-[10px] mt-1">
              <b>👥 Amigo:</b> {d.friend}
            </div>
          )}
          {d.dream && (
            <div className="text-[10px] mt-1">
              <b>💭 Sonho:</b> {d.dream}
            </div>
          )}
          {d.secret && (
            <div className="mc-block bg-[#7a3fbe] p-2 mt-2">
              <div className="text-[9px] font-bold mb-1">
                💗 O QUE ELE DESABAFOU
              </div>
              <div className="text-[10px] leading-relaxed">{d.secret}</div>
            </div>
          )}
          <div className="text-[8px] mt-2 opacity-60">
            O mascote diz à criança que conta à mãe — nada é escondido dela.
          </div>
        </div>
      ))}
    </div>
  );
}
