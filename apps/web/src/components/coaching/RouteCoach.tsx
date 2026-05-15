import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Info, X } from "lucide-react";
import { useToast } from "../ui/Toast";
import { cn } from "../../lib/cn";

export interface CoachHint {
  pathPrefix: string;
  bannerAr: string;
  toastAr?: string;
}

export const EBdaa_ROUTE_COACH_HINTS: CoachHint[] = [
  {
    pathPrefix: "/orders/wood",
    bannerAr:
      "تحديث كميات المراحل يعكس التقدّم على شريط الحالة؛ راجع التسلسل: مقاطع → لزق شريط → CNC.",
    toastAr:
      "تلميح: أوامر الخشب تتبع مراحل التوجيه في لوحة الأعمدة؛ تأكد من تحديث الكميات بعد كل قسم.",
  },
  {
    pathPrefix: "/daily/wood",
    bannerAr:
      "اليومية تُصدَّر كمرافق للأرضية؛ سجّل أمر الشغل والفني وفق نفس أعمدة ملف الإكسل اليومية.",
    toastAr: "يمكنك تصدير HTML أو XLS للطباعة من زر التصدير بعد اختيار القسم.",
  },
  {
    pathPrefix: "/projects/new",
    bannerAr:
      "قبل التخطيط: تأكد أن المكتب الفني جهّز ملفات DXF للتخريم وفق دليل سير العمل.",
  },
  {
    pathPrefix: "/planning",
    bannerAr:
      "المتابعة الأسبوعية تربط الإنجاز بالجودة؛ حدّث الأهداف هنا بدل ترك خلايا القالب فارغة.",
    toastAr: "صفحة التخطيط تعرض قالب KPI مستورد من متابعة إبداع الدورية.",
  },
  {
    pathPrefix: "/about-system",
    bannerAr: "استخدم الأقسام أدناه كمسار تدريب سريع للفريق عن الوحدات والمسؤوليات.",
  },
  {
    pathPrefix: "/equipment",
    bannerAr: "السجل المعروض يعتمد خط HOMAG الرسمي؛ أي مرجع SCM يظهر في صفحة حول النظام كمرجع تقني فقط.",
  },
  {
    pathPrefix: "/",
    bannerAr: "ابدأ من صفحة «حول النظام» لفهم الوحدات؛ لوحة التحكم تعطي ملخص أوامر الخشب الحالية.",
    toastAr: "مرحبًا — راجع «حول النظام» للتعريف التدريبي وسجل المعدات المعتمد.",
  },
];

function coachingMatch(pathname: string): CoachHint | undefined {
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
    if (!hint?.toastAr) return;
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem(toastStorageKey)) return;
    sessionStorage.setItem(toastStorageKey, "1");
    toast.push({ kind: "info", message: hint.toastAr, durationMs: 6500 });
  }, [hint, toast, toastStorageKey]);

  if (!hint || !bannerVisible) return null;

  const dismiss = () => {
    sessionStorage.setItem(bannerStorageKey, "1");
    setBannerVisible(false);
  };

  return (
    <div
      role="note"
      className={cn(
        "mb-4 sm:mb-6 flex gap-3 border border-brand-metal/40 bg-brand-elevated/90 px-3 py-3 sm:px-4 text-xs text-brand-luxury",
        "animate-in fade-in slide-in-from-top-2 duration-300",
      )}
    >
      <Info className="w-4 h-4 shrink-0 text-brand-metal mt-0.5" aria-hidden />
      <p className="flex-1 leading-relaxed" dir="rtl" lang="ar">
        {hint.bannerAr}
      </p>
      <button type="button" aria-label="Dismiss coaching banner" onClick={dismiss} className="text-brand-metal hover:text-brand-luxury shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
