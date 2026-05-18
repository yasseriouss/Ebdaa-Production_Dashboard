import { expect, test } from "@playwright/test";
import { gotoApp, waitExecutiveDashboard } from "./helpers";

const routes = ["/", "/production", "/import-export", "/projects/hub"];

for (const path of routes) {
  test(`loads ${path} without 404`, async ({ page }) => {
    const res = await gotoApp(page, path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByText("404")).toHaveCount(0);
  });
}

test("home executive tab shows executive content only", async ({ page }) => {
  await waitExecutiveDashboard(page);
  await expect(page.getByRole("tab", { name: /executive overview|الرؤية التنفيذية/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#executive-overview-heading")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#operational-analytics-heading")).toHaveCount(0);
});

test("home operational tab shows operational content only", async ({ page }) => {
  await gotoApp(page, "/#operational");
  await expect(page.getByRole("tab", { name: /operational analytics|تحليلات التشغيل/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator("#operational-analytics-heading")).toBeVisible();
  await expect(page.locator("#executive-overview-heading")).toHaveCount(0);
});

test("dashboard tabs switch panels", async ({ page }) => {
  await waitExecutiveDashboard(page);
  await page.getByRole("tab", { name: /operational analytics|تحليلات التشغيل/i }).click();
  await expect(page.locator("#operational-analytics-heading")).toBeVisible();
  await expect(page.locator("#executive-overview-heading")).toHaveCount(0);
});
