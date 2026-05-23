import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import type { Feedback, Idea } from "../types";
import { cn } from "../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { PageHeader } from "./ui/PageHeader";

interface FeedbackScreenProps {
  projects: Idea[];
  currentUserId: string;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400" aria-label={`Оценка ${rating} из 5`}>
      {"★".repeat(rating)}
      <span className="text-slate-200">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function FeedbackScreen({ projects, currentUserId }: FeedbackScreenProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [hoverStar, setHoverStar] = useState(0);

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить отзывы");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const reviewedIdeaIds = useMemo(() => {
    const mine = new Set<number>();
    for (const f of feedbacks) {
      if (f.user_id === currentUserId) mine.add(f.idea_id);
    }
    return mine;
  }, [feedbacks, currentUserId]);

  const availableProjects = useMemo(
    () => projects.filter((p) => !reviewedIdeaIds.has(p.id)),
    [projects, reviewedIdeaIds],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedId) {
      setError("Выберите проект для оценки");
      return;
    }
    if (rating === 0) {
      setError("Поставьте оценку в звёздах");
      return;
    }
    if (!text.trim()) {
      setError("Напишите текст отзыва");
      return;
    }

    setSaving(true);
    try {
      const created = await api.submitFeedback(Number(selectedId), rating, text.trim());
      setFeedbacks((prev) => [created, ...prev]);
      setText("");
      setRating(0);
      setSelectedId("");
      setSuccess(`Отзыв по проекту «${created.idea_title}» сохранён`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить отзыв");
    } finally {
      setSaving(false);
    }
  }

  const displayRating = hoverStar || rating;

  return (
    <section className="space-y-8">
      <PageHeader
        title="Обратная связь"
        description="Оцените результаты внедрения завершённых проектов. Все отзывы сохраняются в базе данных."
        badge="Шаг 5"
      />

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="Нет завершённых проектов"
          description="Отзывы доступны после перевода проекта в статус «Реализована»"
        />
      ) : availableProjects.length === 0 ? (
        <EmptyState
          title="Вы оставили отзывы по всем доступным проектам"
          description="Ниже — сохранённые отзывы. Новый отзыв можно оставить, когда появится ещё один завершённый проект."
        />
      ) : (
        <form onSubmit={handleSubmit} className="card mx-auto max-w-xl">
          <div>
            <label htmlFor="feedback-project" className="label-field">
              Завершённый проект
            </label>
            <select
              id="feedback-project"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="input-field"
            >
              <option value="">Выберите проект…</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <p className="label-field">Оценка результата</p>
            <div className="flex justify-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  className={cn(
                    "rounded-lg p-1 text-3xl transition hover:scale-110",
                    star <= displayRating ? "text-amber-400" : "text-slate-200",
                  )}
                  aria-label={`Оценка ${star} из 5`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-xs text-slate-500">Вы выбрали {rating} из 5</p>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="feedback-text" className="label-field">
              Текст отзыва
            </label>
            <textarea
              id="feedback-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Опишите эффект от внедрения инновации…"
              className="input-field min-h-[120px] resize-y"
            />
          </div>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary mt-6 w-full">
            {saving ? "Сохранение…" : "Сохранить отзыв"}
          </button>
        </form>
      )}

      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          Сохранённые отзывы
          {!loading && (
            <span className="ml-2 text-sm font-normal text-slate-500">({feedbacks.length})</span>
          )}
        </h3>

        {loading ? (
          <p className="text-sm text-slate-500">Загрузка…</p>
        ) : feedbacks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Пока нет отзывов. Будьте первым, кто оценит завершённый проект.
          </p>
        ) : (
          <ul className="space-y-3">
            {feedbacks.map((fb) => (
              <li
                key={fb.id}
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm",
                  fb.is_mine ? "border-indigo-200 ring-1 ring-indigo-50" : "border-slate-200/90",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{fb.idea_title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {fb.author_name}
                      {fb.is_mine && (
                        <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
                          ваш отзыв
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <Stars rating={fb.rating} />
                    <p className="mt-1 text-[10px] text-slate-400">{formatDate(fb.created_at)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{fb.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
