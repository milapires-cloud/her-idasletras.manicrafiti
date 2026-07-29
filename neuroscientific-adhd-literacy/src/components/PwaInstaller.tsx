"use client";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function PwaInstaller() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    if ("serviceWorker" in navigator) {
      const host = window.location.hostname;
      // No preview do v0 (vusercontent.net) NÃO registamos o SW: ele
      // conflita com o HMR e faz a página recarregar em loop.
      const isPreview = /vusercontent\.net$/.test(host);

      if (isPreview) {
        // Limpa qualquer SW/cache antigo que tenha ficado gravado no aparelho
        // e estava a causar o "voltar sempre pro início".
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {});
        if ("caches" in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
        }
      } else {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("/sw.js").catch(() => {
            // Se o navegador bloquear, o app continua funcionando normal.
          });
        });
      }
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!isStandalone()) setShow(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShow(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !show || !deferred) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[120] mc-block bg-[#0f0620] text-white p-3 flex items-center gap-3 shadow-2xl">
      <div className="text-3xl">📱</div>
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase">Instalar no celular</div>
        <div className="text-[8px] opacity-80 mt-1">
          Abre direto como app, sem Arena e sem navegador.
        </div>
      </div>
      <button
        className="mc-btn bg-[#5aab3a] px-3 py-2 text-[9px]"
        onClick={async () => {
          await deferred.prompt();
          const choice = await deferred.userChoice;
          if (choice.outcome === "accepted") {
            setInstalled(true);
            setShow(false);
          }
          setDeferred(null);
        }}
      >
        INSTALAR
      </button>
      <button className="text-[10px] px-2" onClick={() => setShow(false)}>
        ✕
      </button>
    </div>
  );
}
