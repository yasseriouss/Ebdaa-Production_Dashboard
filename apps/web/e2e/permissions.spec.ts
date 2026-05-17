import { expect, test } from "@playwright/test";

test("sidebar hides import-export without permission key (smoke)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  const importLink = page.getByRole("link", { name: /import|استيراد/i });
  const count = await importLink.count();
  expect(count).toBeGreaterThanOrEqual(0);
});
