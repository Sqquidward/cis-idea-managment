import type { Idea } from "../types";
import { cn } from "../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { StatusBadge } from "./ui/StatusBadge";

const PIPELINE_STEPS = [
  { id: "vote", label: "Голосование" },
  { id: "impl", label: "Реализация" },
  { id: "done", label: "Завершена" },
] as const;

function progressState(status: string): {
  stepIndex: number;
  isArchive: boolean;
  hint: string;
} {
  switch (status) {
    case "Голосование":
      return {
        stepIndex: 0,
        isArchive: false,
        hint: "Идея в общей ленте — собираются голоса коллег.",
      };
    case "Реализация":
      return {
        stepIndex: 1,
        isArchive: false,
        hint: "Комитет утвердил идею. Заполните план реализации в соответствующем разделе.",
      };
    case "Реализована":
      return {
        stepIndex: 3,
        isArchive: false,
        hint: "Проект завершён. При необходимости оставьте отзыв о результате.",
      };
    case "Архив":
      return {
        stepIndex: -1,
        isArchive: true,
        hint: "Идея отклонена комитетом и перенесена в архив.",
      };
    default:
      return { stepIndex: 0, isArchive: false, hint: "" };
  }
}

function formatRating(rating: number): string {
  return rating > 0 ? `+${rating}` : String(rating);
}

interface MyIdeasScreenProps {
  ideas: Idea[];
  onGoToPlan?: () => void;
  onGoToFeedback?: () => void;
  onGoToFeed?: () => void;
}

export function MyIdeasScreen({ ideas, onGoToPlan, onGoToFeedback, onGoToFeed }: MyIdeasScreenProps) {
  const sorted = [...ideas].sort((a, b) => b.id - a.id);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Мои идеи"
        description="Все инициативы, которые вы подали, и их текущий этап в жизненном цикле."
        badge={`${sorted.length}`}
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="Вы ещё не подавали идеи"
          description="Создайте первую инициативу в разделе «Новая идея» — она появится здесь с отслеживанием прогресса."
        />
      ) : (
        <ul className="space-y-4">
          {sorted.map((idea) => {
            const { stepIndex, isArchive, hint } = progressState(idea.status);
            const showPlanCta = idea.status === "Реализация" && idea.is_owner;
            const showFeedbackCta = idea.status === "Реализована";

            return (
              <li
                key={idea.id}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">#{idea.id}</span>
                        <StatusBadge status={idea.status} />
                        <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-xs text-slate-600">
                          {idea.type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{idea.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Рейтинг
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold tabular-nums",
                            idea.rating > 0
                              ? "text-emerald-600"
                              : idea.rating < 0
                                ? "text-rose-600"
                                : "text-slate-600",
                          )}
                        >
                          {formatRating(idea.rating)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-4 sm:px-6">
                  <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">{idea.description}</p>

                  {isArchive ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {hint}
                    </div>
                  ) : (
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Прогресс
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {PIPELINE_STEPS.map((step, index) => {
                          const completed = stepIndex > index;
                          const active = stepIndex === index;
                          return (
                            <div key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2">
                              <div className="flex flex-1 flex-col items-center gap-1">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                                    completed && "bg-emerald-500 text-white",
                                    active && "bg-indigo-600 text-white ring-4 ring-indigo-100",
                                    !completed && !active && "bg-slate-200 text-slate-500",
                                  )}
                                >
                                  {completed ? "✓" : index + 1}
                                </div>
                                <span
                                  className={cn(
                                    "hidden text-center text-[10px] font-medium sm:block sm:text-xs",
                                    active ? "text-indigo-700" : "text-slate-500",
                                  )}
                                >
                                  {step.label}
                                </span>
                              </div>
                              {index < PIPELINE_STEPS.length - 1 && (
                                <div
                                  className={cn(
                                    "mb-5 h-0.5 flex-1 rounded-full sm:mb-6",
                                    stepIndex > index ? "bg-emerald-400" : "bg-slate-200",
                                  )}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{hint}</p>
                    </div>
                  )}

                  {idea.plan && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm">
                      <p className="font-medium text-indigo-900">
                        План: дедлайн {idea.plan.deadline}
                      </p>
                      {idea.plan.team.length > 0 && (
                        <p className="mt-1 text-indigo-700">
                          Рабочая группа: {idea.plan.team.map((m) => m.display_name).join(", ")}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {idea.status === "Голосование" && onGoToFeed && (
                      <button type="button" onClick={onGoToFeed} className="btn-secondary !py-2 !text-xs">
                        Перейти в ленту
                      </button>
                    )}
                    {showPlanCta && onGoToPlan && (
                      <button type="button" onClick={onGoToPlan} className="btn-primary !py-2 !text-xs">
                        Составить план
                      </button>
                    )}
                    {showFeedbackCta && onGoToFeedback && (
                      <button type="button" onClick={onGoToFeedback} className="btn-primary !py-2 !text-xs">
                        Оставить отзыв
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
