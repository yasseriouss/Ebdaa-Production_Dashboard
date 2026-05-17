import { describe, expect, it } from "vitest";
import { ar } from "../locales/ar";
import { en } from "../locales/en";
import { flattenMessageKeys } from "../test/flattenMessages";

describe("locale key parity", () => {
  it("ar and en expose the same message keys", () => {
    const arKeys = flattenMessageKeys(ar);
    const enKeys = flattenMessageKeys(en);
    const onlyAr = arKeys.filter((k) => !enKeys.includes(k));
    const onlyEn = enKeys.filter((k) => !arKeys.includes(k));
    expect(onlyAr, `keys only in ar: ${onlyAr.slice(0, 10).join(", ")}`).toEqual([]);
    expect(onlyEn, `keys only in en: ${onlyEn.slice(0, 10).join(", ")}`).toEqual([]);
  });
});
