import React from "react";
import { Languages, BookOpen } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "../brand/BrandLogo";
import { RouteCoach } from "../coaching/RouteCoach";
import { Sidebar } from "./Sidebar";
import { AuthHeaderLinks } from "./AuthHeaderLinks";
import { useDirection } from "../../lib/useDirection";
import { cn } from "../../lib/cn";
import { ThemeToggle } from "../ThemeToggle";
import { useTranslation } from "../../context/I18nContext";

const pageEase = [0.22, 1, 0.36, 1] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const { direction, toggle } = useDirection();
  const { t } = useTranslation();
  const [location] = useLocation();
  const rtl = direction === "rtl";

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "flex min-h-screen w-full bg-brand-black font-industrial",
          rtl ? "flex-row" : "flex-row-reverse",
        )}
        dir={rtl ? "rtl" : "ltr"}
        lang={rtl ? "ar" : "en"}
      >
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <motion.header
            layout={false}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: pageEase }}
            className="shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 md:px-8 lg:px-10 border-b border-brand-border bg-brand-black/80 backdrop-blur-sm sticky top-0 z-40 max-w-[1680px] mx-auto w-full"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 520, damping: 28 }}
                className="shrink-0"
              >
                <Link
                  href="/"
                  className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-wood"
                  aria-label={`${t("layout.brandName")} — ${t("layout.homeAria")}`}
                >
                  <BrandLogo
                    alt={t("layout.brandName")}
                    className="h-10 sm:h-11 w-auto max-h-11 max-w-[140px] sm:max-w-[180px] shrink-0 object-contain object-start"
                  />
                </Link>
              </motion.div>
              <div className="h-8 w-px bg-brand-border shrink-0" aria-hidden />
              <div className="min-w-0 flex-1 text-start" lang={rtl ? "ar" : "en"} dir={rtl ? "rtl" : "ltr"}>
                <p
                  className={cn(
                    "text-[10px] sm:text-xs font-medium text-brand-metal/90 leading-snug line-clamp-2 sm:line-clamp-1",
                    rtl ? "font-arabic" : "tracking-wide",
                  )}
                >
                  {t("layout.brandTagline")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap justify-end">
              <ThemeToggle />
              <motion.button
                type="button"
                onClick={toggle}
                aria-label={t("layout.toggleDirAria")}
                className="industrial-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {direction === "ltr" ? t("layout.switchToRtl") : t("layout.switchToLtr")}
                </span>
              </motion.button>
              <AuthHeaderLinks />
            </div>
          </motion.header>
          <main
            className="flex-1 min-h-0 w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10 md:px-8 md:pt-8 md:pb-12 lg:px-10 lg:pb-14 max-w-[1680px] mx-auto"
            role="main"
          >
            <RouteCoach />
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                role="presentation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: pageEase }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: pageEase }}
            className="shrink-0 border-t border-brand-border px-4 py-4 sm:px-6 md:px-8 lg:px-10 max-w-[1680px] mx-auto w-full bg-brand-black/90 backdrop-blur-sm flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            role="contentinfo"
          >
            <Link
              href="/about-system"
              className={cn(
                "industrial-btn py-2 px-4 text-[11px] no-underline justify-center",
                rtl ? "font-arabic normal-case tracking-normal" : "uppercase tracking-wider",
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {t("layout.footerAbout")}
            </Link>
            <p
              className={cn(
                "text-[10px] sm:text-[11px] text-brand-metal leading-relaxed text-center max-w-xl",
                rtl && "font-arabic",
              )}
              dir={rtl ? "rtl" : "ltr"}
              lang={rtl ? "ar" : "en"}
            >
              {t("layout.footerCredit")}{" "}
              <a
                href="https://yasserious.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-luxury font-semibold underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood"
              >
                Yasserious.com
              </a>
            </p>
          </motion.footer>
        </div>
      </div>
    </MotionConfig>
  );
}
