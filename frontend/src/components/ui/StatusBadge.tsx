import { cn } from "../../lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Голосование: "bg-amber-50 text-amber-800 ring-amber-200",
  Реализация: "bg-sky-50 text-sky-800 ring-sky-200",
  Реализована: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Архив: "bg-slate-100 text-slate-600 ring-slate-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 ring-slate-200",
        className,
      )}
    >
      {status}
    </span>
  );
}
