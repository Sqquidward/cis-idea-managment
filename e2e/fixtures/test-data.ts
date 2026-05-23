import type { FeedbackRating, LifecycleTestData } from "../types";

export function uniqueIdeaTitle(prefix = "E2E-цикл"): string {
  return `${prefix}-${Date.now()}`;
}

export function uniqueFeedbackText(): string {
  return `E2E-отзыв-${Date.now()}: внедрение прошло успешно, процесс стал быстрее.`;
}

/** ISO YYYY-MM-DD */
export function planDeadlineInDays(daysAhead = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

export function createLifecycleTestData(): LifecycleTestData {
  return {
    title: uniqueIdeaTitle(),
    description: "E2E: описание инициативы для сквозной проверки жизненного цикла.",
    feedbackText: uniqueFeedbackText(),
    deadline: planDeadlineInDays(),
  };
}

export function feedbackStarLabel(rating: FeedbackRating): string {
  return `Оценка ${rating} из 5`;
}
