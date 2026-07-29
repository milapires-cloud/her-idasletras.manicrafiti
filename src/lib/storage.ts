// Guarda id do herói ativo + backup local de XP para nunca perder progresso.
export const ACTIVE_KEY = "manicrafiti:activeHeroId";
const XP_KEY = "manicrafiti:xpBackup";

export function getActiveHeroId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(ACTIVE_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}
export function setActiveHeroId(id: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_KEY, String(id));
  } catch {
    /* noop */
  }
}
export function clearActiveHero() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* noop */
  }
}

// Backup de progresso por herói — usado se a rede falhar.
type XpBackup = Record<string, { xp: number; gems: number; currentDay: number; ts: number }>;
function readBackup(): XpBackup {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(XP_KEY) || "{}");
  } catch {
    return {};
  }
}
export function saveXpBackup(heroId: number, data: { xp: number; gems: number; currentDay: number }) {
  if (typeof window === "undefined") return;
  const all = readBackup();
  all[String(heroId)] = { ...data, ts: Date.now() };
  try {
    localStorage.setItem(XP_KEY, JSON.stringify(all));
  } catch {
    /* noop */
  }
}
export function loadXpBackup(heroId: number) {
  const all = readBackup();
  return all[String(heroId)] || null;
}
