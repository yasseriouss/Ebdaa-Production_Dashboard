import { useTranslation } from "../context/I18nContext";

/** Factory-ported screens — keys under `factory.*` in ar/en locales. */
export function useFactoryTranslation() {
  const { t, locale } = useTranslation();
  return {
    locale,
    ft: (key: string, params?: Record<string, string | number | undefined>) =>
      t(`factory.${key}`, params),
  };
}
