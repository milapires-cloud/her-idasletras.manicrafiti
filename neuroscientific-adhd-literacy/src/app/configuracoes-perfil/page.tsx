"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";
import { api } from "@/lib/session";
import { armorForXp } from "@/lib/monsters";

type Style = {
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  armor: string;
};
type Hero = {
  id: number;
  name: string;
  age: number;
  avatar: string;
  currentDay: number;
  xp: number;
  gems: number;
  style?: Style;
};

const SKIN = [
  { k: "claro", c: "#f2c7a5", l: "clara" },
  { k: "medio", c: "#c98b5f", l: "média" },
  { k: "escuro", c: "#7a4a2a", l: "escura" },
];
const HAIR = [
  { k: "preto", c: "#1b1b1b", l: "preto" },
  { k: "castanho", c: "#5a3218", l: "castanho" },
  { k: "loiro", c: "#e0b44b", l: "loiro" },
  { k: "vermelho", c: "#b33a20", l: "ruivo" },
];
const EYES = [
  { k: "castanho", c: "#4a2a16", l: "castanho" },
  { k: "azul", c: "#4fd0e0", l: "azul" },
  { k: "verde", c: "#5aab3a", l: "verde" },
];
const OUTFITS = [
  { k: "azul", c: "#4fd0e0", l: "azul" },
  { k: "verde", c: "#5aab3a", l: "verde" },
  { k: "vermelho", c: "#c0392b", l: "vermelha" },
  { k: "dourado", c: "#f5c518", l: "dourada" },
];

const DEFAULT_STYLE: Style = {
  skin: "medio",
  hair: "castanho",
  eyes: "castanho",
  outfit: "azul",
  armor: "auto",
};

export default function ConfigPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [sel, setSel] = useState<Hero | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await api<{ heroes: Hero[] }>("/api/heroes");
    setHeroes(data.heroes ?? []);
    setSel((cur) =>
      cur
        ? (data.heroes ?? []).find((h) => h.id === cur.id) ?? (data.heroes ?? [])[0] ?? null
        : (data.heroes ?? [])[0] ?? null
    );
  };
  useEffect(() => {
    load();
  }, []);

  const style = { ...DEFAULT_STYLE, ...(sel?.style ?? {}) };

  const saveStyle = async (patch: Partial<Style>) => {
    if (!sel) return;
    const next = { ...style, ...patch };
    const { ok } = await api(`/api/heroes/${sel.id}`, {
      method: "PATCH",
      body: { style: next },
    });
    if (ok) {
      setSel({ ...sel, style: next });
      setHeroes((hs) => hs.map((h) => (h.id === sel.id ? { ...h, style: next } : h)));
      setMsg("✔ Perfil salvo!");
    } else {
      setMsg("⚠ Não consegui salvar. Entra pela área da mãe e tenta de novo.");
    }
  };

  return (
    <div className="min-h-screen mc-sky p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <McTitle size="sm">🎨 AJUSTES DO HERÓI</McTitle>
          <Link href="/">
            <McButton color="stone" size="sm">← HOME</McButton>
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {heroes.map((h) => (
            <button key={h.id} onClick={() => setSel(h)}
              className={`mc-btn px-3 py-2 text-[10px] ${sel?.id === h.id ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}>
              {h.name}
            </button>
          ))}
        </div>

        {!sel ? (
          <div className="mc-block bg-black/30 p-4 text-center text-[10px]">
            Nenhum herói. A mãe precisa adicionar primeiro.
          </div>
        ) : (
          <div className="grid md:grid-cols-[260px_1fr] gap-4">
            <div className="mc-panel p-4 flex flex-col items-center">
              <HeroPreview hero={sel} style={style} />
              <div className="text-sm font-bold uppercase mt-3">{sel.name}</div>
              <div className="text-[9px] opacity-80 mt-1">XP {sel.xp} · 💎 {sel.gems}</div>
              <div className="mc-block bg-[#f5c518] text-black px-2 py-1 text-[8px] mt-2">
                {armorForXp(sel.xp).name}
              </div>
            </div>

            <div className="space-y-3">
              <Choice title="Cor da pele" items={SKIN} active={style.skin} onPick={(k) => saveStyle({ skin: k })} />
              <Choice title="Cabelo" items={HAIR} active={style.hair} onPick={(k) => saveStyle({ hair: k })} />
              <Choice title="Olhos" items={EYES} active={style.eyes} onPick={(k) => saveStyle({ eyes: k })} />
              <Choice title="Roupa" items={OUTFITS} active={style.outfit} onPick={(k) => saveStyle({ outfit: k })} />
              <div className="mc-panel p-3">
                <div className="text-[10px] uppercase tracking-widest mb-2">Armadura</div>
                <div className="grid grid-cols-2 gap-2">
                  {["auto", "mostrar", "esconder"].map((a) => (
                    <button
                      key={a}
                      onClick={() => saveStyle({ armor: a })}
                      className={`mc-btn py-2 text-[9px] ${style.armor === a ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
                    >
                      {a === "auto" ? "Auto" : a === "mostrar" ? "Mostrar" : "Esconder"}
                    </button>
                  ))}
                </div>
              </div>
              {msg && <div className="mc-block bg-[#5aab3a] p-2 text-[10px]">{msg}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Choice({
  title,
  items,
  active,
  onPick,
}: {
  title: string;
  items: { k: string; c: string; l: string }[];
  active: string;
  onPick: (k: string) => void;
}) {
  return (
    <div className="mc-panel p-3">
      <div className="text-[10px] uppercase tracking-widest mb-2">{title}</div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => (
          <button key={it.k} onClick={() => onPick(it.k)}
            className={`mc-btn p-2 text-[8px] ${active === it.k ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}>
            <span className="block w-8 h-8 mc-block mx-auto mb-1" style={{ background: it.c }} />
            {it.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function colorOf(list: { k: string; c: string }[], k: string) {
  return list.find((x) => x.k === k)?.c ?? list[0].c;
}

function HeroPreview({ hero, style }: { hero: Hero; style: Style }) {
  const armor = armorForXp(hero.xp);
  const showArmor = style.armor !== "esconder";
  return (
    <div className="relative w-36 h-44 flex flex-col items-center justify-end">
      <div className="absolute top-0 w-20 h-10 mc-block" style={{ background: colorOf(HAIR, style.hair) }} />
      <div className="w-20 h-20 mc-block flex items-center justify-center gap-2" style={{ background: colorOf(SKIN, style.skin) }}>
        <span className="w-3 h-3 mc-block" style={{ background: colorOf(EYES, style.eyes) }} />
        <span className="w-3 h-3 mc-block" style={{ background: colorOf(EYES, style.eyes) }} />
      </div>
      <div className="w-24 h-20 mc-block flex items-center justify-center text-3xl" style={{ background: showArmor ? armor.color : colorOf(OUTFITS, style.outfit) }}>
        {showArmor ? armor.helmet || "🛡️" : "👕"}
      </div>
    </div>
  );
}
