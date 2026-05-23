import { useState, type FC } from "react";
import type { VoteValue } from "../types";
import { cn } from "../lib/utils";

type VoteOption = {
  value: VoteValue;
  label: string;
  delta: string;
  icon: FC<{ className?: string }>;
  cardIdle: string;
  cardHover: string;
  cardActive: string;
  iconIdle: string;
  iconActive: string;
};

function IconThumbUp({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.633 10.25c.806 0 1.533-.304 2.08-.803l3.7-3.438 2.001 1.95c.698.68.698 1.78 0 2.46l-5.52 5.39c-.698.68-1.83.68-2.528 0l-2.47-2.41a2.25 2.25 0 010-3.18l.88-.86M12.75 4.5l.879.86a2.25 2.25 0 010 3.18l-.88.86"
      />
    </svg>
  );
}

function IconThumbDown({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.498 19.502h7.096m-7.096 0a2.252 2.252 0 01-2.25-2.25V9.412a2.252 2.252 0 012.25-2.25h7.096m-7.096 0H4.875a1.125 1.125 0 00-1.125 1.125v6.77a1.125 1.125 0 001.125 1.125h2.623m7.096-9.77V6.412a2.252 2.252 0 00-2.25-2.25H9.748m7.096 9.77H18.75a1.125 1.125 0 001.125-1.125v-6.77a1.125 1.125 0 00-1.125-1.125h-2.623"
      />
    </svg>
  );
}

function IconMinus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
  );
}

const VOTE_OPTIONS: VoteOption[] = [
  {
    value: 1,
    label: "Поддержать",
    delta: "+1",
    icon: IconThumbUp,
    cardIdle: "border-emerald-200/80 bg-white",
    cardHover: "hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md hover:shadow-emerald-100/50",
    cardActive: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200",
    iconIdle: "bg-emerald-100 text-emerald-600",
    iconActive: "bg-emerald-600 text-white",
  },
  {
    value: 0,
    label: "Воздержаться",
    delta: "0",
    icon: IconMinus,
    cardIdle: "border-slate-200 bg-white",
    cardHover: "hover:border-slate-400 hover:bg-slate-50 hover:shadow-md hover:shadow-slate-200/60",
    cardActive: "border-slate-500 bg-slate-50 ring-2 ring-slate-200",
    iconIdle: "bg-slate-100 text-slate-600",
    iconActive: "bg-slate-600 text-white",
  },
  {
    value: -1,
    label: "Не поддерживать",
    delta: "−1",
    icon: IconThumbDown,
    cardIdle: "border-rose-200/80 bg-white",
    cardHover: "hover:border-rose-400 hover:bg-rose-50 hover:shadow-md hover:shadow-rose-100/50",
    cardActive: "border-rose-500 bg-rose-50 ring-2 ring-rose-200",
    iconIdle: "bg-rose-100 text-rose-600",
    iconActive: "bg-rose-600 text-white",
  },
];

function getOption(value: VoteValue): VoteOption {
  return VOTE_OPTIONS.find((o) => o.value === value) ?? VOTE_OPTIONS[1];
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
  const [hovered, setHovered] = useState<VoteValue | null>(null);

  async function handleVote(value: VoteValue) {
    if (!canVote || submitting || voted) return;
    setSubmitting(true);
    try {
      await onVote(ideaId, value);
    } finally {
      setSubmitting(false);
    }
  }

  if (voted && myVote != null) {
    const chosen = getOption(myVote);
    const Icon = chosen.icon;
    return (
      <div
        className={cn(
          "mt-5 flex items-center gap-4 rounded-xl border px-4 py-3.5",
          myVote === 1 && "border-emerald-200 bg-emerald-50/80",
          myVote === 0 && "border-slate-200 bg-slate-50/80",
          myVote === -1 && "border-rose-200 bg-rose-50/80",
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            chosen.iconActive,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Вы проголосовали: {chosen.label}
          </p>
          <p className="text-xs text-slate-500">
            Рейтинг идеи {chosen.delta === "0" ? "не изменился" : `изменён на ${chosen.delta}`}
          </p>
        </div>
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
            myVote === 1 && "bg-emerald-600 text-white",
            myVote === 0 && "bg-slate-500 text-white",
            myVote === -1 && "bg-rose-600 text-white",
          )}
        >
          {chosen.delta}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Ваше мнение по инициативе</p>
        {submitting && (
          <span className="text-xs font-medium text-indigo-600 animate-pulse">Отправка…</span>
        )}
      </div>

      <div
        className="flex flex-col gap-2 sm:flex-row sm:gap-3"
        role="group"
        aria-label="Варианты голосования"
      >
        {VOTE_OPTIONS.map((option) => {
          const disabled = !canVote || submitting;
          const isHovered = hovered === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => handleVote(option.value)}
              onMouseEnter={() => setHovered(option.value)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "group relative flex flex-1 items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                option.cardIdle,
                !disabled && option.cardHover,
                disabled && "cursor-not-allowed opacity-50",
                isHovered && !disabled && "scale-[1.02]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  isHovered && !disabled ? option.iconActive : option.iconIdle,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                <span className="block text-xs text-slate-500">
                  {option.value === 1 && "Повысить рейтинг"}
                  {option.value === 0 && "Без влияния на рейтинг"}
                  {option.value === -1 && "Понизить рейтинг"}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular-nums transition-colors",
                  option.value === 1 && "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white",
                  option.value === 0 && "bg-slate-100 text-slate-600 group-hover:bg-slate-600 group-hover:text-white",
                  option.value === -1 && "bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white",
                  isHovered && !disabled && option.value === 1 && "bg-emerald-600 text-white",
                  isHovered && !disabled && option.value === 0 && "bg-slate-600 text-white",
                  isHovered && !disabled && option.value === -1 && "bg-rose-600 text-white",
                )}
              >
                {option.delta}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
