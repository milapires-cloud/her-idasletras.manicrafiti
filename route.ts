import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schoolTasks, heroes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ tasks: [] });
  const rows = await db
    .select()
    .from(schoolTasks)
    .where(eq(schoolTasks.heroId, heroId))
    .orderBy(desc(schoolTasks.createdAt));
  return NextResponse.json({ tasks: rows });
}

export async function POST(req: NextRequest) {
  const b = await req.json();
  const heroId = Number(b?.heroId);
  const title = String(b?.title ?? "").trim();
  if (!heroId || !title)
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  const [row] = await db
    .insert(schoolTasks)
    .values({
      heroId,
      title,
      subject: String(b?.subject ?? "Português"),
      dueDate: String(b?.dueDate ?? ""),
      reward: Number(b?.reward ?? 150),
      createdBy: String(b?.createdBy ?? "mae"),
    })
    .returning();
  return NextResponse.json({ task: row });
}

export async function PATCH(req: NextRequest) {
  const b = await req.json();
  const id = Number(b?.id);
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const [t] = await db.select().from(schoolTasks).where(eq(schoolTasks.id, id));
  if (!t) return NextResponse.json({ error: "não existe" }, { status: 404 });
  const update: Record<string, unknown> = {};
  if (typeof b.photoUrl === "string") update.photoUrl = b.photoUrl;
  if (b.done === true && !t.done) {
    update.done = true;
    const [hero] = await db.select().from(heroes).where(eq(heroes.id, t.heroId));
    if (hero)
      await db
        .update(heroes)
        .set({ xp: hero.xp + t.reward, gems: hero.gems + 5 })
        .where(eq(heroes.id, hero.id));
  }
  await db.update(schoolTasks).set(update).where(eq(schoolTasks.id, id));
  return NextResponse.json({ ok: true, reward: t.reward });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db.delete(schoolTasks).where(eq(schoolTasks.id, id));
  return NextResponse.json({ ok: true });
}
