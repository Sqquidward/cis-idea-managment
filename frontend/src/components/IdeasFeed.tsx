import { useMemo, useState } from "react";
import type { Idea, VoteValue } from "../types";
import { cn } from "../lib/utils";
import { IdeaCard } from "./IdeaCard";
import { EmptyState } from "./ui/EmptyState";

interface IdeasFeedProps {
  ideas: Idea[];
  onVote: (ideaId: number, value: VoteValue) => Promise<void>;
  canVote?: boolean;
}

type StatusFilter = "all" | "Голосование" | "Реализация" | "Реализована" | "Архив";

const FILTER_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "Голосование", label: "Голосование" },
  { id: "Реализация", label: "В реализации" },
  { id: "Реализована", label: "Завершённые" },
  { id: "Архив", label: "Архив" },
];

export function IdeasFeed({ ideas, onVote, canVote = true }: IdeasFeedProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => {
    const voting = ideas.filter((i) => i.status === "Голосование").length;
    const myVotes = canVote ? ideas.filter((i) => i.voted).length : 0;
    const pending = canVote ? ideas.filter((i) => i.status === "Голосование" && !i.voted).length : 0;
    return { total: ideas.length, voting, myVotes, pending };
  }, [ideas, canVote]);

  const filteredIdeas = useMemo(() => {
    const list =
      statusFilter === "all" ? [...ideas] : ideas.filter((i) => i.status === statusFilter);
    return list.sort((a, b) => b.id - a.id);
  }, [ideas, statusFilter]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm leading-relaxed text-slate-600">
          {canVote
            ? "Просматривайте инициативы коллег и проголосуйте один раз: за, против или воздержитесь."
            : "Обзор всех инициатив и их рейтингов. Утверждение — в панели комитета."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Всего идей" value={stats.total} />
          <StatCard label="На голосовании" value={stats.voting} accent="amber" />
          {canVote ? (
            <>
              <StatCard label="Ждут вашего голоса" value={stats.pending} accent="indigo" />
              <StatCard label="Вы проголосовали" value={stats.myVotes} accent="emerald" />
            </>
          ) : (
            <>
              <StatCard
                label="В реализации"
                value={ideas.filter((i) => i.status === "Реализация").length}
                accent="sky"
              />
              <StatCard
                label="Завершено"
                value={ideas.filter((i) => i.status === "Реализована").length}
                accent="emerald"
              />
            </>
          )}
        </div>
      </div>

      {ideas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => {
            const count =
              opt.id === "all" ? ideas.length : ideas.filter((i) => i.status === opt.id).length;
            if (opt.id !== "all" && count === 0) return null;
            const active = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                    active ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {ideas.length === 0 ? (
        <EmptyState
          title="Лента пока пуста"
          description={
            canVote ? "Создайте первую идею на вкладке «Новая идея»" : "Идеи появятся после подачи сотрудниками"
          }
        />
      ) : filteredIdeas.length === 0 ? (
        <EmptyState
          title="Нет идей в этой категории"
          description="Выберите другой фильтр или сбросьте «Все»"
        />
      ) : (
        <ul className="space-y-4">
          {filteredIdeas.map((idea) => (
            <li key={idea.id} className="animate-fade-in">
              <IdeaCard idea={idea} canVote={canVote} onVote={onVote} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "amber" | "indigo" | "emerald" | "sky";
}) {
  const valueColor = {
    slate: "text-slate-900",
    amber: "text-amber-700",
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    sky: "text-sky-700",
  }[accent];

  return (
    <div className="rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-0.5 text-2xl font-bold tabular-nums", valueColor)}>{value}</p>
    </div>
  );
}
