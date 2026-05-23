import type { Locator } from "@playwright/test";

/**
 * Выбор option в &lt;select&gt; по началу текста (поддерживает суффикс «· черновик»).
 * Playwright selectOption({ label }) принимает только строку, не RegExp.
 */
export async function selectOptionByIdeaTitle(select: Locator, ideaTitle: string): Promise<void> {
  const value = await select.evaluate((el, title) => {
    const selectEl = el as HTMLSelectElement;
    const match = Array.from(selectEl.options).find((o) => o.text.trim().startsWith(title));
    if (!match?.value) {
      throw new Error(`Option not found for idea: ${title}`);
    }
    return match.value;
  }, ideaTitle);

  await select.selectOption(value);
}
