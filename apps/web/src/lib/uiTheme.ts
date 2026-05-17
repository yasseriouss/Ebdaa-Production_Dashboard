export type UiThemeId = "executive" | "industrial";

const STORAGE_KEY = "factory-data-hub:ui-theme";

export const UI_THEME_DEFAULT: UiThemeId = "executive";

export function readStoredUiTheme(): UiThemeId {
  if (typeof window === "undefined") return UI_THEME_DEFAULT;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "industrial" || v === "executive") return v;
  } catch {
    /* ignore */
  }
  return UI_THEME_DEFAULT;
}

export function writeStoredUiTheme(theme: UiThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function applyUiThemeToDocument(theme: UiThemeId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  writeStoredUiTheme(theme);
}
