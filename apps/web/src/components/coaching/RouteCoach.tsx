import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Info, X } from "lucide-react";
import { useToast } from "../ui/Toast";
import { cn } from "../../lib/cn";
import { useTranslation } from "../../context/I18nContext";
import { useDirection } from "../../lib/useDirection";

export type CoachRouteConfig = {
  pathPrefix: string;
  bannerKey: string;
  toastKey?: string;
};

export const EBdaa_ROUTE_COACH_HINTS: CoachRouteConfig[] = [
  { pathPrefix: "/orders/wood", bannerKey: "coach.hints.ordersWood.banner", toastKey: "coach.hints.ordersWood.toast" },
  {
    pathPrefix: "/daily/wood",
    bannerKey: "coach.hints.dailyWood.banner",
    toastKey: "coach.hints.dailyWood.toast",
  },
  { pathPrefix: "/projects/new", bannerKey: "coach.hints.projectsNew.banner" },
  {
    pathPrefix: "/planning",
    bannerKey: "coach.hints.planning.banner",
    toastKey: "coach.hints.planning.toast",
  },
  { pathPrefix: "/about-system", bannerKey: "coach.hints.aboutSystem.banner" },
  { pathPrefix: "/equipment", bannerKey: "coach.hints.equipment.banner" },
  {
    pathPrefix: "/",
    bannerKey: "coach.hints.home.banner",
    toastKey: "coach.hints.home.toast",
  },
];

function coachingMatch(pathname: string): CoachRouteConfig | undefined {
  const specific = [...EBdaa_ROUTE_COACH_HINTS]
    .filter((h) => h.pathPrefix !== "/")
    .sort((a, b) => b.pathPrefix.length - a.pathPrefix.length)
    .find((h) => pathname === h.pathPrefix || pathname.startsWith(`${h.pathPrefix}/`));
  if (specific) return specific;
  if (pathname === "/") return EBdaa_ROUTE_COACH_HINTS.find((h) => h.pathPrefix === "/");
  return undefined;
}

export function RouteCoach() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const toast = useToast();
  const hint = useMemo(() => coachingMatch(location), [location]);

  const bannerStorageKey = `fdh-coach-banner-dismiss:${location}`;
  const toastStorageKey = `fdh-coach-toast-fired:${location}`;

  const [bannerVisible, setBannerVisible] = useState(() => {
    if (typeof sessionStorage === "undefined") return true;
    return sessionStorage.getItem(bannerStorageKey) !== "1";
  });

  useEffect(() => {
    setBannerVisible(sessionStorage.getItem(bannerStorageKey) !== "1");
  }, [bannerStorageKey]);

  useEffect(() => {
    if (!hint?.toastKey) return;
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(toastStorageKey)) return;
    sessionStorage.setItem(toastStorageKey, "1");
    const msg = t(hint.toastKey);
    if (msg && msg !== hint.toastKey) {
      toast.push({ kind: "info", message: msg, durationMs: 6500 });
    }
  }, [hint, toast, toastStorageKey, t]);

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
