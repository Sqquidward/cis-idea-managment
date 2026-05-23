/**
 * Доменные типы E2E — синхронизированы с backend/app/models.py (IdeaStatus)
 * и подписями вкладок во frontend/src/App.tsx.
 */

/** Статусы идеи в жизненном цикле */
export const IDEA_STATUSES = ["Голосование", "Реализация", "Реализована", "Архив"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

/** Подписи вкладок в шапке приложения (main h1) */
export const TAB_LABELS = [
  "Новая идея",
  "Мои идеи",
  "Лента идей",
  "Панель комитета",
  "Пользователи",
  "План реализации",
  "Оставить отзыв",
] as const;
export type TabLabel = (typeof TAB_LABELS)[number];

/** Демо-учётки из backend/app/seed.py */
export const DEMO_USERS = ["Admin", "User", "Committee"] as const;
export type DemoUser = (typeof DEMO_USERS)[number];

/** Оценка в форме отзыва */
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/** Входные данные сквозного сценария @lifecycle */
export interface LifecycleTestData {
  readonly title: string;
  readonly description: string;
  readonly feedbackText: string;
  readonly deadline: string;
}

export function isIdeaStatus(value: string): value is IdeaStatus {
  return (IDEA_STATUSES as readonly string[]).includes(value);
}

export function isTabLabel(value: string): value is TabLabel {
  return (TAB_LABELS as readonly string[]).includes(value);
}
