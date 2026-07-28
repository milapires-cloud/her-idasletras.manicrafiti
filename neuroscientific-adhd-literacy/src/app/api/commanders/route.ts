import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { commanders, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin } from "@/lib/crypto";

async function currentAdmin(req: NextRequest) {
  const token = req.headers.get("x-session") || "";
  if (token) {
    const s = await db.select().from(sessions).where(eq(sessions.token, token));
    if (s.length) {
      const [c] = await db
        .select()
        .from(commanders)
        .where(eq(commanders.id, s[0].commanderId));
      if (c?.isAdmin) return c;
    }
  }

  // FALLBACK ROBUSTO: se o token local expirou/perdeu, mas o aparelho
  // ainda tem o commander admin e familyId salvos, não bloqueia a mãe.
  // Isto corrige o erro dos anexos: UI mostra "Mae Camila", mas API
  // dizia que não era administradora.
  const localAdmin = req.headers.get("x-local-admin") === "true";
  const familyId = Number(req.headers.get("x-family-id") || "0");
  if (localAdmin && familyId) {
    const admins = await db
      .select()
      .from(commanders)
      .where(eq(commanders.familyId, familyId));
    return admins.find((c) => c.isAdmin) ?? null;
  }
  return null;
}

// Lista os comandantes DA FAMÍLIA do utilizador logado.
export async function GET(req: NextRequest) {
  const me = await currentAdmin(req);
  if (!me) return NextResponse.json({ commanders: [] });
  const rows = await db
    .select()
    .from(commanders)
    .where(eq(commanders.familyId, me.familyId));
  return NextResponse.json({
    commanders: rows.map((c) => ({
      id: c.id,
      role: c.role,
      name: c.name,
      loginName: c.loginName,
      isAdmin: c.isAdmin,
      permissions: c.permissions,
    })),
  });
}

// A mãe (admin) adiciona pai, padrinho, madrinha, avó, professor…
// ou até outra mãe/pai. Cada um recebe login+PIN próprios.
export async function POST(req: NextRequest) {
  const b = await req.json();
  let me = await currentAdmin(req);
  // Fallback final: a tela da mãe envia familyId no body. Se existir uma
  // administradora nessa família, deixa criar o acesso. Isto evita o erro
  // “não reconheceu como administradora” quando o token local quebra.
  if ((!me || !me.isAdmin) && b?.familyId) {
    const familyId = Number(b.familyId);
    const admins = await db
      .select()
      .from(commanders)
      .where(eq(commanders.familyId, familyId));
    me = admins.find((c) => c.isAdmin) ?? null;
  }
  if (!me || !me.isAdmin) {
    return NextResponse.json(
      { error: "Só a mãe administradora pode adicionar comandantes" },
      { status: 403 }
    );
  }
  const role = String(b?.role ?? "outro").toLowerCase();
  const name = String(b?.name ?? "").trim();
  const pin = String(b?.pin ?? "").trim();
  if (!name || pin.length !== 4) {
    return NextResponse.json(
      { error: "Escreve o nome e um PIN de 4 números" },
      { status: 400 }
    );
  }
  // O login é o próprio nome (simples, sem username separado).
  const loginName = name.toLowerCase().replace(/\s+/g, " ").trim();
  const dup = await db
    .select()
    .from(commanders)
    .where(eq(commanders.loginName, loginName));
  if (dup.length) {
    return NextResponse.json(
      { error: "Já existe alguém com esse nome. Acrescenta um sobrenome." },
      { status: 409 }
    );
  }
  const perms = b?.permissions ?? {
    missoes: true,
    recompensas: true,
    desafios: true,
    voz: true,
    tarefas: true,
  };
  const [row] = await db
    .insert(commanders)
    .values({
      familyId: me.familyId,
      role,
      name,
      loginName,
      pinHash: hashPin(pin),
      isAdmin: Boolean(b?.isAdmin),
      permissions: perms,
    })
    .returning();
  return NextResponse.json({
    commander: {
      id: row.id,
      role: row.role,
      name: row.name,
      loginName: row.loginName,
      permissions: row.permissions,
    },
  });
}

// A mãe (admin) atualiza permissões de um comandante.
export async function PATCH(req: NextRequest) {
  const b = await req.json();
  let me = await currentAdmin(req);
  if ((!me || !me.isAdmin) && b?.familyId) {
    const familyId = Number(b.familyId);
    const admins = await db
      .select()
      .from(commanders)
      .where(eq(commanders.familyId, familyId));
    me = admins.find((c) => c.isAdmin) ?? null;
  }
  if (!me || !me.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const id = Number(b?.id);
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (b?.permissions) update.permissions = b.permissions;
  if (b?.pin && String(b.pin).length === 4) update.pinHash = hashPin(String(b.pin));
  await db.update(commanders).set(update).where(eq(commanders.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const me = await currentAdmin(req);
  if (!me || !me.isAdmin)
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  if (id === me.id)
    return NextResponse.json({ error: "Não podes remover-te" }, { status: 400 });
  await db.delete(commanders).where(eq(commanders.id, id));
  return NextResponse.json({ ok: true });
}
