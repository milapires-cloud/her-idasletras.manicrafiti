import { createHash, randomBytes } from "crypto";

export function hashPin(pin: string): string {
  return createHash("sha256").update(`manicrafiti:${pin}`).digest("hex");
}

export function newToken(): string {
  return randomBytes(24).toString("hex");
}

// Código de família curto e legível (sem caracteres ambíguos).
export function newJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
