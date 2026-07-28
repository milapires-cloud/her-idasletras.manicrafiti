import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commanders, families, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin, newToken, newJoinCode } from "@/lib/crypto";

// REGISTO SIMPLES: a mãe só escreve NOME + PIN. Mais nada.
// A "família" é criada automaticamente por trás — a mãe nunca a vê.
// O login passa a ser pelo próprio NOME + PIN.
export async function POST(req: NextRequest) {
  const b = await req.json();
  const name = String(b?.name ?? "").trim();
  const pin = String(b?.pin ?? "").trim();

  if (!name || pin.length !== 4) {
    return NextResponse.json(
      { error: "Escreve o teu nome e um PIN de 4 números" },
      { status: 400 }
    );
  }

  // O nome funciona como identificador de login (normalizado).
  const loginName = name.toLowerCase().replace(/\s+/g, " ").trim();

  // Se o nome já existe, em vez de bloquear/mostrar erro, tenta entrar
  // com o PIN dado. Assim a mãe nunca fica presa num "já existe".
  const all = await db.select().from(commanders);
  const normCmp = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  const existing = all.find((c) => normCmp(c.loginName) === normCmp(loginName));
  if (existing) {
    if (existing.pinHash === hashPin(pin)) {
      // Entra diretamente — é a mesma pessoa.
      const token = newToken();
      await db
        .insert(sessions)
        .values({ token, commanderId: existing.id, familyId: existing.familyId });
      const [fam2] = await db
        .select()
        .from(families)
        .where(eq(families.id, existing.familyId));
      return NextResponse.json({
        token,
        commander: {
          id: existing.id,
          name: existing.name,
          role: existing.role,
          isAdmin: existing.isAdmin,
          familyId: existing.familyId,
        },
        family: fam2
          ? { id: fam2.id, name: fam2.name, joinCode: fam2.joinCode }
          : null,
      });
    }
    return NextResponse.json(
      {
        error:
          "Já existe alguém com esse nome com outro PIN. Entra em “Já Tenho Conta” ou acrescenta um sobrenome.",
      },
      { status: 409 }
    );
  }

  // cria família invisível (só para agrupar os perfis internamente)
  let code = newJoinCode();
  for (let i = 0; i < 5; i++) {
    const exists = await db
      .select()
      .from(families)
      .where(eq(families.joinCode, code));
    if (!exists.length) break;
    code = newJoinCode();
  }
  const [fam] = await db
    .insert(families)
    .values({ name: `Família de ${name}`, joinCode: code })
    .returning();

  const [cmd] = await db
    .insert(commanders)
    .values({
      familyId: fam.id,
      role: "mae",
      name,
      loginName,
      pinHash: hashPin(pin),
      isAdmin: true,
    })
    .returning();

  const token = newToken();
  await db
    .insert(sessions)
    .values({ token, commanderId: cmd.id, familyId: fam.id });

  return NextResponse.json({
    token,
    commander: {
      id: cmd.id,
      name: cmd.name,
      role: cmd.role,
      isAdmin: cmd.isAdmin,
      familyId: fam.id,
    },
    family: { id: fam.id, name: fam.name, joinCode: fam.joinCode },
  });
}
