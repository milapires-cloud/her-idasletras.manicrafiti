import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commanders, families, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin, newToken } from "@/lib/crypto";

// LOGIN por NOME + PIN. Aceita "loginName" ou "name" (mesma coisa).
export async function POST(req: NextRequest) {
  const b = await req.json();
  const raw = String(b?.loginName ?? b?.name ?? "").trim();
  const loginName = raw.toLowerCase().replace(/\s+/g, " ");
  const pin = String(b?.pin ?? "").trim();
  if (!loginName || pin.length !== 4) {
    return NextResponse.json({ error: "Escreve o nome e o PIN" }, { status: 400 });
  }
  // Procura tolerante: ignora maiúsculas/minúsculas e espaços extra.
  // (Normaliza em aplicação para não depender de collation da BD.)
  const all = await db.select().from(commanders);
  const norm = loginName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const cmd = all.find(
    (c) =>
      c.loginName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim() === norm
  );
  if (!cmd) {
    return NextResponse.json(
      { error: "Nome não encontrado. Cria a conta primeiro." },
      { status: 404 }
    );
  }
  if (cmd.pinHash !== hashPin(pin)) {
    return NextResponse.json({ error: "PIN incorreto" }, { status: 401 });
  }
  const [fam] = await db
    .select()
    .from(families)
    .where(eq(families.id, cmd.familyId));

  const token = newToken();
  await db
    .insert(sessions)
    .values({ token, commanderId: cmd.id, familyId: cmd.familyId });

  return NextResponse.json({
    token,
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
