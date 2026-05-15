import React from "react";
import { Languages } from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "../brand/BrandLogo";
import { ArabicText } from "../brand/ArabicText";
import { RouteCoach } from "../coaching/RouteCoach";
import { Sidebar } from "./Sidebar";
import { useDirection } from "../../lib/useDirection";

const pageEase = [0.22, 1, 0.36, 1] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const { direction, toggle } = useDirection();
  const [location] = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen bg-brand-black text-gray-300 font-industrial">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen ms-64 overflow-x-hidden">
          <motion.header
            layout={false}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: pageEase }}
            className="shrink-0 flex items-center justify-between gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 md:px-8 lg:px-10 border-b border-brand-border bg-brand-black/80 backdrop-blur-sm sticky top-0 z-40 max-w-[1680px] mx-auto w-full"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 520, damping: 28 }}
                className="shrink-0"
              >
                <Link href="/">
                  <a
                    href="/"
                    className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-wood"
                    aria-label="الصفحة الرئيسية — لوحة التحكم"
                  >
                    <BrandLogo className="h-10 sm:h-11 w-auto max-h-11 max-w-[140px] sm:max-w-[180px] shrink-0 object-contain object-start" />
                  </a>
                </Link>
              </motion.div>
              <div className="h-8 w-px bg-brand-border shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">
                  GL Dashboard
                </p>
                <p
                  className="text-[8px] sm:text-[9px] text-brand-metal/70 leading-snug line-clamp-2 sm:line-clamp-1"
                  title="The Grand Line Minimal Production Dashboard"
                >
                  The Grand Line Minimal Production Dashboard
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={toggle}
              aria-label="Toggle direction"
              className="industrial-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 480, damping: 26 }}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{direction === "ltr" ? "RTL · عربي" : "LTR · English"}</span>
            </motion.button>
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
            className="shrink-0 border-t border-brand-border px-4 py-4 sm:px-6 md:px-8 lg:px-10 max-w-[1680px] mx-auto w-full bg-brand-black/90 backdrop-blur-sm text-center text-[10px] text-brand-metal space-y-2"
            role="contentinfo"
          >
            <p dir="rtl" lang="ar" className="font-arabic text-brand-luxury/95 leading-relaxed">
              <span className="text-brand-metal">قام بإعداده </span>
              <a
                href="https://yasserious.com"
                className="font-bold text-brand-luxury hover:text-brand-wood transition-colors duration-200 underline-offset-2 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yasserious.com
              </a>
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-brand-metal">
              <span className="uppercase tracking-widest">Created by </span>
              <a
                href="https://yasserious.com"
                className="font-bold text-brand-luxury hover:text-brand-wood transition-colors duration-200 uppercase tracking-widest hover:underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yasserious.com
              </a>
              <span className="text-brand-border">·</span>
              <ArabicText className="normal-case tracking-normal max-w-xl">
                صُمِّم لمصنع إبداع — تعريف النظام من صفحة «حول النظام»
              </ArabicText>
            </p>
          </motion.footer>
        </div>
      </div>
    </MotionConfig>
  );
}
