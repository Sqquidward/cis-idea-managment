interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <header className="mb-8 animate-slide-up">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {badge && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
            {badge}
          </span>
        )}
      </div>
      {description && <p className="max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
    </header>
  );
}
