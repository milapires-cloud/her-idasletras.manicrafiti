import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendance } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ days: [] });
  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.heroId, heroId))
    .orderBy(desc(attendance.date));
  return NextResponse.json({ days: rows });
}

// Regista presença de hoje (idempotente por dia).
export async function POST(req: NextRequest) {
  const b = await req.json();
  const heroId = Number(b?.heroId);
  if (!heroId) return NextResponse.json({ error: "heroId" }, { status: 400 });
  const date = new Date().toISOString().slice(0, 10);
  const existing = await db
    .select()
    .from(attendance)
    .where(and(eq(attendance.heroId, heroId), eq(attendance.date, date)));
  if (existing.length) {
    await db
      .update(attendance)
      .set({ minutes: existing[0].minutes + Number(b?.minutes ?? 5) })
      .where(eq(attendance.id, existing[0].id));
    return NextResponse.json({ ok: true, alreadyToday: true });
  }
  await db.insert(attendance).values({
    heroId,
    date,
    day: Number(b?.day ?? 1),
    minutes: Number(b?.minutes ?? 5),
  });
  return NextResponse.json({ ok: true, alreadyToday: false });
}
