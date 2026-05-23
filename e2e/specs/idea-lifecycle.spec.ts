import { test } from "@playwright/test";
import { loginAs, logout } from "../fixtures/auth";
import {
  acceptAppDialogs,
  approveIdeaInCommittee,
  assertIdeaStatusInMyIdeas,
  createIdea,
  savePlanForIdea,
  submitFeedback,
  voteForIdea,
} from "../fixtures/idea-lifecycle";
import { createLifecycleTestData } from "../fixtures/test-data";

test.describe("Полный цикл идеи @lifecycle", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(180_000);

  test("от публикации до отзыва о результате", async ({ page }) => {
    const data = createLifecycleTestData();
    acceptAppDialogs(page);

    await loginAs(page, "User");
    await createIdea(page, data.title, data.description);
    await logout(page);

    await loginAs(page, "Admin");
    await voteForIdea(page, data.title);
    await logout(page);

    await loginAs(page, "Committee");
    await approveIdeaInCommittee(page, data.title);
    await logout(page);

    await loginAs(page, "User");
    await assertIdeaStatusInMyIdeas(page, data.title, "Реализация");
    await savePlanForIdea(page, data.title, data.deadline);
    await assertIdeaStatusInMyIdeas(page, data.title, "Реализована");
    await logout(page);

    await loginAs(page, "Admin");
    await submitFeedback(page, data.title, data.feedbackText, 5);
    await logout(page);
  });
});
