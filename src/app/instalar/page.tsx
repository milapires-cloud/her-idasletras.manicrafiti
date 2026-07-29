"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McTitle from "@/components/McTitle";

export default function InstalarPage() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen mc-sky p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4 gap-2">
          <McTitle size="sm">📱 INSTALAR NO CELULAR</McTitle>
          <Link href="/">
            <McButton color="stone" size="sm">← HOME</McButton>
          </Link>
        </div>

        <div className="mc-panel p-4 mb-4 text-center">
          <div className="text-5xl mb-3">📱</div>
          <div className="text-[11px] leading-relaxed">
            Este é o endereço do teu app. Copia e cola no navegador do
            celular para instalar.
          </div>
          <div className="mc-block bg-white text-black p-3 mt-4 text-[9px] break-all">
            {url || "carregando link..."}
          </div>
          <McButton color="gold" className="mt-3" onClick={copy}>
            {copied ? "✔ COPIADO" : "COPIAR LINK"}
          </McButton>
        </div>

        <div className="mc-block bg-[#c0392b] p-4 mb-4 text-[10px] leading-relaxed">
          ⚠️ <b>Aviso importante:</b> este link de pré-visualização do
          Arena (<code>arena.site</code>) SÓ abre quando estás logada na
          conta do Arena (arena.ai). Se abrires fora, aparece “Pré-visualização
          indisponível”. Para instalar de vez e usar no celular do teu filho
          sem depender do Arena, é preciso <b>publicar/exportar o app</b> no
          Arena (Publicar/Deploy). Depois é só instalar pelo endereço público.
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="mc-panel p-4">
            <div className="text-2xl mb-2">🤖</div>
            <div className="text-[11px] font-bold mb-2">ANDROID / CHROME</div>
            <ol className="text-[9px] leading-relaxed space-y-2 list-decimal list-inside">
              <li>Abre o link no Chrome do celular.</li>
              <li>Toca nos três pontinhos ⋮.</li>
              <li>Toca em “Adicionar à tela inicial” ou “Instalar app”.</li>
              <li>Abre pelo ícone MANICRAFITI.</li>
            </ol>
          </div>

          <div className="mc-panel p-4">
            <div className="text-2xl mb-2">🍎</div>
            <div className="text-[11px] font-bold mb-2">IPHONE / SAFARI</div>
            <ol className="text-[9px] leading-relaxed space-y-2 list-decimal list-inside">
              <li>Abre o link no Safari.</li>
              <li>Toca no botão Compartilhar.</li>
              <li>Toca em “Adicionar à Tela de Início”.</li>
              <li>Confirma “Adicionar”.</li>
            </ol>
          </div>
        </div>

        <div className="mc-block bg-[#5a4020] p-4 mt-4 text-[9px] leading-relaxed">
          <b>Importante:</b> se estiveres dentro da Arena, copia o link acima e cola
          diretamente no navegador do celular. Depois instala. Assim o Miguel abre
          como aplicativo, com tela cheia e menos quedas por interface externa.
        </div>
      </div>
    </main>
  );
}
