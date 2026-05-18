import { expect, test } from "@playwright/test";
import { gotoApp, waitExecutiveDashboard } from "./helpers";

test("factory dashboard title follows locale", async ({ page }) => {
  await waitExecutiveDashboard(page);
  const title = page.locator("#executive-overview-heading");
  const arTitle = await title.innerText();
  const toggle = page
    .getByRole("button", { name: /switch language direction|تبديل اتجاه اللغة/i })
    .first();
  if ((await toggle.count()) === 0) test.skip(true, "language toggle not found");
  await toggle.click();
  await expect(title).not.toHaveText(arTitle, { timeout: 15_000 });
});

test("factory production hub title follows locale", async ({ page }) => {
  await gotoApp(page, "/production");
  const title = page.locator("h1").first();
  await expect(title).toBeVisible();
  const arTitle = await title.innerText();

  const toggle = page
    .getByRole("button", { name: /switch language direction|تبديل اتجاه اللغة/i })
    .first();
  if ((await toggle.count()) === 0) {
    test.skip(true, "language toggle not found");
  }
  await toggle.click();
  await expect(title).not.toHaveText(arTitle, { timeout: 15_000 });
  expect((await title.innerText()).length).toBeGreaterThan(0);
});
