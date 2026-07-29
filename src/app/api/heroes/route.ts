import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { heroes, sessions, commanders } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function familyOf(token: string): Promise<number | null> {
  if (!token) return null;
  const s = await db.select().from(sessions).where(eq(sessions.token, token));
  if (!s.length) return null;
  return s[0].familyId;
}

// Lista heróis da família do utilizador logado.
// Se não houver sessão (a criança joga sem login), tenta pela família
// passada em query (?familyId=) — usado após a mãe entregar o aparelho.
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-session") || "";
  const { searchParams } = new URL(req.url);
  let familyId = await familyOf(token);
  if (familyId === null) {
    const h = Number(req.headers.get("x-family-id") || "0");
    if (h) familyId = h;
  }
  if (familyId === null) {
    const q = Number(searchParams.get("familyId"));
    if (q) familyId = q;
  }
  if (familyId === null) {
    // sem contexto: devolve nada (evita vazar entre famílias)
    return NextResponse.json({ heroes: [] });
  }
  const rows = await db
    .select()
    .from(heroes)
    .where(eq(heroes.familyId, familyId))
    .orderBy(desc(heroes.createdAt));
  return NextResponse.json({ heroes: rows });
}

// A mãe adiciona uma criança OU um adulto-jogador (para duelar).
// Aceita o token de sessão OU o familyId no body como recurso de segurança
// (para nunca falhar silenciosamente quando a sessão falha).
export async function POST(req: NextRequest) {
  const b = await req.json();
  const token = req.headers.get("x-session") || "";

  let familyId: number | null = null;
  if (token) {
    const s = await db.select().from(sessions).where(eq(sessions.token, token));
    if (s.length) familyId = s[0].familyId;
  }
  // recurso: familyId guardado no aparelho após login da mãe
  if (familyId === null) {
    const h = Number(req.headers.get("x-family-id") || "0");
    if (h) familyId = h;
  }
  // recurso extra: familyId explícito no body
  if (familyId === null && b?.familyId) {
    const f = Number(b.familyId);
    if (f) familyId = f;
  }

  const name = String(b?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  if (familyId === null) {
    return NextResponse.json(
      { error: "Precisas de estar logada para guardar o perfil" },
      { status: 401 }
    );
  }
  const isAdult = Boolean(b?.isAdult);
  const [row] = await db
    .insert(heroes)
    .values({
      familyId,
      name,
      age: Number(b?.age ?? (isAdult ? 30 : 6)),
      avatar: String(b?.avatar ?? "steve"),
      isAdult,
      isTest: Boolean(b?.isTest ?? false),
    })
    .returning();
  return NextResponse.json({ hero: row });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  await db.delete(heroes).where(eq(heroes.id, id));
  return NextResponse.json({ ok: true });
}
