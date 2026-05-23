import { expect, type Page } from "@playwright/test";
import { SELECTORS } from "../constants";
import { acceptNativeDialogs } from "../helpers/dialogs";
import { selectOptionByIdeaTitle } from "../helpers/forms";
import {
  committeeRow,
  feedIdeaCard,
  feedbackListItem,
  mainHeading,
  myIdeaCard,
  statusBadge,
} from "../helpers/locators";
import type { FeedbackRating, IdeaStatus } from "../types";
import { feedbackStarLabel, planDeadlineInDays, uniqueFeedbackText, uniqueIdeaTitle } from "./test-data";
import { openTab } from "./auth";

export { planDeadlineInDays, uniqueFeedbackText, uniqueIdeaTitle };

/** @deprecated Используйте acceptNativeDialogs из helpers/dialogs */
export const acceptAppDialogs = acceptNativeDialogs;

export async function createIdea(page: Page, title: string, description: string): Promise<void> {
  await openTab(page, "Новая идея");
  await page.locator(SELECTORS.ideaTitle).fill(title);
  await page.locator(SELECTORS.ideaDescription).fill(description);
  await page.getByRole("button", { name: /Опубликовать и запустить голосование/ }).click();
  await expect(mainHeading(page)).toHaveText("Мои идеи");

  const card = myIdeaCard(page, title);
  await expect(card).toBeVisible();
  await expect(statusBadge(card, "Голосование")).toBeVisible();
}

export async function voteForIdea(page: Page, title: string): Promise<void> {
  await openTab(page, "Лента идей");
  await page.locator("main").getByRole("button", { name: /^Голосование/ }).click();

  const card = feedIdeaCard(page, title);
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: /Поддержать/ }).click();
  await expect(card.getByText(/Вы проголосовали/)).toBeVisible();
}

export async function approveIdeaInCommittee(page: Page, title: string): Promise<void> {
  await openTab(page, "Панель комитета");
  const row = committeeRow(page, title);
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Утвердить" }).click();
  await expect(row.getByText("Реализация", { exact: true })).toBeVisible();
}

export async function savePlanForIdea(page: Page, title: string, deadline: string): Promise<void> {
  await openTab(page, "План реализации");
  await selectOptionByIdeaTitle(page.locator(SELECTORS.planProject), title);
  await page.locator(SELECTORS.planDeadline).fill(deadline);
  await page.getByPlaceholder("Ваша задача в проекте…").fill("Координация внедрения (E2E)");
  await page.getByRole("button", { name: "Зафиксировать дорожную карту" }).click();
  await expect(mainHeading(page)).toHaveText("Оставить отзыв");
}

export async function submitFeedback(
  page: Page,
  title: string,
  text: string,
  stars: FeedbackRating,
): Promise<void> {
  await openTab(page, "Оставить отзыв");
  await selectOptionByIdeaTitle(page.locator(SELECTORS.feedbackProject), title);
  await page.getByRole("button", { name: feedbackStarLabel(stars) }).click();
  await page.locator(SELECTORS.feedbackText).fill(text);
  await page.getByRole("button", { name: "Сохранить отзыв" }).click();
  await expect(page.getByText(`Отзыв по проекту «${title}» сохранён`)).toBeVisible();
  await expect(feedbackListItem(page, title, text).first()).toBeVisible();
}

export async function assertIdeaStatusInMyIdeas(
  page: Page,
  title: string,
  status: IdeaStatus,
): Promise<void> {
  await openTab(page, "Мои идеи");
  await expect(statusBadge(myIdeaCard(page, title), status)).toBeVisible();
}
