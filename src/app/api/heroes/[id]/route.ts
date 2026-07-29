import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const heroId = Number(id);
  const [hero] = await db.select().from(heroes).where(eq(heroes.id, heroId));
  if (!hero) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ hero });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const heroId = Number(id);
  const body = await req.json();
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.xp === "number") update.xp = body.xp;
  if (typeof body.gems === "number") update.gems = body.gems;
  if (typeof body.streak === "number") update.streak = body.streak;
  if (typeof body.currentDay === "number") update.currentDay = body.currentDay;
  if (typeof body.avatar === "string") update.avatar = body.avatar;
  if (typeof body.armorTier === "number") update.armorTier = body.armorTier;
  if (body.style && typeof body.style === "object") update.style = body.style;
  const [hero] = await db
    .update(heroes)
    .set(update)
    .where(eq(heroes.id, heroId))
    .returning();
  return NextResponse.json({ hero });
}
