import { useState } from "react";
import type { VoteValue } from "../types";
import { cn } from "../lib/utils";

const VOTE_OPTIONS: {
  value: VoteValue;
  label: string;
  shortLabel: string;
  hint: string;
  active: string;
  idle: string;
}[] = [
  {
    value: 1,
    label: "За",
    shortLabel: "За",
    hint: "+1 к рейтингу",
    active: "bg-emerald-600 text-white shadow-sm",
    idle: "text-emerald-800 hover:bg-emerald-50",
  },
  {
    value: 0,
    label: "Воздержаться",
    shortLabel: "Воздерж.",
    hint: "без изменений",
    active: "bg-slate-600 text-white shadow-sm",
    idle: "text-slate-700 hover:bg-slate-100",
  },
  {
    value: -1,
    label: "Против",
    shortLabel: "Против",
    hint: "−1 к рейтингу",
    active: "bg-rose-600 text-white shadow-sm",
    idle: "text-rose-800 hover:bg-rose-50",
  },
];

function voteLabel(value: VoteValue): string {
  return VOTE_OPTIONS.find((o) => o.value === value)?.label ?? "";
}

interface IdeaVotePanelProps {
  ideaId: number;
  voted: boolean;
  myVote?: VoteValue | null;
  canVote: boolean;
  onVote: (ideaId: number, value: VoteValue) => Promise<void>;
}

export function IdeaVotePanel({ ideaId, voted, myVote, canVote, onVote }: IdeaVotePanelProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleVote(value: VoteValue) {
    if (!canVote || submitting) return;
    setSubmitting(true);
    try {
      await onVote(ideaId, value);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">
          {voted ? "Ваш голос учтён" : "Как вы оцениваете инициативу?"}
        </p>
        {submitting && <span className="text-xs text-slate-400 animate-pulse">Сохранение…</span>}
      </div>

      <div
        className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/60 p-1"
        role="group"
        aria-label="Варианты голосования"
      >
        {VOTE_OPTIONS.map((option) => {
          const isSelected = voted && myVote === option.value;
          const disabled = !canVote || submitting || voted;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              title={option.hint}
              onClick={() => handleVote(option.value)}
              className={cn(
                "rounded-md px-2 py-2.5 text-center transition-all duration-200",
                disabled && !isSelected && "cursor-not-allowed opacity-40",
                isSelected ? option.active : cn("bg-white", option.idle),
                canVote && !submitting && !voted && "hover:shadow-sm",
              )}
            >
              <span className="block text-sm font-semibold sm:hidden">{option.shortLabel}</span>
              <span className="hidden text-sm font-semibold sm:block">{option.label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[10px] leading-tight sm:text-xs",
                  isSelected ? "text-white/75" : "text-slate-400",
                )}
              >
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>

      {voted && myVote != null && (
        <p className="mt-3 text-center text-xs text-slate-500">
          Вы проголосовали: <span className="font-semibold text-indigo-600">{voteLabel(myVote)}</span>
        </p>
      )}
    </div>
  );
}
