import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, heroes } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ items: [] });
  const rows = await db
    .select()
    .from(inventory)
    .where(eq(inventory.heroId, heroId))
    .orderBy(desc(inventory.createdAt));
  return NextResponse.json({ items: rows });
}

// Comprar item: debita gemas de forma atómica do lado do servidor.
export async function POST(req: NextRequest) {
  const b = await req.json();
  const heroId = Number(b?.heroId);
  const itemId = String(b?.itemId ?? "");
  const price = Number(b?.price ?? 0);
  if (!heroId || !itemId)
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });

  const [hero] = await db.select().from(heroes).where(eq(heroes.id, heroId));
  if (!hero) return NextResponse.json({ error: "Herói não existe" }, { status: 404 });

  const already = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.heroId, heroId), eq(inventory.itemId, itemId)));
  if (already.length)
    return NextResponse.json({ error: "Já tens este item!" }, { status: 400 });

  if (hero.gems < price)
    return NextResponse.json(
      { error: `Faltam ${price - hero.gems} gemas` },
      { status: 400 }
    );

  await db
    .update(heroes)
    .set({ gems: hero.gems - price })
    .where(eq(heroes.id, heroId));

  const [row] = await db
    .insert(inventory)
    .values({
      heroId,
      itemId,
      itemName: String(b?.itemName ?? itemId),
      icon: String(b?.icon ?? "🎁"),
    })
    .returning();

  return NextResponse.json({ item: row, gems: hero.gems - price });
}

// Equipar/desequipar
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const id = Number(b?.id);
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const [it] = await db.select().from(inventory).where(eq(inventory.id, id));
  if (!it) return NextResponse.json({ error: "não existe" }, { status: 404 });
  await db
    .update(inventory)
    .set({ equipped: !it.equipped })
    .where(eq(inventory.id, id));
  return NextResponse.json({ ok: true, equipped: !it.equipped });
}
