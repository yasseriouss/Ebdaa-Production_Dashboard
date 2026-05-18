import { expect, test } from "@playwright/test";
import { gotoApp, waitExecutiveDashboard } from "./helpers";
import { APP_SMOKE_PATHS } from "../src/lib/appSmokeRoutes";

const routes = ["/", "/production", "/import-export", "/projects/hub"];

for (const path of routes) {
  test(`loads ${path} without 404`, async ({ page }) => {
    const res = await gotoApp(page, path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByTestId("not-found")).toHaveCount(0);
  });
}

for (const path of APP_SMOKE_PATHS) {
  test(`smoke route ${path} loads main without 404`, async ({ page }) => {
    const res = await gotoApp(page, path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByTestId("not-found")).toHaveCount(0);
  });
}

test("home shows executive overview only", async ({ page }) => {
  await waitExecutiveDashboard(page);
  await expect(page.locator("#executive-overview-heading")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#operational-analytics-heading")).toHaveCount(0);
});

test("hash operational redirects to analytics", async ({ page }) => {
  await gotoApp(page, "/#operational");
  await expect(page).toHaveURL(/\/analytics/);
  await expect(page.locator("#operational-analytics-heading")).toBeVisible({ timeout: 20_000 });
});

test("orders list routes redirect to production hub", async ({ page }) => {
  await gotoApp(page, "/orders/metal");
  await expect(page).toHaveURL(/\/production/);
  await expect(page).toHaveURL(/factory=metal/);
  await gotoApp(page, "/orders/wood");
  await expect(page).toHaveURL(/\/production/);
});

test("operational analytics panel is on analytics page", async ({ page }) => {
  await gotoApp(page, "/analytics");
  await expect(page.locator("#operational-analytics-heading")).toBeVisible();
});
