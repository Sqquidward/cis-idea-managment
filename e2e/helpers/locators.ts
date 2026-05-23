import type { Locator, Page } from "@playwright/test";
import { STATUS_BADGE_BG } from "../constants";
import type { IdeaStatus, TabLabel } from "../types";

/** Кнопка вкладки: в DOM текст вида «1 Пользователи» */
export function tabButton(page: Page, label: TabLabel): Locator {
  return page.getByRole("tab").filter({ hasText: label });
}

export function mainHeading(page: Page): Locator {
  return page.locator("main h1");
}

export function myIdeaCard(page: Page, title: string): Locator {
  return page.locator("li").filter({
    has: page.getByRole("heading", { level: 3, name: title }),
  });
}

export function feedIdeaCard(page: Page, title: string): Locator {
  return page.locator("article").filter({
    has: page.getByRole("heading", { level: 3, name: title }),
  });
}

/** Бейдж статуса в карточке (не подпись шага «Прогресс») */
export function statusBadge(card: Locator, status: IdeaStatus): Locator {
  const bgClass = STATUS_BADGE_BG[status];
  return card.locator(`span.${bgClass}`).filter({ hasText: status });
}

export function committeeRow(page: Page, ideaTitle: string): Locator {
  return page.locator("tr").filter({ hasText: ideaTitle });
}

export function feedbackListItem(page: Page, ideaTitle: string, text: string): Locator {
  return page.locator("li").filter({ has: page.getByText(ideaTitle) }).filter({ hasText: text });
}
