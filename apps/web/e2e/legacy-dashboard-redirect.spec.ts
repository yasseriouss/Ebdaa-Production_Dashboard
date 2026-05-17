import { expect, test } from "@playwright/test";

test("redirects /dashboard/classic to /", async ({ page }) => {
  await page.goto("/dashboard/classic");
  await expect(page).toHaveURL(/\/\/?$/);
});

test("redirects /dashboard/factory to home executive anchor", async ({ page }) => {
  await page.goto("/dashboard/factory");
  await expect(page).toHaveURL(/\/(#executive)?\/?$/);
  await expect(page.locator("#executive")).toBeVisible();
});
