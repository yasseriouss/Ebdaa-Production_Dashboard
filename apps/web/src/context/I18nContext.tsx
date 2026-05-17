import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDirection } from "../lib/useDirection";
import { ar } from "../locales/ar";
import { en, type EnMessages } from "../locales/en";
import { interpolate, resolveMessage, type MessageTree } from "../i18n/resolveMessage";

export type Locale = "ar" | "en";

export type Translate = (
  key: string,
  params?: Record<string, string | number | undefined>,
) => string;

type I18nContextValue = {
  t: Translate;
  locale: Locale;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function messagesFor(locale: Locale): EnMessages {
  return locale === "ar" ? ar : en;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { direction } = useDirection();
  const locale: Locale = direction === "rtl" ? "ar" : "en";
  const tree = messagesFor(locale);

  const t: Translate = useMemo(
    () => (key, params) => {
      const raw = resolveMessage(tree as unknown as MessageTree, key);
      if (raw === undefined) return key;
      return interpolate(raw, params);
    },
    [tree],
  );

  const value = useMemo(() => ({ t, locale }), [t, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  return ctx;
}
