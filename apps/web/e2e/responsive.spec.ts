import { expect, test } from "@playwright/test";
import { gotoApp, settleLayout } from "./helpers";

const viewports = [
  { width: 375, height: 812, name: "mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1280, height: 720, name: "desktop" },
];

const paths = ["/", "/production", "/projects/hub"];

for (const vp of viewports) {
  for (const path of paths) {
    test(`no horizontal overflow on ${path} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoApp(page, path);
      await settleLayout(page);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth > doc.clientWidth + 2;
      });
      expect(overflow, `horizontal overflow at ${path}`).toBe(false);
    });
  }
}
