import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  Layers,
  Calendar,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight,
  Trees,
  Cpu,
  Plus,
  Globe2,
  ScanSearch,
  BookOpen,
  Factory,
} from "lucide-react";
import { ArabicText } from "../brand/ArabicText";
import { BrandLogo } from "../brand/BrandLogo";
import { cn } from "../../lib/cn";

interface NavItem {
  title: string;
  arabicTitle: string;
  icon: React.ElementType;
  href?: string;
  subItems?: { title: string; arabicTitle: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    arabicTitle: "لوحة التحكم",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Production Orders",
    arabicTitle: "أوامر الإنتاج",
    icon: Package,
    subItems: [
      { title: "Metal Factory", arabicTitle: "مصنع المعادن", href: "/orders/metal", icon: Cpu },
      { title: "Wood Factory", arabicTitle: "مصنع الأخشاب", href: "/orders/wood", icon: Trees },
    ],
  },
  {
    title: "Daily Production",
    arabicTitle: "الإنتاج اليومي",
    icon: ClipboardCheck,
    subItems: [
      { title: "Metal Factory", arabicTitle: "مصنع المعادن", href: "/daily/metal", icon: Cpu },
      { title: "Wood Factory", arabicTitle: "مصنع الأخشاب", href: "/daily/wood", icon: Trees },
    ],
  },
  {
    title: "Projects",
    arabicTitle: "المشاريع",
    icon: Layers,
    subItems: [
      { title: "Joint Projects", arabicTitle: "المشاريع المشتركة", href: "/projects/joint", icon: Layers },
      { title: "New Project", arabicTitle: "مشروع جديد", href: "/projects/new", icon: Plus },
      {
        title: "WO Analysis",
        arabicTitle: "تحليل أوامر الشغل",
        href: "/projects/work-order-analysis",
        icon: ScanSearch,
      },
    ],
  },
  {
    title: "Planning & Scheduling",
    arabicTitle: "التخطيط والجدولة",
    icon: Calendar,
    href: "/planning",
  },
  {
    title: "About & Training",
    arabicTitle: "حول النظام والتدريب",
    icon: BookOpen,
    href: "/about-system",
  },
  {
    title: "Equipment",
    arabicTitle: "سجل المعدات",
    icon: Factory,
    href: "/equipment",
  },
  {
    title: "Analytics",
    arabicTitle: "التحليلات",
    icon: BarChart3,
    subItems: [
      { title: "Multi-Factory", arabicTitle: "متعدد المصانع", href: "/analytics", icon: Globe2 },
      { title: "Wood Analytics", arabicTitle: "تحليلات الأخشاب", href: "/analytics/wood", icon: Trees },
      { title: "Metal Analytics", arabicTitle: "تحليلات المعادن", href: "/analytics/metal", icon: Cpu },
    ],
  },
  {
    title: "Project Analytics",
    arabicTitle: "تحليلات المشاريع",
    icon: Activity,
    href: "/project-analytics",
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Production Orders",
    "Daily Production",
    "Projects",
    "Analytics",
  ]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="w-64 h-screen bg-brand-elevated border-e border-brand-border flex flex-col fixed start-0 top-0 z-50"
    >
      <div className="p-6 border-b border-brand-border flex flex-col gap-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
          className="block"
        >
          <Link href="/">
            <a
              href="/"
              className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-wood"
              aria-label="الصفحة الرئيسية — لوحة التحكم"
            >
              <BrandLogo className="h-12 w-full max-h-12 object-contain object-start" />
            </a>
          </Link>
        </motion.div>
        <div>
          <h1 className="text-sm font-bold tracking-tighter uppercase leading-none">GL Dashboard</h1>
          <p className="text-[9px] text-brand-metal font-bold tracking-wide uppercase mt-1 leading-snug">
            The Grand Line Minimal Production Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isActive = location === item.href;

          return (
            <div key={item.title} className="space-y-1">
              {hasSubItems ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-[background-color,color,transform] duration-200 ease-out hover:bg-brand-border active:scale-[0.99] motion-reduce:active:scale-100 group",
                    isExpanded ? "text-brand-luxury" : "text-brand-metal"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>{item.title}</span>
                      <ArabicText className="text-[10px] font-medium normal-case opacity-50">
                        {item.arabicTitle}
                      </ArabicText>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              ) : (
                <Link href={item.href || "#"}>
                  <a className={cn(
                    "flex items-center gap-3 p-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-[background-color,color,transform] duration-200 ease-out hover:bg-brand-border active:scale-[0.99] motion-reduce:active:scale-100 group",
                    isActive ? "nav-item-active text-brand-luxury" : "text-brand-metal"
                  )}>
                    <item.icon className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>{item.title}</span>
                      <ArabicText className="text-[10px] font-medium normal-case opacity-50">
                        {item.arabicTitle}
                      </ArabicText>
                    </div>
                  </a>
                </Link>
              )}

              <AnimatePresence initial={false}>
                {hasSubItems && isExpanded ? (
                  <motion.div
                    key={`sub-${item.title}`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="ms-4 ps-4 border-s border-brand-border space-y-1 mt-1 pb-0.5">
                      {item.subItems?.map((sub) => {
                        const isSubActive = location === sub.href;
                        return (
                          <Link key={sub.href} href={sub.href}>
                            <a className={cn(
                              "flex items-center gap-3 p-2 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-[color,transform] duration-200 hover:text-brand-luxury active:scale-[0.99] motion-reduce:active:scale-100 group",
                              isSubActive ? "text-brand-luxury" : "text-brand-metal"
                            )}>
                              <sub.icon className={cn("w-3 h-3", isSubActive ? "text-brand-wood" : "text-brand-metal")} />
                              <div className="flex flex-col items-start">
                                <span>{sub.title}</span>
                                <ArabicText className="text-[9px] font-medium normal-case opacity-50">
                                  {sub.arabicTitle}
                                </ArabicText>
                              </div>
                            </a>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-brand-border space-y-3">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center gap-3 p-3 glass-panel cursor-default border-brand-border"
        >
          <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center text-[10px] font-bold text-brand-luxury shrink-0">
            YA
          </div>
          <div className="flex-1 overflow-hidden min-w-0">
            <p className="text-[10px] font-bold text-brand-luxury truncate">Yasserious</p>
            <p className="text-[8px] text-brand-metal uppercase tracking-widest">Administrator</p>
          </div>
        </motion.div>
        <p
          dir="rtl"
          lang="ar"
          className="text-center text-[10px] leading-relaxed text-brand-metal font-arabic px-1"
        >
          قام بإعداده{" "}
          <a
            href="https://yasserious.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-luxury hover:text-brand-wood transition-colors duration-200 underline-offset-2 hover:underline"
          >
            Yasserious.com
          </a>
        </p>
      </div>
    </motion.aside>
  );
}
