import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";

/**
 * Tiny replacement for `nuqs` tailored to Wouter. Reads/writes a single
 * `URLSearchParams` instance via `useLocation`, so consumers can sync table
 * state (filters, sort, pagination) to the URL for shareable views.
 *
 * `pushReplace: "replace"` keeps the back stack clean for incremental edits
 * like keystrokes; switch to `"push"` for navigation-style transitions.
 */
type Updater = string | null | ((prev: string | null) => string | null);

export interface UseUrlStateOptions {
  pushReplace?: "push" | "replace";
}

export function useUrlState({ pushReplace = "replace" }: UseUrlStateOptions = {}) {
  const [location, navigate] = useLocation();
  const search = typeof window === "undefined" ? "" : window.location.search;

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const get = useCallback((key: string): string | null => params.get(key), [params]);

  const set = useCallback(
    (key: string, updater: Updater) => {
      const next = new URLSearchParams(window.location.search);
      const previous = next.get(key);
      const value = typeof updater === "function" ? updater(previous) : updater;
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      const target = qs ? `${location}?${qs}` : location;
      navigate(target, { replace: pushReplace === "replace" });
    },
    [location, navigate, pushReplace],
  );

  const setMany = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      const target = qs ? `${location}?${qs}` : location;
      navigate(target, { replace: pushReplace === "replace" });
    },
    [location, navigate, pushReplace],
  );

  return { get, set, setMany, params };
}
