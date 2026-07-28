import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  if (!heroId) return NextResponse.json({ photos: [] });
  const rows = await db
    .select()
    .from(photos)
    .where(eq(photos.heroId, heroId))
    .orderBy(desc(photos.createdAt));
  return NextResponse.json({ photos: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  const dataUrl = String(body?.dataUrl ?? "");
  const day = Number(body?.day ?? 1);
  const target = String(body?.target ?? "");
  if (!heroId || !dataUrl) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const [row] = await db
    .insert(photos)
    .values({ heroId, day, target, dataUrl })
    .returning();
  return NextResponse.json({ photo: { id: row.id, day: row.day, target: row.target } });
}
