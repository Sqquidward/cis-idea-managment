import { useCallback, useLayoutEffect, useRef, useState, type FC } from "react";
import type { TabId } from "../types";
import { cn } from "../lib/utils";

export interface AppTabItem {
  id: TabId;
  label: string;
  icon: FC<{ className?: string }>;
}

interface AppTabNavProps {
  tabs: AppTabItem[];
  activeId: TabId;
  onChange: (id: TabId) => void;
}

type Indicator = { left: number; width: number };

export function AppTabNav({ tabs, activeId, onChange }: AppTabNavProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    const btn = tabRefs.current.get(activeId);
    if (!list || !btn) return;
    const listRect = list.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - listRect.left + list.scrollLeft,
      width: btnRect.width,
    });
    setReady(true);
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
    const list = listRef.current;
    if (!list) return;

    const ro = new ResizeObserver(measure);
    ro.observe(list);
    tabs.forEach((t) => {
      const el = tabRefs.current.get(t.id);
      if (el) ro.observe(el);
    });

    list.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      list.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [tabs, activeId, measure]);

  useLayoutEffect(() => {
    const btn = tabRefs.current.get(activeId);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  return (
    <div
      ref={listRef}
      className="relative flex gap-1 overflow-x-auto py-1 scrollbar-thin"
      role="tablist"
      aria-label="Разделы системы"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 rounded-lg bg-indigo-600 shadow-md shadow-indigo-600/25",
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.2,0.64,1)]",
          !ready && "opacity-0",
        )}
        style={{
          left: indicator.left,
          width: indicator.width,
        }}
      />

      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = activeId === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative z-10 flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
              "transition-colors duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
              active ? "text-white" : "text-slate-600 hover:text-slate-900",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all duration-300",
                active
                  ? "bg-white/20 text-white scale-110"
                  : "bg-slate-200/80 text-slate-600 group-hover:bg-slate-300",
              )}
            >
              {index + 1}
            </span>
            <Icon
              className={cn(
                "hidden h-4 w-4 transition-all duration-300 sm:block",
                active ? "scale-110 text-white" : "text-slate-400",
              )}
            />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                active && "font-semibold",
              )}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
