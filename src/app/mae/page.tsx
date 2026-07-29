"use client";
import { useCallback, useEffect, useState } from "react";
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
  Family,
} from "@/lib/session";

type Mode = "loading" | "auth" | "panel";

export default function MaePage() {
  const [mode, setMode] = useState<Mode>("loading");
  const [me, setMe] = useState<Commander | null>(null);

  const refresh = useCallback(async () => {
    const s = await loadSession();
    if (s.commander) {
      setMe(s.commander);
      setMode("panel");
    } else {
      setMode("auth");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (mode === "loading")
    return (
      <div className="min-h-screen mc-sky flex items-center justify-center text-xs">
        A carregar…
      </div>
    );

  if (mode === "auth")
    return (
      <AuthScreen
        onDone={(t, c) => {
          setToken(t);
          saveCommander(c);
          setMe(c);
          setMode("panel");
        }}
      />
    );

  return (
    <AdminPanel
      me={me!}
      onLogout={async () => {
        await api("/api/auth/session", { method: "DELETE" });
        clearToken();
        setMode("auth");
      }}
      refresh={refresh}
    />
  );
}

function AuthScreen({
  onDone,
}: {
  onDone: (token: string, c: Commander, f: Family) => void;
}) {
  const [tab, setTab] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetText, setResetText] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const doReset = async () => {
    setBusy(true);
    setResetMsg("");
    const { ok, data } = await api<{ ok?: boolean; error?: string }>(
      "/api/auth/reset",
      { method: "POST", body: { confirm: "APAGAR TUDO" } }
    );
    setBusy(false);
    if (ok) {
      clearToken();
      setResetMsg("✔ Tudo apagado. Cria a conta outra vez.");
      setPin("");
      setName("");
      setTab("register");
    } else {
      setResetMsg(data.error || "Não consegui repor");
    }
  };

  const submit = async () => {
    setErr("");
    if (!name.trim() || pin.length !== 4) {
      setErr("Escreve o teu nome e um PIN de 4 números");
      return;
    }
    setBusy(true);
    const path = tab === "register" ? "/api/auth/register" : "/api/auth/login";
    const { ok, data } = await api<{
      error?: string;
      token: string;
      commander: Commander;
      family: Family;
    }>(path, { method: "POST", body: { name: name.trim(), pin } });
    setBusy(false);
    if (!ok) {
      setErr(data.error || "Erro. Tenta de novo.");
      return;
    }
    onDone(data.token, data.commander, data.family);
  };

  return (
    <div className="min-h-screen bg-[#0f0620] flex items-center justify-center p-4 text-white">
      <div className="mc-panel p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">👑</div>
          <McTitle size="sm">ÁREA DA MÃE</McTitle>
          <p className="text-[9px] opacity-70 mt-2">
            Só precisas do teu nome e um PIN. Mais nada.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab("register")}
            className={`mc-btn flex-1 py-2 text-[10px] ${tab === "register" ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
          >
            CRIAR CONTA
          </button>
          <button
            onClick={() => setTab("login")}
            className={`mc-btn flex-1 py-2 text-[10px] ${tab === "login" ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
          >
            JÁ TENHO CONTA
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase block">O teu nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Mamã Ana"
            className="w-full mc-block bg-white text-black p-3 text-xs outline-none"
          />
          <label className="text-[9px] uppercase block pt-1">PIN (4 números)</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="0000"
            inputMode="numeric"
            className="w-full mc-block bg-white text-black p-3 text-xs outline-none tracking-[0.5em]"
          />
        </div>

        {err && (
          <div className="mc-block bg-[#c0392b] px-3 py-2 text-[10px] mt-3">
            {err}
          </div>
        )}

        <McButton
          color="grass"
          size="lg"
          className="w-full mt-4"
          onClick={submit}
          disabled={busy}
        >
          {busy ? "…" : tab === "register" ? "CRIAR E ENTRAR" : "ENTRAR"}
        </McButton>

        <Link href="/">
          <McButton color="stone" className="w-full mt-2">
            ← VOLTAR
          </McButton>
        </Link>

        <details className="mt-4 text-center">
          <summary className="text-[8px] opacity-60 cursor-pointer">
            Estou bloqueada — repor tudo
          </summary>
          <div className="mt-2 space-y-2">
            <input
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              placeholder="Escreve: APAGAR TUDO"
              className="w-full mc-block bg-white text-black p-2 text-[10px] outline-none"
            />
            <McButton
              color="red"
              size="sm"
              onClick={doReset}
              disabled={busy || resetText !== "APAGAR TUDO"}
            >
              🗑 APAGAR TUDO E COMEÇAR
            </McButton>
            {resetMsg && (
              <div className="text-[9px] text-green-300">{resetMsg}</div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

function AdminPanel({
  me,
  onLogout,
  refresh,
}: {
  me: Commander;
  onLogout: () => void;
  refresh: () => void;
}) {
  const router = useRouter();
  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center gap-2">
          <McTitle size="sm">👑 PAINEL DA MÃE</McTitle>
          <div className="flex gap-2">
            <McButton color="stone" size="sm" onClick={onLogout}>
              SAIR
            </McButton>
            <Link href="/">
              <McButton color="stone" size="sm">
                HOME
              </McButton>
            </Link>
          </div>
        </div>
        <p className="text-[10px] mt-2 opacity-90">Olá, {me.name} 👑</p>

        {/* Atalhos do painel — TUDO dos pais vive aqui */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <PanelLink href="/painel" icon="📊" t="Progresso" s="Leitura, missões, diário" />
          <PanelLink href="/configuracao-missoes" icon="🎯" t="Missões & Voz" s="Criar + gravar surpresa" />
          <PanelLink href="/tarefas-escolares" icon="🎒" t="Tarefas Escola" s="Lançar deveres" />
          <PanelLink href="/relatorio-semanal" icon="📈" t="Relatório" s="Resumo da semana" />
          <PanelLink href="/painel-humor" icon="😊" t="Diário Emocional" s="Como ele se sente" />
          <PanelLink href="/configuracoes-perfil" icon="🎨" t="Ajustes" s="Perfis e skins" />
        </div>

        <ChildrenManager familyId={me.familyId} onChange={refresh} />
        <CommandersManager me={me} familyId={me.familyId} onChange={refresh} />

        <div className="mt-6">
          <McButton color="grass" size="lg" className="w-full" onClick={() => router.push("/jogar")}>
            🎮 ENTREGAR AO HERÓI (JOGAR)
          </McButton>
        </div>
      </div>
    </div>
  );
}

function PanelLink({
  href,
  icon,
  t,
  s,
}: {
  href: string;
  icon: string;
  t: string;
  s: string;
}) {
  return (
    <Link
      href={href}
      className="mc-btn bg-[#a06b3a] p-3 hover:brightness-110 flex items-center gap-2"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-left">
        <span className="block text-[10px] font-bold">{t}</span>
        <span className="block text-[8px] opacity-80">{s}</span>
      </span>
    </Link>
  );
}

type Hero = {
  id: number;
  name: string;
  age: number;
  isAdult: boolean;
  isTest: boolean;
  currentDay: number;
  xp: number;
};

function ChildrenManager({
  familyId,
  onChange,
}: {
  familyId: number;
  onChange: () => void;
}) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState(6);
  const [isAdult, setIsAdult] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await api<{ heroes: Hero[] }>("/api/heroes");
    setHeroes(data.heroes ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    setMsg("");
    if (!name.trim()) {
      setMsg("⚠ Escreve o nome");
      return;
    }
    const { ok, status, data } = await api<{ error?: string }>("/api/heroes", {
      method: "POST",
      body: { name: name.trim(), age, isAdult, familyId },
    });
    if (!ok) {
      if (status === 401) {
        setMsg("⚠ Perdeste a sessão. Sai e entra outra vez, depois cria o perfil.");
      } else if (status === 0) {
        setMsg("⚠ Sem ligação. Verifica a internet e tenta de novo.");
      } else {
        setMsg(`⚠ ${data.error || "Não consegui guardar. Tenta de novo."}`);
      }
      return;
    }
    setName("");
    setMsg(`✔ ${name} adicionado e guardado!`);
    await load();
    onChange();
  };

  const createTest = async () => {
    // Reusa perfil de teste se já existir (nada de duplicatas).
    const existing = heroes.find((h) => h.isTest);
    if (existing) {
      setMsg("✔ Perfil de teste já existe! Toca em ▶ JOGAR abaixo do perfil.");
      return;
    }
    const { ok, data } = await api<{ error?: string; hero?: Hero }>(
      "/api/heroes",
      {
        method: "POST",
        body: { name: "Herói de Teste", isTest: true, familyId },
      }
    );
    if (!ok) {
      setMsg(`⚠ ${data.error || "Não consegui criar o teste"}`);
      return;
    }
    setMsg("✔ Perfil de teste criado! Toca em ▶ JOGAR TESTE abaixo.");
    await load();
    onChange();
  };

  const remove = async (h: Hero) => {
    if (!confirm(`Remover ${h.name}?`)) return;
    await api(`/api/heroes?id=${h.id}`, { method: "DELETE" });
    load();
    onChange();
  };

  return (
    <div className="mc-panel p-4 mt-5">
      <div className="text-[11px] uppercase tracking-widest mb-2">
        🧒 Jogadores da família
      </div>
      <p className="text-[9px] opacity-80 mb-3">
        Adiciona as crianças. Marca “adulto” para tu ou o pai poderem
        duelar com o Miguel!
      </p>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do jogador"
          className="w-full mc-block bg-white text-black p-3 text-xs outline-none"
        />
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-[10px]">Idade</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mc-block bg-white text-black p-2 text-xs w-16 outline-none"
          />
          <button
            onClick={() => setIsAdult(!isAdult)}
            className={`mc-btn px-2 py-2 text-[9px] ${isAdult ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
          >
            {isAdult ? "👤 ADULTO" : "🧒 CRIANÇA"}
          </button>
          <McButton color="grass" onClick={add} className="flex-1">
            ➕ ADICIONAR
          </McButton>
        </div>
      </div>
      {msg && (
        <div className="mc-block bg-[#5aab3a] px-3 py-2 text-[10px] mt-2">{msg}</div>
      )}

      <div className="space-y-2 mt-3">
        {heroes.map((h) => (
          <div key={h.id} className="mc-block bg-[#5a4020] p-2 flex items-center gap-2">
            <div className="w-8 h-8 mc-block bg-[#7a3fbe] flex items-center justify-center text-sm font-bold uppercase">
              {h.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold">
                {h.name}
                {h.isAdult && (
                  <span className="ml-1 text-[8px] bg-[#4fd0e0] text-black px-1">
                    ADULTO
                  </span>
                )}
                {h.isTest && (
                  <span className="ml-1 text-[8px] bg-[#f5c518] text-black px-1">
                    TESTE
                  </span>
                )}
              </div>
              <div className="text-[9px] opacity-70">
                Dia {h.currentDay}/15 · {h.xp} XP
              </div>
            </div>
            <Link
              href={`/jogar?hero=${h.id}${h.isTest ? "&teste=1" : ""}`}
              className="mc-btn bg-[#5aab3a] px-2 py-1 text-[9px] font-bold"
              onClick={() => {
                try {
                  localStorage.setItem("manicrafiti:activeHeroId", String(h.id));
                } catch { /* noop */ }
              }}
            >
              ▶ JOGAR
            </Link>
            <McButton color="red" size="sm" onClick={() => remove(h)}>
              🗑
            </McButton>
          </div>
        ))}
      </div>

      <McButton color="gold" size="lg" className="w-full mt-3" onClick={createTest}>
        🧪 CRIAR / USAR PERFIL DE TESTE
      </McButton>
    </div>
  );
}

type Perms = {
  missoes: boolean;
  recompensas: boolean;
  desafios: boolean;
  voz: boolean;
  tarefas: boolean;
};
type Cmd = {
  id: number;
  role: string;
  name: string;
  loginName: string;
  isAdmin: boolean;
  permissions: Perms;
};

const PERM_LABELS: { key: keyof Perms; label: string }[] = [
  { key: "missoes", label: "🎯 Criar missões" },
  { key: "recompensas", label: "🎁 Dar recompensas" },
  { key: "desafios", label: "⚡ Criar desafios" },
  { key: "voz", label: "🎙 Mensagens de voz" },
  { key: "tarefas", label: "🎒 Tarefas escolares" },
];

function CommandersManager({
  me,
  familyId,
  onChange,
}: {
  me: Commander;
  familyId: number;
  onChange: () => void;
}) {
  const [list, setList] = useState<Cmd[]>([]);
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("pai");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { data } = await api<{ commanders: Cmd[] }>("/api/commanders");
    setList(data.commanders ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    setErr("");
    if (!name.trim() || pin.length !== 4) {
      setErr("Escreve o nome e um PIN de 4 números");
      return;
    }
    const { ok, data } = await api<{ error?: string }>("/api/commanders", {
      method: "POST",
      body: { role, name: name.trim(), pin, familyId },
    });
    if (!ok) {
      setErr(data.error || "Erro");
      return;
    }
    setName("");
    setPin("");
    setShow(false);
    load();
    onChange();
  };

  const togglePerm = async (c: Cmd, key: keyof Perms) => {
    const perms = { ...c.permissions, [key]: !c.permissions[key] };
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, permissions: perms } : x)));
    await api("/api/commanders", {
      method: "PATCH",
      body: { id: c.id, permissions: perms, familyId },
    });
  };

  const del = async (id: number) => {
    if (!confirm("Remover este acesso?")) return;
    await api(`/api/commanders?id=${id}`, { method: "DELETE" });
    load();
  };

  const ROLES = [
    { r: "pai", l: "🛡 Pai" },
    { r: "madrinha", l: "🧚 Madrinha" },
    { r: "padrinho", l: "🎩 Padrinho" },
    { r: "avo", l: "👵 Avó/Avô" },
    { r: "professor", l: "🏫 Professor" },
    { r: "mae", l: "�� Outra Mãe" },
  ];

  return (
    <div className="mc-panel p-4 mt-5">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[11px] uppercase tracking-widest">
          🛡 Comandantes & Padrinhos
        </div>
        <McButton color="grass" size="sm" onClick={() => setShow(!show)}>
          {show ? "✕" : "+ DAR ACESSO"}
        </McButton>
      </div>
      <p className="text-[9px] opacity-80 mb-3">
        Cria o acesso com um nome e um PIN e entrega a essa pessoa. Tu ligas e
        desligas o que cada um pode fazer.
      </p>

      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="mc-block bg-[#0f0620] p-2 text-white">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase">
                  {c.role} — {c.name}
                </div>
                <div className="text-[8px] opacity-70">
                  entra com: <b>{c.name}</b> + PIN
                </div>
              </div>
              {c.isAdmin ? (
                <span className="text-[8px] bg-[#f5c518] text-black px-1">
                  ADMIN
                </span>
              ) : (
                <>
                  <McButton
                    color="wood"
                    size="sm"
                    onClick={() =>
                      setEditing(editing === c.id ? null : c.id)
                    }
                  >
                    ⚙ PERMISSÕES
                  </McButton>
                  <McButton color="red" size="sm" onClick={() => del(c.id)}>
                    🗑
                  </McButton>
                </>
              )}
            </div>

            {editing === c.id && !c.isAdmin && (
              <div className="mt-2 grid grid-cols-1 gap-1">
                {PERM_LABELS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => togglePerm(c, p.key)}
                    className={`mc-btn py-2 text-[9px] flex justify-between px-3 ${
                      c.permissions?.[p.key]
                        ? "bg-[#5aab3a]"
                        : "bg-[#5a5a5a]"
                    }`}
                  >
                    <span>{p.label}</span>
                    <span>{c.permissions?.[p.key] ? "✔ LIGADO" : "✕ desligado"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {show && (
        <div className="mc-block bg-[#0f0620] p-3 mt-3 space-y-2 text-white">
          <div className="grid grid-cols-3 gap-1">
            {ROLES.map((o) => (
              <button
                key={o.r}
                onClick={() => setRole(o.r)}
                className={`mc-btn py-2 text-[8px] ${role === o.r ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <input
            placeholder="Nome (é assim que essa pessoa entra)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mc-block bg-white text-black p-2 text-xs outline-none"
          />
          <input
            placeholder="PIN (4 números)"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            className="w-full mc-block bg-white text-black p-2 text-xs outline-none tracking-[0.4em]"
          />
          {err && <div className="text-[9px] text-red-400">{err}</div>}
          <McButton color="grass" onClick={add} className="w-full">
            CRIAR ACESSO
          </McButton>
        </div>
      )}
    </div>
  );
}
