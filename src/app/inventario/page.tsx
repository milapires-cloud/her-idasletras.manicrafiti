"use client";
import { useCallback, useEffect, useState } from "react";
import McButton from "@/components/McButton";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";
import { sfx, say } from "@/lib/voice";

type Item = {
  id: number;
  itemId: string;
  itemName: string;
  icon: string;
  equipped: boolean;
};

export default function Inventario() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/inventory?heroId=${sel.id}`).then((r) => r.json());
    setItems(d.items ?? []);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (it: Item) => {
    sfx.click();
    await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: it.id }),
    });
    say(it.equipped ? "Item guardado!" : `${it.itemName} equipado!`);
    load();
  };

  if (loading) return <PageShell title="🎒 INVENTÁRIO">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🎒 INVENTÁRIO">
        <EmptyHeroes />
      </PageShell>
    );

  const equipped = items.filter((i) => i.equipped);

  return (
    <PageShell title="🎒 INVENTÁRIO">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="mc-panel p-4 mb-4 text-center">
        <div className="text-sm font-bold uppercase">{sel.name}</div>
        <div className="text-xl mt-1">💎 {sel.gems} gemas</div>
        <div className="text-[10px] opacity-80 mt-1">
          {items.length} itens · {equipped.length} equipados
        </div>
      </div>

      {/* Vitrine do herói equipado */}
      <div className="mc-panel p-4 mb-4">
        <div className="text-[11px] uppercase tracking-widest mb-3 text-center">
          O TEU HERÓI
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-24 relative animate-float">
            <div className="mc-block bg-[#e0b48a] w-full h-1/2 flex items-center justify-center gap-1">
              <div className="w-2 h-2.5 bg-black" />
              <div className="w-2 h-2.5 bg-black" />
            </div>
            <div className="mc-block bg-[#4fd0e0] w-full h-1/2" />
          </div>
          <div className="flex gap-1 mt-2 text-2xl">
            {equipped.length ? (
              equipped.map((e) => <span key={e.id}>{e.icon}</span>)
            ) : (
              <span className="text-[9px] opacity-60">Nada equipado ainda</span>
            )}
          </div>
        </div>
      </div>

      {/* Grelha estilo inventário Minecraft */}
      <div className="mc-panel p-3">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: Math.max(20, items.length) }).map((_, n) => {
            const it = items[n];
            return (
              <button
                key={n}
                onClick={() => it && toggle(it)}
                className={`mc-block aspect-square flex flex-col items-center justify-center ${
                  it
                    ? it.equipped
                      ? "bg-[#f5c518]"
                      : "bg-[#5a5a5a]"
                    : "bg-[#3a3a3a] opacity-50"
                }`}
              >
                {it && (
                  <>
                    <span className="text-2xl">{it.icon}</span>
                    {it.equipped && (
                      <span className="text-[7px] text-black font-bold">EQUIP</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {items.length === 0 && (
        <div className="mc-block bg-black/30 p-4 text-center text-[10px] mt-4">
          Inventário vazio. Ganha gemas a jogar e compra na Loja!
          <McButton color="gold" size="sm" className="mt-3">
            <a href="/loja-recompensas">🎁 IR À LOJA</a>
          </McButton>
        </div>
      )}
    </PageShell>
  );
}
