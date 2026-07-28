import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, dayProgress, diary, heroes, missions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

// Dashboard consolidado do herói para o painel dos pais.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const heroId = Number(searchParams.get("heroId"));
  const role = String(searchParams.get("role") ?? "pai");
  if (!heroId) return NextResponse.json({ error: "heroId" }, { status: 400 });

  const [hero] = await db.select().from(heroes).where(eq(heroes.id, heroId));
  if (!hero) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const progress = await db
    .select()
    .from(dayProgress)
    .where(eq(dayProgress.heroId, heroId));

  const lastAttempts = await db
    .select()
    .from(attempts)
    .where(eq(attempts.heroId, heroId))
    .orderBy(desc(attempts.createdAt))
    .limit(50);

  const heroMissions = await db
    .select()
    .from(missions)
    .where(eq(missions.heroId, heroId))
    .orderBy(desc(missions.createdAt));

  const diaryRows = await db
    .select()
    .from(diary)
    .where(eq(diary.heroId, heroId))
    .orderBy(desc(diary.createdAt));

  // PROTEÇÃO INFANTIL: uma criança de 6 anos não pode manter segredos
  // com uma máquina. O que ela desabafa vai SEMPRE para a mãe (admin),
  // para que ela possa ajudar naquilo que o filho tem dificuldade de
  // expressar. O mascote diz isto à criança de forma transparente:
  // "eu conto à tua mãe para ela te poder ajudar".
  // O pai vê um aviso de que existe um desabafo e deve falar com a mãe.
  const diarySafe = diaryRows.map((d) => ({
    ...d,
    secret:
      role === "mae"
        ? d.secret
        : d.secret
          ? "⚠️ Há um desabafo registado — visível no painel da Mãe"
          : "",
  }));

  // Alerta para a mãe: desabafos com palavras sensíveis vão para o topo.
  const SENSITIVE =
    /(medo|triste|sozinh|bat(eu|er)|mal|dor|chor|bulling|bullying|xing|apanh|zang|ningu[eé]m|odei|machuc|assust)/i;
  const alerts = diaryRows
    .filter((d) => d.secret && SENSITIVE.test(d.secret))
    .map((d) => ({ day: d.day, createdAt: d.createdAt }));

  return NextResponse.json({
    hero,
    progress,
    lastAttempts,
    missions: heroMissions,
    diary: diarySafe,
    alerts,
  });
}
