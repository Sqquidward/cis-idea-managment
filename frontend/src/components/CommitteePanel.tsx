import type { Idea } from "../types";
import { cn } from "../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";
import { StatusBadge } from "./ui/StatusBadge";

interface CommitteePanelProps {
  ideas: Idea[];
  onStatusChange: (ideaId: number, status: string) => Promise<void>;
}

export function CommitteePanel({ ideas, onStatusChange }: CommitteePanelProps) {
  return (
    <section>
      <PageHeader
        title="Панель комитета"
        description="Рассмотрение идей экспертной группой: утверждение в реализацию или перенос в архив."
        badge="Модерация"
      />

      {ideas.length === 0 ? (
        <EmptyState title="Нет идей для рассмотрения" />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">Название</th>
                  <th className="px-5 py-4">Автор</th>
                  <th className="px-5 py-4">Рейтинг</th>
                  <th className="px-5 py-4">Статус</th>
                  <th className="px-5 py-4 text-center">Решение</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ideas.map((idea) => (
                  <tr key={idea.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono text-xs font-medium text-slate-400">
                      #{idea.id}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">{idea.title}</td>
                    <td className="px-5 py-4 text-slate-500">{idea.author}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "font-semibold",
                          idea.rating >= 0 ? "text-emerald-600" : "text-rose-500",
                        )}
                      >
                        {idea.rating >= 0 ? `+${idea.rating}` : idea.rating}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={idea.status} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {idea.status === "Голосование" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStatusChange(idea.id, "Реализация")}
                            className="btn-success !px-3 !py-1.5 !text-xs"
                          >
                            Утвердить
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusChange(idea.id, "Архив")}
                            className="btn-danger"
                          >
                            В архив
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400">Решение вынесено</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {ideas.map((idea) => (
              <div key={idea.id} className="card !p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono text-slate-400">#{idea.id}</span>
                    <h3 className="mt-0.5 font-semibold text-slate-900">{idea.title}</h3>
                    <p className="text-sm text-slate-500">{idea.author}</p>
                  </div>
                  <StatusBadge status={idea.status} />
                </div>
                <p className="mb-4 text-sm">
                  Рейтинг:{" "}
                  <span className={idea.rating >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-rose-500"}>
                    {idea.rating >= 0 ? `+${idea.rating}` : idea.rating}
                  </span>
                </p>
                {idea.status === "Голосование" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(idea.id, "Реализация")}
                      className="btn-success flex-1 !py-2"
                    >
                      Утвердить
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(idea.id, "Архив")}
                      className="btn-danger flex-1 !py-2"
                    >
                      В архив
                    </button>
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">Решение уже вынесено</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
