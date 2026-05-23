import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:5173";
const slowMo = Number(process.env.SLOW_MO ?? "0");
/** По умолчанию headless; для «живого» просмотра: npm run test:e2e:watch */
const headless = process.env.HEADLESS !== "false";

export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    headless,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: headless ? "off" : "on",
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
    ...devices["Desktop Chrome"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PW_NO_WEB_SERVER
    ? undefined
    : {
        command: "npm run dev --prefix frontend",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
