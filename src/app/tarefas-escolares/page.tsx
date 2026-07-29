"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import McButton from "@/components/McButton";
import { useHeroes, HeroTabs, PageShell, EmptyHeroes } from "@/components/HeroPicker";

type Task = {
  id: number;
  subject: string;
  title: string;
  dueDate: string;
  reward: number;
  done: boolean;
  photoUrl: string;
};

const SUBJECTS = ["Português", "Matemática", "Ciências", "Artes", "Outro"];

export default function TarefasEscolares() {
  const { heroes, sel, setSel, loading } = useHeroes();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Português");
  const [dueDate, setDueDate] = useState("");
  const [reward, setReward] = useState(150);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadFor, setUploadFor] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!sel) return;
    const d = await fetch(`/api/school-tasks?heroId=${sel.id}`).then((r) => r.json());
    setTasks(d.tasks ?? []);
  }, [sel]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!sel || !title.trim()) return;
    await fetch("/api/school-tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ heroId: sel.id, title, subject, dueDate, reward }),
    });
    setTitle("");
    load();
  };

  const complete = async (id: number) => {
    await fetch("/api/school-tasks", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, done: true }),
    });
    load();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !uploadFor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        const scale = Math.min(1, 640 / img.width);
        const c = document.createElement("canvas");
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        await fetch("/api/school-tasks", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id: uploadFor,
            photoUrl: c.toDataURL("image/jpeg", 0.8),
          }),
        });
        setUploadFor(null);
        load();
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  };

  if (loading) return <PageShell title="🎒 TAREFAS DA ESCOLA">Carregando…</PageShell>;
  if (!sel)
    return (
      <PageShell title="🎒 TAREFAS DA ESCOLA">
        <EmptyHeroes />
      </PageShell>
    );

  return (
    <PageShell title="🎒 TAREFAS DA ESCOLA">
      <HeroTabs heroes={heroes} sel={sel} onSelect={setSel} />

      <div className="mc-panel p-4 space-y-2 mb-4">
        <div className="text-[11px] uppercase tracking-widest">
          + Lançar tarefa escolar
        </div>
        <p className="text-[9px] opacity-80">
          A tarefa aparece no jogo como “Missão da Escola”. Ele tira foto do
          caderno para provar que fez.
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Copiar as vogais 5 vezes"
          className="w-full mc-block bg-white text-black p-2 text-xs outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`mc-btn px-2 py-1 text-[9px] ${subject === s ? "bg-[#4fd0e0] text-black" : "bg-[#8b8b8b]"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mc-block bg-white text-black p-2 text-[10px] outline-none"
          />
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="mc-block bg-white text-black p-2 text-xs w-20 outline-none"
          />
          <McButton color="grass" onClick={add} className="flex-1">
            CRIAR
          </McButton>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />

      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="mc-block bg-black/30 p-4 text-center text-[10px]">
            Nenhuma tarefa escolar ainda.
          </div>
        )}
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`mc-block p-3 ${t.done ? "bg-[#5aab3a]" : "bg-[#a06b3a]"}`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="text-[11px] font-bold">{t.title}</div>
                <div className="text-[9px] opacity-80">
                  {t.subject} · +{t.reward} XP
                  {t.dueDate && ` · entrega ${t.dueDate}`}
                </div>
              </div>
              <div className="flex gap-1">
                <McButton
                  color="gold"
                  size="sm"
                  onClick={() => {
                    setUploadFor(t.id);
                    setTimeout(() => fileRef.current?.click(), 50);
                  }}
                >
                  📷
                </McButton>
                {!t.done && (
                  <McButton color="grass" size="sm" onClick={() => complete(t.id)}>
                    ✓
                  </McButton>
                )}
                <McButton
                  color="red"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/school-tasks?id=${t.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  🗑
                </McButton>
              </div>
            </div>
            {t.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.photoUrl}
                alt={t.title}
                className="mt-2 w-full max-h-48 object-contain bg-white mc-block"
              />
            )}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
