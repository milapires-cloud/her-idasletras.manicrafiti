import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commanders, families, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Valida token e devolve o comandante logado (persistência real).
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-session") || "";
  if (!token) return NextResponse.json({ commander: null });
  const rows = await db.select().from(sessions).where(eq(sessions.token, token));
  if (!rows.length) return NextResponse.json({ commander: null });
  const [cmd] = await db
    .select()
    .from(commanders)
    .where(eq(commanders.id, rows[0].commanderId));
  if (!cmd) return NextResponse.json({ commander: null });
  const [fam] = await db
    .select()
    .from(families)
    .where(eq(families.id, cmd.familyId));
  return NextResponse.json({
    commander: {
      id: cmd.id,
      name: cmd.name,
      role: cmd.role,
      isAdmin: cmd.isAdmin,
      familyId: cmd.familyId,
    },
    family: fam ? { id: fam.id, name: fam.name, joinCode: fam.joinCode } : null,
  });
}

// Logout
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("x-session") || "";
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  return NextResponse.json({ ok: true });
}
