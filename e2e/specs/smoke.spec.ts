import { expect, test } from "@playwright/test";
import { loginAs, openTab } from "../fixtures/auth";

test.describe("Smoke", () => {
  test("вход User и лента идей", async ({ page }) => {
    await loginAs(page, "User");
    await openTab(page, "Лента идей");
    await expect(page.getByText("Просматривайте инициативы коллег")).toBeVisible();
  });

  test("неверный пароль", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Имя пользователя").fill("User");
    await page.getByLabel("Пароль").fill("wrong");
    await page.getByRole("button", { name: "Войти" }).click();
    await expect(page.getByRole("alert")).toContainText("Неверный логин или пароль");
  });
});
