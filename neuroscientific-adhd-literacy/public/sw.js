// Service worker MÍNIMO e SEGURO.
// Objetivo: permitir instalar como app SEM causar recarregamentos em loop.
// Regras de ouro:
//  - NUNCA fazer cache de HTML de páginas (evita "voltar pro início").
//  - NUNCA tocar nos assets do Next (/_next/, HMR) — deixa a rede cuidar.
//  - APIs sempre pela rede (dados sempre frescos).
//  - Só guarda ícones/manifest para o app abrir offline.
const CACHE_NAME = "manicrafiti-v3";
const ESSENTIALS = ["/manifest.webmanifest", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ESSENTIALS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Deixa o Next.js e o HMR totalmente em paz (evita telas em branco / reloads).
  if (url.pathname.startsWith("/_next/")) return;

  // APIs: sempre rede, sem cache (dados de contas/progresso sempre atuais).
  if (url.pathname.startsWith("/api/")) return;

  // Navegação (HTML): SEMPRE rede. Sem cache de páginas para nunca
  // "voltar pro início" com uma versão antiga.
  if (req.mode === "navigate") return;

  // Só ícones e manifest ficam em cache (cache-first) para abrir como app.
  if (ESSENTIALS.includes(url.pathname)) {
    event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
  }
});
