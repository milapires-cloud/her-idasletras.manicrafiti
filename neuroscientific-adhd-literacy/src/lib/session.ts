"use client";
// SESSÃO ROBUSTA — à prova de falhas de rede.
// Regra de ouro: NUNCA derrubar a sessão por causa de um erro de rede
// ou de um servidor temporariamente lento. Só desloga se o utilizador
// carregar em "Sair" ou o servidor disser explicitamente que o token
// não existe.

export type Commander = {
  id: number;
  name: string;
  role: string;
  isAdmin: boolean;
  familyId: number;
};
export type Family = { id: number; name: string; joinCode: string };

const TOKEN_KEY = "manicrafiti:token";
const FAMILY_KEY = "manicrafiti:familyId";
const CMD_KEY = "manicrafiti:commander";

function safeGet(k: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(k) || "";
  } catch {
    return "";
  }
}
function safeSet(k: string, v: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(k, v);
  } catch {
    /* noop */
  }
}

export function getToken(): string {
  return safeGet(TOKEN_KEY);
}
export function setToken(t: string) {
  safeSet(TOKEN_KEY, t);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CMD_KEY);
    localStorage.removeItem(FAMILY_KEY);
  } catch {
    /* noop */
  }
}
export function getFamilyId(): number | null {
  const v = safeGet(FAMILY_KEY);
  return v ? Number(v) : null;
}
export function setFamilyId(id: number) {
  safeSet(FAMILY_KEY, String(id));
}

export function saveCommander(c: Commander) {
  safeSet(CMD_KEY, JSON.stringify(c));
  setFamilyId(c.familyId);
}
export function loadLocalCommander(): Commander | null {
  const v = safeGet(CMD_KEY);
  if (!v) return null;
  try {
    return JSON.parse(v) as Commander;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  try {
    const res = await fetch(path, {
      method: opts.method || "GET",
      headers: {
        "content-type": "application/json",
        "x-session": getToken(),
        "x-family-id": String(getFamilyId() ?? ""),
        "x-local-admin": loadLocalCommander()?.isAdmin ? "true" : "false",
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      data = {} as T;
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T };
  }
}

// Tenta confirmar a sessão no servidor, mas se a rede falhar NÃO mata
// a sessão local. Só devolve null se o servidor confirmar que o token é
// inválido (resposta 200 com commander null).
export async function loadSession(): Promise<{
  commander: Commander | null;
  family: Family | null;
}> {
  const local = loadLocalCommander();
  const token = getToken();
  if (!token) return { commander: null, family: null };

  const { ok, status, data } = await api<{
    commander: Commander | null;
    family: Family | null;
  }>("/api/auth/session");

  // rede falhou ou servidor indisponível → mantém sessão local
  if (status === 0 || !ok) {
    if (local) return { commander: local, family: null };
    return { commander: null, family: null };
  }

  // servidor confirmou: token inválido
  if (!data.commander) {
    return { commander: null, family: null };
  }

  // sessão válida: actualiza local
  saveCommander(data.commander);
  if (data.family) setFamilyId(data.family.id);
  return { commander: data.commander, family: data.family ?? null };
}
