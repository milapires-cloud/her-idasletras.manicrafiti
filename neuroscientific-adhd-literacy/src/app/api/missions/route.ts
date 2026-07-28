import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { missions, heroes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ missions: [] });
  const rows = await db
    .select()
    .from(missions)
    .where(eq(missions.heroId, heroId))
    .orderBy(desc(missions.createdAt));
  return NextResponse.json({ missions: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  const title = String(body?.title ?? "").trim();
  if (!heroId || !title) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const [row] = await db
    .insert(missions)
    .values({
      heroId,
      title,
      description: String(body?.description ?? ""),
      reward: Number(body?.reward ?? 100),
      kind: String(body?.kind ?? "obediencia"),
      createdBy: String(body?.createdBy ?? "mae"),
    })
    .returning();
  return NextResponse.json({ mission: row });
}

// Marca como cumprida — dá XP e gemas ao herói.
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = Number(body?.id);
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const [m] = await db.select().from(missions).where(eq(missions.id, id));
  if (!m) return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 });
  if (m.completed) return NextResponse.json({ mission: m });
  await db
    .update(missions)
    .set({ completed: true, completedAt: new Date() })
    .where(eq(missions.id, id));
  const [hero] = await db.select().from(heroes).where(eq(heroes.id, m.heroId));
  if (hero) {
    await db
      .update(heroes)
      .set({ xp: hero.xp + m.reward, gems: hero.gems + 5 })
      .where(eq(heroes.id, hero.id));
  }
  return NextResponse.json({ ok: true, reward: m.reward });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db.delete(missions).where(eq(missions.id, id));
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
