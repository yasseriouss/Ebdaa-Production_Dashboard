import { test, expect, type Page } from "@playwright/test";
import { gotoApp, settleLayout } from "./helpers";
import { overlapScenarios } from "./headerOverlap.config";

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

  for (const scenario of overlapScenarios) {
    test(scenario.name, async ({ page }) => {
      await page.setViewportSize(scenario.viewport);
      await gotoApp(page, scenario.route);
      await waitChrome(page);

      if (scenario.sidebar === "collapsed") {
        // Toggle sidebar if needed. Default is expanded.
        // The button name might change based on locale, but let's assume Arabic for now as per previous spec.
        await page.getByRole("button", { name: "طي القائمة" }).click();
      }

      await settleLayout(page);
      await freezeChromeMotion(page);

      // We use unnamed screenshots to let Playwright append project/platform info,
      // ensuring unique baselines per CI matrix project.
      await expect(page.getByTestId("layout-header")).toHaveScreenshot({
        timeout: 60_000,
        maxDiffPixelRatio: scenario.maxDiffPixelRatio,
      });

      // Sidebar check for desktop scenarios
      if (scenario.viewport.width > 640) {
        await expect(page.getByTestId("layout-sidebar")).toHaveScreenshot({
          timeout: 60_000,
        });
      }
    });
  }
});
