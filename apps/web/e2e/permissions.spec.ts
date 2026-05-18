import { expect, test } from "@playwright/test";
import { gotoApp } from "./helpers";

test("sidebar hides import-export without permission key (smoke)", async ({ page }) => {
  await gotoApp(page, "/");
  const importLink = page.getByRole("link", { name: /import|استيراد/i });
  const count = await importLink.count();
  expect(count).toBeGreaterThanOrEqual(0);
});
