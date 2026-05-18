import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "../components/ui/Toast";
import { useTranslation } from "../context/I18nContext";
import { coachingMatch } from "./coachingHints";

/** One-shot route coaching toast per path per session (same as legacy RouteCoach). */
export function useRouteCoachToast() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const toast = useToast();
  const hint = coachingMatch(location);
  const toastStorageKey = `fdh-coach-toast-fired:${location}`;

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
}
