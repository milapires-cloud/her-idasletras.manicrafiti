import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, dayProgress, heroes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { computeAccuracy, isMastered } from "@/lib/curriculum";

// Grava uma tentativa granular e — se for a última do dia — consolida.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  const day = Number(body?.day);
  const phase = String(body?.phase ?? "discovery");
  const target = String(body?.target ?? "").toUpperCase();
  const correct = Boolean(body?.correct);
  const responseMs = Number(body?.responseMs ?? 0);
  if (!heroId || !day || !target) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  await db.insert(attempts).values({
    heroId,
    day,
    phase,
    target,
    correct,
    responseMs,
  });
  return NextResponse.json({ ok: true });
}

// Fecha o dia: calcula accuracy, decide se avança e concede XP.
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const heroId = Number(body?.heroId);
  const day = Number(body?.day);
  const xpEarned = Number(body?.xpEarned ?? 0);
  if (!heroId || !day) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(attempts)
    .where(and(eq(attempts.heroId, heroId), eq(attempts.day, day)));
  const acc = computeAccuracy(rows);
  const mastered = isMastered(acc, rows.length);

  // upsert dayProgress
  const existing = await db
    .select()
    .from(dayProgress)
    .where(and(eq(dayProgress.heroId, heroId), eq(dayProgress.day, day)));
  if (existing.length > 0) {
    await db
      .update(dayProgress)
      .set({
        accuracy: acc,
        completed: mastered,
        xpEarned,
        completedAt: mastered ? new Date() : null,
      })
      .where(eq(dayProgress.id, existing[0].id));
  } else {
    await db.insert(dayProgress).values({
      heroId,
      day,
      accuracy: acc,
      completed: mastered,
      xpEarned,
      completedAt: mastered ? new Date() : null,
    });
  }

  // Se dominou, avança o currentDay. Se não, mantém no mesmo dia.
  const [hero] = await db.select().from(heroes).where(eq(heroes.id, heroId));
  let armorUp = false;
  if (hero) {
    const nextDay = mastered ? Math.min(hero.currentDay + 1, 15) : hero.currentDay;
    const newXp = hero.xp + xpEarned;
    // Armadura sobe por marcos de XP: 400, 1200, 2500, 4500, 7000
    const TIERS = [0, 400, 1200, 2500, 4500, 7000];
    let newTier = 0;
    for (let t = 0; t < TIERS.length; t++) if (newXp >= TIERS[t]) newTier = t;
    armorUp = newTier > hero.armorTier;
    await db
      .update(heroes)
      .set({
        xp: newXp,
        gems: hero.gems + (mastered ? 20 : 5),
        streak: mastered ? hero.streak + 1 : hero.streak,
        currentDay: nextDay,
        armorTier: newTier,
        updatedAt: new Date(),
      })
      .where(eq(heroes.id, heroId));
  }

  return NextResponse.json({
    accuracy: acc,
    mastered,
    totalAttempts: rows.length,
    armorUp,
  });
}
