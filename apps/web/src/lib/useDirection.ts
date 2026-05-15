import { useCallback, useEffect, useState } from "react";

export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "factory-data-hub:direction";

/**
 * App-wide RTL toggle. Stores the preference in `localStorage` and mirrors
 * the `dir` attribute on the document root so Tailwind's logical properties
 * (`ms-`, `me-`, `ps-`, `pe-`) flip automatically.
 */
export function useDirection(): {
  direction: Direction;
  setDirection: (next: Direction) => void;
  toggle: () => void;
} {
  const [direction, setDirectionState] = useState<Direction>(() => {
    if (typeof window === "undefined") return "ltr";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "rtl" ? "rtl" : "ltr";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", direction === "rtl" ? "ar" : "en");
    window.localStorage.setItem(STORAGE_KEY, direction);
  }, [direction]);

  const setDirection = useCallback((next: Direction) => setDirectionState(next), []);
  const toggle = useCallback(() => setDirectionState((d) => (d === "ltr" ? "rtl" : "ltr")), []);

  return { direction, setDirection, toggle };
}
