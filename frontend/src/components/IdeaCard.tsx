import type { Idea, VoteValue } from "../types";
import { cn, getInitials } from "../lib/utils";
import { IdeaVotePanel } from "./IdeaVotePanel";
import { StatusBadge } from "./ui/StatusBadge";

const STATUS_ACCENT: Record<string, string> = {
  Голосование: "border-l-amber-400",
  Реализация: "border-l-sky-500",
  Реализована: "border-l-emerald-500",
  Архив: "border-l-slate-300",
};

interface IdeaCardProps {
  idea: Idea;
  canVote: boolean;
  onVote: (ideaId: number, value: VoteValue) => Promise<void>;
}

function formatRating(rating: number): string {
  if (rating > 0) return `+${rating}`;
  return String(rating);
}

function ratingStyles(rating: number): string {
  if (rating > 0) return "text-emerald-600 bg-emerald-50 ring-emerald-100";
  if (rating < 0) return "text-rose-600 bg-rose-50 ring-rose-100";
  return "text-slate-600 bg-slate-50 ring-slate-100";
}

export function IdeaCard({ idea, canVote, onVote }: IdeaCardProps) {
  const showVoting = idea.status === "Голосование" && canVote;
  const canVoteIdea = showVoting && !idea.voted;
  const accent = STATUS_ACCENT[idea.status] ?? "border-l-slate-300";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        "border-l-4 transition-shadow duration-200 hover:shadow-md",
        accent,
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 sm:flex">
            {getInitials(idea.author)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-medium text-slate-400">#{idea.id}</span>
                  <StatusBadge status={idea.status} />
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {idea.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{idea.title}</h3>
                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-700">{idea.author}</span>
                </p>
              </div>

              <div
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-xl px-4 py-2 ring-1",
                  ratingStyles(idea.rating),
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  Рейтинг
                </span>
                <span className="text-2xl font-bold tabular-nums leading-none">
                  {formatRating(idea.rating)}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{idea.description}</p>

            {showVoting && (
              <IdeaVotePanel
                ideaId={idea.id}
                voted={idea.voted}
                myVote={idea.my_vote}
                canVote={canVoteIdea}
                onVote={onVote}
              />
            )}

            {idea.status === "Голосование" && !canVote && (
              <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                Инициатива на этапе корпоративного голосования. Решение принимает комитет.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
