import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Info, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTranslation } from "../../context/I18nContext";
import { useDirection } from "../../lib/useDirection";
import { coachingMatch, type CoachRouteConfig } from "../../lib/coachingHints";
import { useRouteCoachToast } from "../../lib/useRouteCoachToast";

export type { CoachRouteConfig };
export { EBdaa_ROUTE_COACH_HINTS } from "../../lib/coachingHints";

export function RouteCoach() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const hint = useMemo(() => coachingMatch(location), [location]);

  useRouteCoachToast();

  const bannerStorageKey = `fdh-coach-banner-dismiss:${location}`;

  const [bannerVisible, setBannerVisible] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(bannerStorageKey) !== "1";
  });

  useEffect(() => {
    setBannerVisible(sessionStorage.getItem(bannerStorageKey) !== "1");
  }, [bannerStorageKey]);

  if (!hint || !bannerVisible) return null;

  const dismiss = () => {
    sessionStorage.setItem(bannerStorageKey, "1");
    setBannerVisible(false);
  };

  const bannerText = t(hint.bannerKey);

  return (
    <div
      role="note"
      className={cn(
        "mb-4 sm:mb-6 flex gap-3 border border-brand-metal/40 bg-brand-elevated/90 px-3 py-3 sm:px-4 text-xs text-brand-luxury",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300",
      )}
    >
      <Info className="w-4 h-4 shrink-0 text-brand-metal mt-0.5" aria-hidden />
      <p className="flex-1 leading-relaxed" dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"}>
        {bannerText}
      </p>
      <button
        type="button"
        aria-label={t("coach.dismiss")}
        onClick={dismiss}
        className="text-brand-metal hover:text-brand-luxury shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
