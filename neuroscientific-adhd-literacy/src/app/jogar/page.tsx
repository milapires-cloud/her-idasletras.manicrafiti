"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import HeroSelect from "@/components/game/HeroSelect";
import EmotionalCheckin from "@/components/game/EmotionalCheckin";
import PhaseIntro from "@/components/game/PhaseIntro";
import PhonemicPhase from "@/components/game/PhonemicPhase";
import VowelAdventure from "@/components/game/VowelAdventure";
import Discovery from "@/components/game/Discovery";
import MonsterBattle from "@/components/game/MonsterBattle";
import ReadingPhase from "@/components/game/ReadingPhase";
import Writing from "@/components/game/Writing";
import Victory from "@/components/game/Victory";
import VoiceSurprise from "@/components/game/VoiceSurprise";
import { getDay } from "@/lib/curriculum";
import { monsterForDay } from "@/lib/monsters";
import { getActiveHeroId } from "@/lib/storage";

type Hero = {
  id: number;
  name: string;
  age: number;
  xp: number;
  currentDay: number;
  isTest: boolean;
};

// Fluxo: cada fase tem uma tela de EXPLICAÇÃO ("intro") antes.
type Stage =
  | "select"
  | "checkin"
  | "intro-phon" | "phonemic"
  | "intro-disc" | "discovery"
  | "intro-battle" | "battle"
  | "intro-read" | "reading"
  | "intro-write" | "writing"
  | "victory";

function GameInner() {
  const params = useSearchParams();
  const router = useRouter();
  const forceTest = params.get("teste") === "1";
  const heroQuery = Number(params.get("hero") || 0);
  const [hero, setHero] = useState<Hero | null>(null);
  const [stage, setStage] = useState<Stage>("select");
  const [surpriseDone, setSurpriseDone] = useState(false);

  useEffect(() => {
    // Prioridade: ?hero=ID na URL > localStorage.
    const id = heroQuery || getActiveHeroId();
    if (!id) return;
    fetch(`/api/heroes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hero) {
          try {
            localStorage.setItem("manicrafiti:activeHeroId", String(d.hero.id));
          } catch { /* noop */ }
          setHero(d.hero);
          setStage("checkin");
        }
      })
      .catch(() => {});
  }, [forceTest, heroQuery]);

  const finishSurprise = useCallback(() => setSurpriseDone(true), []);

  if (!hero) {
    return (
      <HeroSelect
        forceTest={forceTest}
        onPick={(h) => {
          setHero(h as Hero);
          setStage("checkin");
        }}
      />
    );
  }

  const plan = getDay(hero.currentDay);
  const boss = monsterForDay(plan.day);
  const isDay1 = plan.day === 1;

  return (
    <div>
      {!surpriseDone && (
        <VoiceSurprise heroId={hero.id} onDone={finishSurprise} />
      )}

      {stage === "checkin" && (
        <EmotionalCheckin hero={hero} onDone={() => setStage("intro-phon")} />
      )}

      {stage === "intro-phon" && (
        <PhaseIntro
          title={isDay1 ? "Aventura das Vogais" : "Ouvido de Herói"}
          emoji={isDay1 ? "🗺️" : "👂"}
          color="#1b4332"
          mood="epic"
          narration={
            isDay1
              ? `${hero.name}! Cinco portais mágicos! Cinco vogais! Cinco monstros! Fala cada vogal bem alto pra abrir os portais!`
              : "Vamos treinar o teu ouvido de herói! Eu falo um som, tu respondes falando. Ouvido de herói vence qualquer palavra!"
          }
          onStart={() => setStage("phonemic")}
        />
      )}

      {stage === "phonemic" &&
        (isDay1 ? (
          <VowelAdventure hero={hero} onDone={() => setStage("intro-battle")} />
        ) : (
          <PhonemicPhase hero={hero} plan={plan} onDone={() => setStage("intro-disc")} />
        ))}

      {stage === "intro-disc" && (
        <PhaseIntro
          title="Mineração das Letras"
          emoji="⛏️"
          color="#5aab3a"
          mood="story"
          narration={`Agora vamos MINERAR! Bate no bloco de pedra até partir e descobrir a letra escondida. Depois diz o som dela alto!`}
          onStart={() => setStage("discovery")}
        />
      )}
      {stage === "discovery" && (
        <Discovery hero={hero} plan={plan} onDone={() => setStage("intro-battle")} />
      )}

      {stage === "intro-battle" && (
        <PhaseIntro
          title={`Boss: ${boss.name}`}
          emoji={boss.emoji}
          color={boss.color}
          mood="boss"
          narration={`Cuidado! O ${boss.name} apareceu! Lê cada palavra em VOZ ALTA pra atacar com fogo. Cada palavra certa tira uma vida do monstro!`}
          buttonLabel="LUTAR!"
          onStart={() => setStage("battle")}
        />
      )}
      {stage === "battle" && (
        <MonsterBattle hero={hero} plan={plan} onDone={() => setStage("intro-read")} />
      )}

      {stage === "intro-read" && (
        <PhaseIntro
          title="Ler de Verdade"
          emoji="📖"
          color="#a06b3a"
          mood="cheer"
          narration="Já és leitor! Cada palavra na frente usa só letras que TU já aprendeste. Não adivinha — DECODIFICA, som a som!"
          onStart={() => setStage("reading")}
        />
      )}
      {stage === "reading" && (
        <ReadingPhase hero={hero} plan={plan} onDone={() => setStage("intro-write")} />
      )}

      {stage === "intro-write" && (
        <PhaseIntro
          title="Mesa de Crafting"
          emoji="✍️"
          color="#7a5230"
          mood="story"
          narration={`Última missão! Escreve ${plan.writingTarget} — com o dedo aqui ou num papel, e tira foto. Os teus comandantes vão VER!`}
          onStart={() => setStage("writing")}
        />
      )}
      {stage === "writing" && (
        <Writing hero={hero} plan={plan} onDone={() => setStage("victory")} />
      )}

      {stage === "victory" && (
        <Victory
          hero={hero}
          plan={plan}
          onReplay={async () => {
            const d = await fetch(`/api/heroes/${hero.id}`).then((r) => r.json());
            if (d.hero) setHero(d.hero);
            setSurpriseDone(false);
            setStage("checkin");
          }}
          onHome={() => router.push("/")}
        />
      )}
    </div>
  );
}

export default function JogarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen mc-sky" />}>
      <GameInner />
    </Suspense>
  );
}
