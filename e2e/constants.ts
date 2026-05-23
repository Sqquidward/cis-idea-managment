import type { DemoUser, IdeaStatus, TabLabel } from "./types";

/** Пароль демо-пользователей (seed) */
export const DEMO_PASSWORD = "12345" as const;

/**
 * Порт backend для прокси Vite.
 * @see frontend/vite.config.ts → server.proxy["/api"].target
 */
export const BACKEND_PORT = 8001;

export const PLAYWRIGHT_BASE_URL = "http://127.0.0.1:5173";

/** CSS-класс фона StatusBadge (frontend/src/components/ui/StatusBadge.tsx) */
export const STATUS_BADGE_BG: Record<IdeaStatus, string> = {
  Голосование: "bg-amber-50",
  Реализация: "bg-sky-50",
  Реализована: "bg-emerald-50",
  Архив: "bg-slate-100",
};

/** Вкладки, доступные каждой роли (порядок обхода в visual-tour) */
export const TABS_BY_ROLE: Record<DemoUser, readonly TabLabel[]> = {
  Admin: [
    "Пользователи",
    "Новая идея",
    "Мои идеи",
    "Лента идей",
    "Панель комитета",
    "План реализации",
    "Оставить отзыв",
  ],
  User: ["Новая идея", "Мои идеи", "Лента идей", "План реализации", "Оставить отзыв"],
  Committee: ["Лента идей", "Панель комитета"],
};

/** Вкладка по умолчанию после входа */
export const DEFAULT_TAB_BY_ROLE: Record<DemoUser, TabLabel> = {
  Admin: "Пользователи",
  User: "Новая идея",
  Committee: "Лента идей",
};

/** Стабильные id полей форм */
export const SELECTORS = {
  loginUsername: "#username",
  loginPassword: "#password",
  ideaTitle: "#idea-title",
  ideaDescription: "#idea-description",
  planProject: "#plan-project",
  planDeadline: "#plan-deadline",
  feedbackProject: "#feedback-project",
  feedbackText: "#feedback-text",
} as const;
