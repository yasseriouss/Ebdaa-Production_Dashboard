import { test, expect, type Page } from "@playwright/test";
import { gotoApp, settleLayout } from "./helpers";

async function freezeChromeMotion(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });
}

async function waitChrome(page: Page) {
  await expect(page.getByTestId("layout-header")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("layout-sidebar")).toBeVisible({ timeout: 30_000 });
}

/** Visual regression for app chrome (sidebar + sticky header) — catches z-index / overlap regressions. */
test.describe("header/sidebar chrome", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("desktop RTL — sidebar expanded", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoApp(page, "/");
    await waitChrome(page);
    await settleLayout(page);
    await freezeChromeMotion(page);
    await expect(page.getByTestId("layout-header")).toHaveScreenshot("desktop-rtl-expanded-header.png", {
      timeout: 60_000,
    });
    await expect(page.getByTestId("layout-sidebar")).toHaveScreenshot("desktop-rtl-expanded-sidebar.png", {
      timeout: 60_000,
    });
  });

  test("desktop RTL — sidebar collapsed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoApp(page, "/");
    await waitChrome(page);
    await page.getByRole("button", { name: "طي القائمة" }).click();
    await settleLayout(page);
    await freezeChromeMotion(page);
    await expect(page.getByTestId("layout-header")).toHaveScreenshot("desktop-rtl-collapsed-header.png", {
      timeout: 60_000,
    });
    await expect(page.getByTestId("layout-sidebar")).toHaveScreenshot("desktop-rtl-collapsed-sidebar.png", {
      timeout: 60_000,
    });
  });

  test("desktop RTL — production hub", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await gotoApp(page, "/production");
    await waitChrome(page);
    await settleLayout(page);
    await freezeChromeMotion(page);
    await expect(page.getByTestId("layout-header")).toHaveScreenshot("desktop-rtl-production-header.png", {
      timeout: 60_000,
    });
  });

  test("mobile RTL — shell band", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, "/");
    await waitChrome(page);
    await settleLayout(page);
    await freezeChromeMotion(page);
    await expect(page.getByTestId("layout-header")).toHaveScreenshot("mobile-rtl-header.png", {
      timeout: 60_000,
      maxDiffPixelRatio: 0.02,
    });
  });
});
