"use client";
import { useCallback, useEffect, useState } from "react";
import McButton from "@/components/McButton";
import PixelConfetti from "@/components/PixelConfetti";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";
import { say, sfx } from "@/lib/voice";
import {
  SHOP_ITEMS,
  RARITY_COLOR,
  CATEGORY_LABEL,
  ShopItem,
} from "@/lib/shop";

type Owned = { itemId: string };

const CATS: (ShopItem["category"] | "todos")[] = [
  "todos",
  "arma",
  "armadura",
  "pet",
  "montaria",
  "poder",
  "aparencia",
  "cenario",
];

export default function LojaPage() {
  const { heroes, sel, setSel, loading, reload } = useHeroes();
  const [owned, setOwned] = useState<Owned[]>([]);
  const [msg, setMsg] = useState("");
  const [confetti, setConfetti] = useState(0);
  const [cat, setCat] = useState<ShopItem["category"] | "todos">("todos");

  const loadInv = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/inventory?heroId=${sel.id}`).then((r) => r.json());
    setOwned(d.items ?? []);
  }, [sel]);

  useEffect(() => {
    loadInv();
  }, [loadInv]);

  if (loading) return <PageShell title="🎁 LOJA">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🎁 LOJA">
        <EmptyHeroes />
      </PageShell>
    );

  const has = (id: string) => owned.some((o) => o.itemId === id);
  const visible = cat === "todos" ? SHOP_ITEMS : SHOP_ITEMS.filter((i) => i.category === cat);

  const buy = async (it: ShopItem) => {
    setMsg("");
    const r = await fetch("/api/inventory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        heroId: sel.id,
        itemId: it.id,
        itemName: it.name,
        icon: it.icon,
        price: it.price,
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      sfx.wrong();
      setMsg(`✕ ${d.error}`);
      say(`${d.error}. Joga mais para ganhar gemas!`, { mood: "gentle" });
      return;
    }
    sfx.levelUp();
    setConfetti(Date.now());
    setMsg(`✔ Compraste ${it.name}!`);
    say(`Compraste ${it.name}! Está no teu inventário!`, { mood: "hype" });
    await Promise.all([loadInv(), reload()]);
  };

  return (
    <PageShell title="🎁 LOJA DE RECOMPENSAS">
      <PixelConfetti trigger={confetti} />
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="mc-panel p-4 mb-4 text-center">
        <div className="text-sm uppercase font-bold">{sel.name}</div>
        <div className="text-3xl mt-1">💎 {sel.gems}</div>
        <div className="text-[9px] opacity-80">
          {SHOP_ITEMS.length} itens · Ganha gemas jogando e cumprindo missões
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-3">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`mc-btn px-2 py-1 text-[9px] ${cat === c ? "bg-[#f5c518] text-black" : "bg-[#8b8b8b]"}`}
          >
            {c === "todos" ? "🌈 Todos" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {msg && (
        <div
          className={`mc-block px-3 py-2 mb-3 text-center text-[10px] ${msg.startsWith("✔") ? "bg-[#5aab3a]" : "bg-[#c0392b]"}`}
        >
          {msg}
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {visible.map((it) => {
          const isOwned = has(it.id);
          const canAfford = sel.gems >= it.price;
          return (
            <div
              key={it.id}
              className={`mc-block p-2 text-center ${isOwned ? "bg-[#5aab3a]" : "bg-[#a06b3a]"}`}
              style={{ boxShadow: `inset 0 0 0 3px ${RARITY_COLOR[it.rarity]}` }}
            >
              <div className="text-3xl">{it.icon}</div>
              <div className="text-[8px] uppercase font-bold mt-1 leading-tight">
                {it.name}
              </div>
              <div
                className="text-[7px] mt-0.5"
                style={{ color: RARITY_COLOR[it.rarity] }}
              >
                {it.rarity.toUpperCase()}
              </div>
              <div className="text-[10px] mt-1">💎 {it.price}</div>
              {isOwned ? (
                <div className="mc-block bg-black/40 px-1 py-0.5 text-[7px] mt-1">
                  ✔ TENS
                </div>
              ) : (
                <McButton
                  color={canAfford ? "gold" : "stone"}
                  size="sm"
                  className="mt-1 w-full text-[8px]"
                  onClick={() => buy(it)}
                  disabled={!canAfford}
                >
                  {canAfford ? "COMPRAR" : "🔒"}
                </McButton>
              )}
            </div>
          );
        })}
      </div>

      <div className="mc-block bg-[#5a4020] p-3 mt-4 text-[9px] leading-relaxed">
        💡 <b>Dica:</b> comuns são rápidos de comprar, lendários pedem
        dedicação. Cada compra é um passo de dopamina positiva — reforça a
        rotina de aprender.
      </div>
    </PageShell>
  );
}
