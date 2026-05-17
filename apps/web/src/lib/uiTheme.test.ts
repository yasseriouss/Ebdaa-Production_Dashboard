import { afterEach, describe, expect, it } from "vitest";
import {
  UI_THEME_DEFAULT,
  applyUiThemeToDocument,
  readStoredUiTheme,
  writeStoredUiTheme,
} from "./uiTheme";

describe("uiTheme", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to executive when storage is empty", () => {
    expect(readStoredUiTheme()).toBe(UI_THEME_DEFAULT);
  });

  it("persists and applies industrial theme", () => {
    writeStoredUiTheme("industrial");
    expect(readStoredUiTheme()).toBe("industrial");
    applyUiThemeToDocument("industrial");
    expect(document.documentElement.getAttribute("data-theme")).toBe("industrial");
    expect(localStorage.getItem("factory-data-hub:ui-theme")).toBe("industrial");
  });
});
