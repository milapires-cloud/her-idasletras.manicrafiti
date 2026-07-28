import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diary } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  const includeSecret = searchParams.get("includeSecret") === "1";
  if (!heroId) return NextResponse.json({ diary: [] });
  const rows = await db
    .select()
    .from(diary)
    .where(eq(diary.heroId, heroId))
    .orderBy(desc(diary.createdAt));
  const cleaned = rows.map((r) => ({
    ...r,
    secret: includeSecret ? r.secret : "🔒 privado do herói",
  }));
  return NextResponse.json({ diary: cleaned });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  if (!heroId) return NextResponse.json({ error: "heroId" }, { status: 400 });
  const [row] = await db
    .insert(diary)
    .values({
      heroId,
      day: Number(body?.day ?? 1),
      mood: String(body?.mood ?? "feliz"),
      school: String(body?.school ?? ""),
      dream: String(body?.dream ?? ""),
      friend: String(body?.friend ?? ""),
      secret: String(body?.secret ?? ""),
    })
    .returning();
  return NextResponse.json({ diary: row });
}
