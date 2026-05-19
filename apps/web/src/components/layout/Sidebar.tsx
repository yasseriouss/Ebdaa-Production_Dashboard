import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardCheck,
  Layers,
  Calendar,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trees,
  Cpu,
  Plus,
  Globe2,
  ScanSearch,
  BookOpen,
  Waypoints,
  Factory,
  Shield,
  Settings,
  LineChart,
  Building2,
  Users,
  Map,
  FileUp,
  UserCheck,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useDirection } from "../../lib/useDirection";
import { useTranslation } from "../../context/I18nContext";
import { usePermissions } from "../../context/PermissionContext";
import { ROUTE_REQUIRED_PERMISSION } from "../../lib/routePermissions";
import { useSidebarCollapse } from "../../context/SidebarCollapseContext";
import type { Translate } from "../../context/I18nContext";

type NavIcon = React.ElementType;

type NavSub = { id: string; labelKey: string; href: string; icon: NavIcon };

type NavEntry =
  | { kind: "leaf"; id: string; labelKey: string; href: string; icon: NavIcon }
  | {
      kind: "group";
      id: string;
      labelKey: string;
      icon: NavIcon;
      children: NavSub[];
    };

const NAV_DEF: NavEntry[] = [
  { kind: "leaf", id: "dashboard", labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  {
    kind: "leaf",
    id: "productionHub",
    labelKey: "nav.productionHub",
    href: "/production",
    icon: Factory,
  },
  { kind: "leaf", id: "departments", labelKey: "nav.departments", href: "/departments", icon: Building2 },
  {
    kind: "group",
    id: "dailyProduction",
    labelKey: "nav.groups.dailyProduction",
    icon: ClipboardCheck,
    children: [
      { id: "dm", labelKey: "nav.metalFactory", href: "/daily/metal", icon: Cpu },
      { id: "dw", labelKey: "nav.woodFactory", href: "/daily/wood", icon: Trees },
    ],
  },
  {
    kind: "group",
    id: "projects",
    labelKey: "nav.groups.projects",
    icon: Layers,
    children: [
      { id: "ph", labelKey: "nav.projectsHub", href: "/projects/hub", icon: Layers },
      { id: "pj", labelKey: "nav.jointProjects", href: "/projects/joint", icon: Layers },
      { id: "pn", labelKey: "nav.newProject", href: "/projects/new", icon: Plus },
      { id: "pw", labelKey: "nav.woAnalysis", href: "/projects/work-order-analysis", icon: ScanSearch },
    ],
  },
  {
    kind: "leaf",
    id: "workforce",
    labelKey: "nav.workforce",
    href: "/workforce",
    icon: UserCheck,
  },
  {
    kind: "leaf",
    id: "planning",
    labelKey: "nav.planning",
    href: "/planning",
    icon: Calendar,
  },
  {
    kind: "leaf",
    id: "workflowRouting",
    labelKey: "nav.workflowRouting",
    href: "/workflow-routing",
    icon: Waypoints,
  },
  { kind: "leaf", id: "equipment", labelKey: "nav.equipment", href: "/equipment", icon: Factory },
  {
    kind: "leaf",
    id: "importExport",
    labelKey: "nav.importExport",
    href: "/import-export",
    icon: FileUp,
  },
  {
    kind: "group",
    id: "analytics",
    labelKey: "nav.groups.analytics",
    icon: BarChart3,
    children: [
      { id: "ax-multi", labelKey: "nav.multiFactory", href: "/analytics", icon: Globe2 },
      { id: "ax-wood", labelKey: "nav.woodAnalytics", href: "/analytics/wood", icon: Trees },
      { id: "ax-metal", labelKey: "nav.metalAnalytics", href: "/analytics/metal", icon: Cpu },
    ],
  },
  {
    kind: "group",
    id: "auditPerf",
    labelKey: "nav.groups.auditPerf",
    icon: LineChart,
    children: [
      { id: "au-log", labelKey: "nav.auditLog", href: "/audit-log", icon: Shield },
      { id: "pd", labelKey: "nav.perfDepartments", href: "/performance/departments", icon: Activity },
      { id: "pp", labelKey: "nav.perfPeople", href: "/performance/people", icon: Users },
    ],
  },
  {
    kind: "leaf",
    id: "projectAnalytics",
    labelKey: "nav.projectAnalytics",
    href: "/project-analytics",
    icon: Activity,
  },
  {
    kind: "group",
    id: "settings",
    labelKey: "nav.settings",
    icon: Settings,
    children: [
      { id: "about", labelKey: "nav.aboutTraining", href: "/about-system", icon: BookOpen },
      { id: "permissions", labelKey: "nav.permissionsAdmin", href: "/admin/permissions", icon: Shield },
    ],
  },
  { kind: "leaf", id: "devmap", labelKey: "nav.devToolsMap", href: "/dev/tools", icon: Map },
];

function SubmenuFlyout({
  flyout,
  rtl,
  location,
  subs,
  onPick,
  t,
}: {
  flyout: { key: string; rect: DOMRect };
  rtl: boolean;
  location: string;
  subs: NavSub[];
  onPick: () => void;
  t: Translate;
}) {
  if (subs.length === 0) return null;
  const vw = document.documentElement.clientWidth;
  const top = Math.max(8, Math.min(flyout.rect.top, window.innerHeight - 260));
  const style: React.CSSProperties = {
    position: "fixed",
    top,
    right: vw - flyout.rect.left + 8,
    width: 220,
    zIndex: 60,
  };
  return (
    <div
      className="rounded-sm border border-brand-border bg-brand-elevated py-2 shadow-xl"
      style={style}
      role="menu"
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {subs.map((sub) => {
        const active = location === sub.href;
        const label = t(sub.labelKey);
        return (
          <Link
            key={sub.href}
            href={sub.href}
            className={cn(
              "flex items-start gap-2 px-3 py-2 font-bold hover:bg-brand-border/80 rounded-sm",
              active ? "text-brand-luxury bg-brand-border/30" : "text-brand-metal",
            )}
            onClick={onPick}
          >
            <sub.icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", active ? "text-brand-wood" : "")} />
            <span
              className={cn(
                "flex min-w-0 flex-1 truncate text-[11px] font-semibold leading-snug text-brand-luxury",
                rtl ? "text-end" : "text-start",
                !rtl && "uppercase tracking-wide",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const { direction } = useDirection();
  const { t } = useTranslation();
  const rtl = direction === "rtl";
  const [location] = useLocation();
  const { loading, unrestricted, keys } = usePermissions();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "dailyProduction",
    "projects",
    "analytics",
    "auditPerf",
  ]);

  const visibleNavItems = useMemo(() => {
    const gate = (href?: string) => {
      if (!href) return true;
      if (loading || unrestricted) return true;
      const req = ROUTE_REQUIRED_PERMISSION[href];
      if (!req) return true;
      return keys.has(req);
    };

    const out: NavEntry[] = [];
    for (const item of NAV_DEF) {
      if (item.kind === "group") {
        const children = item.children.filter((s) => gate(s.href));
        if (children.length === 0) continue;
        out.push({ ...item, children });
      } else if (gate(item.href)) {
        out.push(item);
      }
    }
    return out;
  }, [loading, unrestricted, keys]);

  const { collapsed, toggle: toggleCollapsed } = useSidebarCollapse();
  const [flyout, setFlyout] = useState<{ key: string; rect: DOMRect } | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (collapsed) setFlyout(null);
  }, [collapsed]);

  useEffect(() => {
    if (!flyout) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFlyout(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flyout]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const flyoutGroup = visibleNavItems.find((i) => i.kind === "group" && i.id === flyout?.key);

  return (
    <>
      {flyout ? (
        <button
          type="button"
          className="fixed inset-0 z-[45] cursor-default bg-black/25"
          aria-label={t("nav.closeMenu")}
          onClick={() => setFlyout(null)}
        />
      ) : null}
      {flyout && flyoutGroup?.kind === "group" ? (
        <SubmenuFlyout
          flyout={flyout}
          rtl={rtl}
          location={location}
          subs={flyoutGroup.children}
          t={t}
          onPick={() => setFlyout(null)}
        />
      ) : null}

      <motion.aside
        data-testid="layout-sidebar"
        ref={asideRef}
        dir={rtl ? "rtl" : "ltr"}
        lang={rtl ? "ar" : "en"}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "sticky top-0 z-40 flex h-screen shrink-0 flex-col overflow-x-visible overflow-y-hidden border-l border-brand-border bg-brand-elevated transition-[width] duration-200 ease-out",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "border-b border-brand-border flex shrink-0 items-center justify-center",
            collapsed ? "p-2" : "px-3 py-4",
          )}
        >
          <button
            type="button"
            onClick={toggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-md text-brand-metal transition-colors hover:bg-brand-border hover:text-brand-luxury focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood"
            aria-expanded={!collapsed}
            title={collapsed ? t("nav.expandMenu") : t("nav.collapseMenu")}
          >
            {collapsed ? (
              <ChevronsLeft className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronsRight className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        <nav
          className={cn(
            "flex flex-1 min-h-0 flex-col overflow-y-auto py-3",
            collapsed ? "items-center gap-1 px-1" : "space-y-1 px-3",
          )}
          dir={rtl ? "rtl" : "ltr"}
        >
          {visibleNavItems.map((item) => {
            const isExpanded = expandedItems.includes(item.id);
            const hasSubItems = item.kind === "group" && item.children.length > 0;
            const isActive = item.kind === "leaf" && location === item.href;
            const label = t(item.labelKey);

            return (
              <div key={item.id} className={cn("w-full", !collapsed && "space-y-1")}>
                {hasSubItems ? (
                  collapsed ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                        setFlyout((prev) => (prev?.key === item.id ? null : { key: item.id, rect: r }));
                      }}
                      className={cn(
                        "mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-brand-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood",
                        flyout?.key === item.id ? "bg-brand-border text-brand-luxury" : "text-brand-metal hover:text-brand-luxury",
                      )}
                      title={label}
                    >
                      <item.icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 text-xs font-bold rounded-sm transition-[background-color,color,transform] duration-200 ease-out hover:bg-brand-border active:scale-[0.99] motion-reduce:active:scale-100 group",
                        !rtl && "uppercase tracking-widest",
                        isExpanded ? "text-brand-luxury" : "text-brand-metal",
                      )}
                    >
                      <div className={cn("flex min-w-0 flex-1 items-center gap-3", rtl && "justify-start")}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[13px] font-semibold leading-tight text-brand-luxury",
                            rtl ? "text-end" : "text-start",
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      ) : direction === "rtl" ? (
                        <ChevronLeft className="w-3 h-3 shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      )}
                    </button>
                  )
                ) : item.kind !== "leaf" ? null : collapsed ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-200 ease-out hover:bg-brand-border active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood motion-reduce:active:scale-100",
                      isActive ? "nav-item-active text-brand-luxury" : "text-brand-metal hover:text-brand-luxury",
                    )}
                    title={label}
                  >
                    <item.icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} />
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full min-w-0 items-center gap-3 p-3 text-xs font-bold rounded-sm transition-[background-color,color,transform] duration-200 ease-out hover:bg-brand-border active:scale-[0.99] motion-reduce:active:scale-100 group",
                      !rtl && "uppercase tracking-widest",
                      isActive ? "nav-item-active text-brand-luxury" : "text-brand-metal",
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-brand-luxury text-start">
                      {label}
                    </span>
                  </Link>
                )}

                <AnimatePresence initial={false}>
                  {item.kind === "group" && isExpanded && !collapsed ? (
                    <motion.div
                      key={`sub-${item.id}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "space-y-1 mt-1 pb-0.5",
                          rtl ? "me-4 pe-4 border-e border-brand-border" : "ms-4 ps-4 border-s border-brand-border",
                        )}
                      >
                        {item.children.map((sub) => {
                          const isSubActive = location === sub.href;
                          const subLabel = t(sub.labelKey);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "flex w-full items-center gap-3 p-2 text-[11px] font-bold rounded-sm transition-[color,transform] duration-200 hover:text-brand-luxury active:scale-[0.99] motion-reduce:active:scale-100 group",
                                !rtl && "uppercase tracking-wider",
                                isSubActive ? "text-brand-luxury" : "text-brand-metal",
                              )}
                            >
                              <sub.icon
                                className={cn(
                                  "w-3 h-3 shrink-0",
                                  isSubActive ? "text-brand-wood" : "text-brand-metal",
                                )}
                              />
                              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-tight text-start">
                                {subLabel}
                              </span>
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

        <div className={cn("mt-auto border-t border-brand-border shrink-0", collapsed ? "space-y-2 p-2" : "space-y-3 p-4")}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            dir={rtl ? "rtl" : "ltr"}
            className={cn(
              "flex items-center glass-panel cursor-default border-brand-border",
              collapsed ? "justify-center p-2" : "gap-3 p-3",
            )}
          >
            <div className="w-8 h-8 rounded-full bg-brand-border flex items-center justify-center text-[10px] font-bold text-brand-luxury shrink-0">
              YA
            </div>
            {!collapsed ? (
              <div className={cn("flex-1 overflow-hidden min-w-0", rtl && "text-end")}>
                <p
                  className={cn(
                    "text-[10px] font-bold text-brand-luxury truncate",
                    rtl ? "font-arabic" : "tracking-wide",
                  )}
                >
                  {t("nav.adminName")}
                </p>
                <p className="text-[8px] text-brand-metal tracking-wide font-arabic normal-case">{t("nav.adminRole")}</p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
