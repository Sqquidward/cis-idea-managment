import { setTimeout } from "node:timers/promises";
import { expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "../constants";
import { mainHeading, tabButton } from "../helpers/locators";
import type { DemoUser, TabLabel } from "../types";

export { DEMO_PASSWORD };

export async function loginAs(page: Page, username: DemoUser): Promise<void> {
  await page.goto("/");
  await page.getByLabel("Имя пользователя").fill(username);
  await page.getByLabel("Пароль").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page.getByRole("tablist", { name: "Разделы системы" })).toBeVisible();
}

export async function logout(page: Page): Promise<void> {
  await page.locator('header button[aria-haspopup="menu"]').click();
  await page.getByRole("menuitem", { name: "Выйти из системы" }).click();
  await expect(page.getByRole("button", { name: "Войти" })).toBeVisible();
}

export async function openTab(page: Page, label: TabLabel): Promise<void> {
  const tab = tabButton(page, label);
  await expect(tab).toBeVisible();

  if ((await tab.getAttribute("aria-selected")) !== "true") {
    await tab.click();
  }

  await expect(mainHeading(page)).toHaveText(label);
  await waitForTabContent(page, label);
}

/** Пауза для визуального тура (@tour) */
export async function tourPause(_page: Page): Promise<void> {
  const ms = Number(process.env.TOUR_PAUSE_MS ?? "1200");
  await setTimeout(ms);
}

async function waitForTabContent(page: Page, label: TabLabel): Promise<void> {
  if (label === "Пользователи") {
    await page.getByText("Загрузка…").waitFor({ state: "hidden", timeout: 20_000 }).catch(() => undefined);
  }
}
