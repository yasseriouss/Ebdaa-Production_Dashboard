import { useCallback, useEffect, useState } from "react";
import { type UiThemeId, applyUiThemeToDocument, readStoredUiTheme } from "../lib/uiTheme";

export function useUiTheme(): {
  theme: UiThemeId;
  setTheme: (t: UiThemeId) => void;
  toggle: () => void;
} {
  const [theme, setThemeState] = useState<UiThemeId>(() => readStoredUiTheme());

  useEffect(() => {
    applyUiThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((t: UiThemeId) => {
    setThemeState(t);
    applyUiThemeToDocument(t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((cur) => {
      const next: UiThemeId = cur === "executive" ? "industrial" : "executive";
      applyUiThemeToDocument(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
