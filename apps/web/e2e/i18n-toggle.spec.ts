import { expect, test } from "@playwright/test";

test("language toggle changes sidebar label on classic dashboard", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /switch language direction/i }).first();
  if ((await toggle.count()) === 0) {
    test.skip(true, "language toggle not found in header");
  }
  const label = toggle.locator("span").filter({ hasText: /^(AR|EN)$/ });
  await expect(label).toBeVisible();
  const before = await page.locator("aside, nav").first().innerText();
  await toggle.click();
  await page.waitForTimeout(300);
  const after = await page.locator("aside, nav").first().innerText();
  expect(after).not.toBe(before);
});
