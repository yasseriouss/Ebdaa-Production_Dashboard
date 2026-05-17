import { expect, test } from "@playwright/test";

test("factory dashboard title follows locale", async ({ page }) => {
  await page.goto("/#executive");
  const title = page.locator("#executive-overview-heading");
  await expect(title).toBeVisible({ timeout: 15_000 });
  const arTitle = await title.innerText();
  const toggle = page.getByRole("button", { name: /english|العربية|language/i }).first();
  if ((await toggle.count()) === 0) test.skip(true, "language toggle not found");
  await toggle.click();
  await page.waitForTimeout(400);
  expect(await title.innerText()).not.toBe(arTitle);
});

test("factory production hub title follows locale", async ({ page }) => {
  await page.goto("/production");
  const title = page.locator("h1").first();
  await expect(title).toBeVisible();
  const arTitle = await title.innerText();

  const toggle = page.getByRole("button", { name: /english|العربية|language/i }).first();
  if ((await toggle.count()) === 0) {
    test.skip(true, "language toggle not found");
  }
  await toggle.click();
  await page.waitForTimeout(400);
  const enTitle = await title.innerText();
  expect(enTitle).not.toBe(arTitle);
  expect(enTitle.length).toBeGreaterThan(0);
});
