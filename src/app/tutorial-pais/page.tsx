"use client";
import Link from "next/link";
import McButton from "@/components/McButton";
import { PageShell } from "@/components/HeroPicker";

// GUIA PARA OS PAIS — fundamentado, prático, sem enrolação.
const SECTIONS = [
  {
    icon: "🧬",
    title: "A ciência por trás disto",
    body: [
      "O plano segue a PNA (Política Nacional de Alfabetização) e o Relatório Nacional de Alfabetização Baseada em Evidências: consciência fonêmica, instrução fônica sistemática, fluência, vocabulário, compreensão e escrita.",
      "O National Reading Panel (2000) e o Rose Review (2006) mostraram que a fônica SISTEMÁTICA supera todos os outros métodos — e o ganho é maior justamente em crianças de risco, como as com TDAH.",
      "Regra de ouro deste app: nenhuma palavra aparece antes de todas as suas letras terem sido ensinadas. Ele nunca adivinha pela imagem — ele DECODIFICA. É isso que separa leitura real de faz-de-conta.",
    ],
  },
  {
    icon: "⏱️",
    title: "Como usar no dia a dia",
    body: [
      "10 a 15 minutos por dia, sempre à mesma hora. Melhor todos os dias curtinho do que uma hora ao sábado — a memória consolida com prática distribuída.",
      "Fique ao lado nos primeiros dias. A sua presença vale mais que qualquer recompensa digital.",
      "Se ele estiver muito agitado, deixe-o de pé, saltar, gritar os sons. O movimento AJUDA o cérebro com TDAH a fixar — não atrapalha.",
    ],
  },
  {
    icon: "🚦",
    title: "O sistema não deixa avançar sem domínio",
    body: [
      "Cada dia só é dado como vencido com 80% de acerto e no mínimo 8 tentativas. Se não atingir, o dia repete.",
      "Isso é intencional: chama-se aprendizagem até ao domínio. Avançar sem base cria buracos que aparecem anos depois.",
      "Se ele repetir o mesmo dia 3 vezes, reduza a sessão para 5 minutos e faça o exercício em papel com ele.",
    ],
  },
  {
    icon: "📵",
    title: "Como converter o vício em ecrã",
    body: [
      "Não proíba de repente — troque a moeda. A TV e o telemóvel passam a ser CONQUISTA, não direito adquirido.",
      "Crie a missão “Ficar só 30 min de TV hoje” no painel. Quando ele cumprir, confirme — ele recebe XP no jogo.",
      "Nunca use o app como castigo. Se virar obrigação punitiva, perde o efeito de dopamina positiva.",
    ],
  },
  {
    icon: "🗣️",
    title: "Como corrigir sem magoar",
    body: [
      "Nunca diga “está errado”. Diga o som certo e peça para ele repetir: “é MÁ — diz comigo, MÁ”.",
      "Espere 3 segundos antes de ajudar. O cérebro precisa desse tempo para recuperar a informação.",
      "Elogie o ESFORÇO, não a inteligência: “trabalhaste bem” em vez de “és tão inteligente”.",
    ],
  },
  {
    icon: "💗",
    title: "O diário emocional e os desabafos",
    body: [
      "O mascote pergunta todos os dias como ele se sente, como foi a escola e se algo o deixou triste ou com medo.",
      "Uma criança de 6 anos NÃO deve ter segredos com uma máquina. Por isso o mascote diz-lhe abertamente que vai contar à mãe — para ela poder ajudar.",
      "Os desabafos aparecem no painel da Mãe. Palavras sensíveis (medo, tristeza, agressão) são sinalizadas no topo.",
    ],
  },
  {
    icon: "🎙️",
    title: "Grave mensagens de voz",
    body: [
      "Em Configuração de Missões → Mensagem de Voz, grave um áudio seu.",
      "Ele aparece como baú-surpresa quando a criança começa a missão.",
      "Nada — nenhuma recompensa digital — supera ouvir a mãe ou o pai a dizer “estou orgulhoso de ti”.",
    ],
  },
];

export default function TutorialPais() {
  return (
    <PageShell title="📚 GUIA DOS COMANDANTES">
      <div className="mc-panel p-4 mb-4">
        <div className="text-[11px] leading-relaxed">
          Este app não é um jogo com verniz educativo. É um programa de
          alfabetização fônica sistemática, desenhado para 15 dias, embrulhado
          em mecânicas de jogo para vencer a resistência do TDAH.
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="mc-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[11px] font-bold uppercase">{s.title}</span>
            </div>
            <ul className="space-y-2">
              {s.body.map((b, i) => (
                <li key={i} className="text-[10px] leading-relaxed opacity-95">
                  • {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mc-block bg-[#c0392b] p-4 mt-4">
        <div className="text-[11px] font-bold mb-2">⚠️ O QUE NÃO FAZER</div>
        <ul className="text-[10px] space-y-1 leading-relaxed">
          <li>• Não force sessões longas — 15 min é o teto para 6 anos com TDAH.</li>
          <li>• Não compare com irmãos ou colegas na frente dele.</li>
          <li>• Não pule dias do currículo, mesmo que pareça fácil.</li>
          <li>• Não use o telemóvel como recompensa por ter jogado — seria trocar um vício por outro.</li>
        </ul>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <Link href="/configuracao-missoes">
          <McButton color="grass">🎯 CRIAR MISSÕES</McButton>
        </Link>
        <Link href="/painel">
          <McButton color="gold">📊 VER PROGRESSO</McButton>
        </Link>
      </div>
    </PageShell>
  );
}
