import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { kidChallenges, heroes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// A CRIANÇA desafia os pais. Inverter o poder aumenta muito o
// engajamento e o vínculo (autonomia — Deci & Ryan, teoria da
// autodeterminação).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ challenges: [] });
  const rows = await db
    .select()
    .from(kidChallenges)
    .where(eq(kidChallenges.heroId, heroId))
    .orderBy(desc(kidChallenges.createdAt));
  return NextResponse.json({ challenges: rows });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const heroId = Number(b?.heroId);
  const title = String(b?.title ?? "").trim();
  if (!heroId || !title)
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  const [row] = await db
    .insert(kidChallenges)
    .values({ heroId, title, toRole: String(b?.toRole ?? "mae") })
    .returning();
  return NextResponse.json({ challenge: row });
}

// Pai/mãe aceita ou cumpre. Se cumprir, a criança ganha XP também.
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const id = Number(b?.id);
  const status = String(b?.status ?? "cumprido");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const [c] = await db.select().from(kidChallenges).where(eq(kidChallenges.id, id));
  if (!c) return NextResponse.json({ error: "não existe" }, { status: 404 });
  await db.update(kidChallenges).set({ status }).where(eq(kidChallenges.id, id));
  if (status === "cumprido" && c.status !== "cumprido") {
    const [hero] = await db.select().from(heroes).where(eq(heroes.id, c.heroId));
    if (hero)
      await db
        .update(heroes)
        .set({ xp: hero.xp + 50 })
        .where(eq(heroes.id, hero.id));
  }
  return NextResponse.json({ ok: true });
}
