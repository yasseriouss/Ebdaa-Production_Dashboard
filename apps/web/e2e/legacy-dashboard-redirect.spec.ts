import { expect, test } from "@playwright/test";
import { gotoApp } from "./helpers";

test("redirects /dashboard/classic to /", async ({ page }) => {
  await gotoApp(page, "/dashboard/classic");
  await expect(page).toHaveURL(/\/\/?$/);
});

test("redirects /dashboard/factory to home executive anchor", async ({ page }) => {
  await gotoApp(page, "/dashboard/factory");
  await expect(page).toHaveURL(/\/#executive/);
  await expect(page.locator("#executive-overview-heading")).toBeVisible({ timeout: 30_000 });
});
