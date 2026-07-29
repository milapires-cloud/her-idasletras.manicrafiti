import Link from "next/link";
import McTitle from "@/components/McTitle";

const MAIN = [
  { href: "/jogar", icon: "🎮", title: "JOGAR", sub: "Entrar na Missão" },
  { href: "/mae", icon: "👑", title: "MÃE", sub: "Comandante Admin" },
  { href: "/pai", icon: "🛡️", title: "COMANDANTE", sub: "Pai · Padrinhos" },
];

// Áreas da CRIANÇA — nada de pais aqui. Tudo narrado por voz.
const KID = [
  { href: "/tutorial-jogador", icon: "🎓", title: "Como Jogar" },
  { href: "/perfil-heroi", icon: "🦸", title: "Meu Herói" },
  { href: "/mapa-conquistas", icon: "🗺️", title: "Mapa" },
  { href: "/arvore-habilidades", icon: "🌳", title: "Habilidades" },
  { href: "/galeria-herois", icon: "🖼️", title: "Galeria" },
  { href: "/loja-recompensas", icon: "🎁", title: "Loja" },
  { href: "/inventario", icon: "🎒", title: "Inventário" },
  { href: "/centro-treinamento", icon: "⛏️", title: "Treino" },
  { href: "/biblioteca-som", icon: "🎧", title: "Sons" },
  { href: "/desafios-relampago", icon: "⚡", title: "Relâmpago" },
  { href: "/duelo-rapido", icon: "⚔️", title: "Duelo" },
  { href: "/desafio-pais", icon: "📣", title: "Desafia os Pais" },
  { href: "/calendario-presenca", icon: "📅", title: "Calendário" },
  { href: "/ranking", icon: "🏆", title: "Ranking" },
  { href: "/painel-humor", icon: "😊", title: "Meu Humor" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen mc-sky pb-12">
      <div className="relative h-28 overflow-hidden">
        <div className="absolute top-4 left-8 flex gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-white mc-block" />
          ))}
        </div>
        <div className="absolute top-5 right-8 w-12 h-12 mc-block bg-[#f5c518]" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-14 mc-block bg-[#5aab3a] flex flex-col">
          <div className="h-1/3 bg-[#7ac74f] mc-block" />
          <div className="h-2/3 bg-[#7a5230]" />
        </div>
      </div>

      <div className="text-center px-4">
        <McTitle size="xl">MANICRAFITI</McTitle>
        <p className="mt-3 text-[10px] tracking-widest uppercase">
          Minera Letras · Junta Sons · Vence os Monstros
        </p>
        <p className="mt-2 text-[8px] opacity-80">
          Alfabetização fônica em 15 dias · Método baseado em evidências
        </p>
      </div>

      <div className="max-w-2xl mx-auto mt-7 grid grid-cols-3 gap-3 px-4">
        {MAIN.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="mc-btn bg-[#8b8b8b] p-5 text-center flex flex-col items-center gap-1 hover:brightness-110"
          >
            <div className="text-3xl">{t.icon}</div>
            <div className="font-bold text-xs">{t.title}</div>
            <div className="text-[8px] opacity-90">{t.sub}</div>
          </Link>
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-4 px-4">
        <Link
          href="/instalar"
          className="mc-btn bg-[#5aab3a] p-4 text-center flex items-center justify-center gap-3 hover:brightness-110"
        >
          <span className="text-3xl">📱</span>
          <span className="text-left">
            <span className="block text-[11px] font-bold">INSTALAR NO CELULAR</span>
            <span className="block text-[8px] opacity-90">Abrir sem Arena, como app</span>
          </span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto mt-8 px-4">
        <div className="text-center text-[10px] tracking-widest uppercase mb-3">
          ▬▬ MUNDO DO HERÓI ▬▬
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {KID.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="mc-btn bg-[#a06b3a] p-3 text-center flex flex-col items-center gap-1 hover:brightness-110"
            >
              <div className="text-2xl">{t.icon}</div>
              <div className="text-[8px] leading-tight">{t.title}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center mt-8 text-[9px] opacity-80 px-4">
        Os pais entram por 👑 MÃE ou 🛡 COMANDANTE.
        <br />
        <span className="text-[8px] opacity-70">
          Progresso, missões e relatórios ficam na Área dos Comandantes.
        </span>
      </div>
    </main>
  );
}
