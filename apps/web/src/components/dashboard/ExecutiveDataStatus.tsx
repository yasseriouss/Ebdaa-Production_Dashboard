import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTranslation } from "../../context/I18nContext";

export function ExecutiveDataStatus({
  isError,
  isRetrying,
  onRetry,
  partialError,
  className,
}: {
  isError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  partialError?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  if (!isError && !partialError) return null;

  const fatal = Boolean(isError);

  return (
    <div
      role={fatal ? "alert" : "status"}
      className={cn(
        "flex flex-col gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        fatal
          ? "border-destructive/40 bg-destructive/10 text-brand-luxury"
          : "border-brand-wood/35 bg-brand-wood/10 text-brand-luxury",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <AlertTriangle
          className={cn("mt-0.5 h-4 w-4 shrink-0", fatal ? "text-destructive" : "text-brand-wood")}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">
            {fatal ? t("factory.dashboard.loadError") : t("factory.dashboard.partialError")}
          </p>
          <p className="text-xs leading-relaxed text-brand-metal">
            {fatal ? t("factory.dashboard.loadErrorHint") : t("factory.dashboard.partialErrorHint")}
          </p>
        </div>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={() => void onRetry()}
          disabled={isRetrying}
          className="industrial-btn shrink-0 gap-2 self-start border-brand-border bg-brand-elevated px-3 py-2 text-[11px] sm:self-center"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRetrying && "animate-spin")} aria-hidden />
          {t("factory.dashboard.retry")}
        </button>
      ) : null}
    </div>
  );
}
