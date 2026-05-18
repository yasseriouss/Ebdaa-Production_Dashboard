import { expect, test } from "@playwright/test";
import { gotoApp } from "./helpers";

test("redirects /wooden/orders to production hub (wood orders)", async ({ page }) => {
  await gotoApp(page, "/wooden/orders");
  await expect(page).toHaveURL(/\/production/);
});

test("redirects /metal/orders to production hub (metal orders)", async ({ page }) => {
  await gotoApp(page, "/metal/orders");
  await expect(page).toHaveURL(/\/production/);
  await expect(page).toHaveURL(/factory=metal/);
});

test("redirects /projects to /projects/hub", async ({ page }) => {
  await gotoApp(page, "/projects");
  await expect(page).toHaveURL(/\/projects\/hub\/?$/);
});
