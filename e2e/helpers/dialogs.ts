import type { Page } from "@playwright/test";

/** Автопринятие системных alert() после публикации идеи, сохранения плана и т.д. */
export function acceptNativeDialogs(page: Page): void {
  page.on("dialog", (dialog) => {
    void dialog.accept();
  });
}
