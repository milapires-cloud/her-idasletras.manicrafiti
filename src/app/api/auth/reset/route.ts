import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  families,
  heroes,
  commanders,
  sessions,
  attempts,
  dayProgress,
  missions,
  diary,
  photos,
  voiceMessages,
  behavior,
  schoolTasks,
  kidChallenges,
  inventory,
  attendance,
} from "@/db/schema";
import { sql } from "drizzle-orm";

// RESET TOTAL — porto de fuga para quando ficas bloqueada.
// Apaga tudo para poderes começar do zero. Protegido por uma palavra-chave
// para não ser accionado por acidente pela criança.
export async function POST(req: Request) {
  let confirm = "";
  try {
    const b = await req.json();
    confirm = String(b?.confirm ?? "");
  } catch {
    /* noop */
  }
  if (confirm !== "APAGAR TUDO") {
    return NextResponse.json(
      { error: "Confirmação inválida" },
      { status: 400 }
    );
  }
  const tables = [
    sessions,
    inventory,
    attendance,
    kidChallenges,
    schoolTasks,
    voiceMessages,
    photos,
    diary,
    missions,
    attempts,
    dayProgress,
    behavior,
    heroes,
    commanders,
    families,
  ];
  for (const t of tables) {
    await db.delete(t);
  }
  await db.execute(sql`ALTER SEQUENCE commanders_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE heroes_id_seq RESTART WITH 1`);
  await db.execute(sql`ALTER SEQUENCE families_id_seq RESTART WITH 1`);
  return NextResponse.json({ ok: true });
}
