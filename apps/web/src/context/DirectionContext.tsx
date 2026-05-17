import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "factory-data-hub:direction";

type DirectionContextValue = {
  direction: Direction;
  setDirection: (next: Direction) => void;
  toggle: () => void;
};

const DirectionContext = createContext<DirectionContextValue | null>(null);

function readStoredDirection(): Direction {
  if (typeof window === "undefined") return "rtl";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "ltr" || stored === "rtl") return stored;
  return "rtl";
}

export function DirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirectionState] = useState<Direction>(readStoredDirection);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", direction === "rtl" ? "ar" : "en");
    window.localStorage.setItem(STORAGE_KEY, direction);
  }, [direction]);

  const setDirection = useCallback((next: Direction) => {
    setDirectionState(next);
  }, []);

  const toggle = useCallback(() => {
    setDirectionState((d) => (d === "ltr" ? "rtl" : "ltr"));
  }, []);

  const value = useMemo(
    () => ({ direction, setDirection, toggle }),
    [direction, setDirection, toggle],
  );

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

export function useDirection(): DirectionContextValue {
  const ctx = useContext(DirectionContext);
  if (!ctx) {
    throw new Error("useDirection must be used within DirectionProvider");
  }
  return ctx;
}

export { STORAGE_KEY as DIRECTION_STORAGE_KEY };
