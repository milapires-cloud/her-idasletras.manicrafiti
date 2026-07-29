import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { voiceMessages } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  const unplayedOnly = searchParams.get("unplayed") === "1";
  if (!heroId) return NextResponse.json({ messages: [] });
  const where = unplayedOnly
    ? and(eq(voiceMessages.heroId, heroId), eq(voiceMessages.played, false))
    : eq(voiceMessages.heroId, heroId);
  const rows = await db
    .select()
    .from(voiceMessages)
    .where(where)
    .orderBy(desc(voiceMessages.createdAt));
  return NextResponse.json({ messages: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  if (!heroId) return NextResponse.json({ error: "heroId" }, { status: 400 });
  const [row] = await db
    .insert(voiceMessages)
    .values({
      heroId,
      fromRole: String(body?.fromRole ?? "mae"),
      text: String(body?.text ?? ""),
      audioUrl: String(body?.audioUrl ?? ""),
    })
    .returning();
  return NextResponse.json({ message: { id: row.id } });
}

// Marca como ouvida (a surpresa só acontece uma vez).
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const id = Number(body?.id);
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db
    .update(voiceMessages)
    .set({ played: true })
    .where(eq(voiceMessages.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db.delete(voiceMessages).where(eq(voiceMessages.id, id));
  return NextResponse.json({ ok: true });
}
