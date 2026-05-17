import { Moon, Sun } from "lucide-react";
import { useUiTheme } from "../hooks/useUiTheme";
import { useTranslation } from "../context/I18nContext";

export function ThemeToggle() {
  const { theme, toggle } = useUiTheme();
  const { t } = useTranslation();
  const executive = theme === "executive";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={executive ? t("theme.switchToIndustrial") : t("theme.switchToExecutive")}
      title={executive ? t("theme.switchToIndustrial") : t("theme.switchToExecutive")}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-border text-brand-metal transition-colors hover:bg-brand-border hover:text-brand-luxury focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood"
    >
      {executive ? <Sun className="h-3.5 w-3.5" aria-hidden /> : <Moon className="h-3.5 w-3.5" aria-hidden />}
    </button>
  );
}
