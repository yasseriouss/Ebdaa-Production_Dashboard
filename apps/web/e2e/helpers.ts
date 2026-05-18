import { expect, type Page, type Response } from "@playwright/test";

/** Navigate and wait until the app shell (main landmark) is interactive. */
export async function gotoApp(page: Page, path = "/"): Promise<Response | null> {
  const res = await page.goto(path, { waitUntil: "load" });
  await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
  return res;
}

/** Home dashboard executive tab with lazy-loaded factory surface. */
export async function waitExecutiveDashboard(page: Page) {
  await gotoApp(page, "/#executive");
  await expect(page.locator("#executive-overview-heading")).toBeVisible({ timeout: 30_000 });
}
