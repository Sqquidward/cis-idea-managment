import { test, type Page } from "@playwright/test";
import { DEFAULT_TAB_BY_ROLE, TABS_BY_ROLE } from "../constants";
import { loginAs, logout, openTab, tourPause } from "../fixtures/auth";
import type { DemoUser } from "../types";

test.describe("Визуальный тур по интерфейсу @tour", () => {
  test.describe.configure({ mode: "serial" });

  async function tourRole(page: Page, role: DemoUser) {
    await loginAs(page, role);
    await openTab(page, DEFAULT_TAB_BY_ROLE[role]);
    await tourPause(page);

    const tabs = TABS_BY_ROLE[role];
    for (const tab of tabs.slice(1)) {
      await openTab(page, tab);
      await tourPause(page);
    }

    await logout(page);
  }

  test("Администратор — все разделы", async ({ page }) => {
    await tourRole(page, "Admin");
  });

  test("Пользователь — рабочие разделы", async ({ page }) => {
    await tourRole(page, "User");
  });

  test("Комитет — лента и модерация", async ({ page }) => {
    await tourRole(page, "Committee");
  });
});
