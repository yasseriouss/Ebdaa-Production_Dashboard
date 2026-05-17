import { expect, test } from "@playwright/test";

test("redirects /wooden/orders to /orders/wood", async ({ page }) => {
  await page.goto("/wooden/orders");
  await expect(page).toHaveURL(/\/orders\/wood\/?$/);
});

test("redirects /metal/orders to /orders/metal", async ({ page }) => {
  await page.goto("/metal/orders");
  await expect(page).toHaveURL(/\/orders\/metal\/?$/);
});

test("redirects /projects to /projects/hub", async ({ page }) => {
  await page.goto("/projects");
  await expect(page).toHaveURL(/\/projects\/hub\/?$/);
});
