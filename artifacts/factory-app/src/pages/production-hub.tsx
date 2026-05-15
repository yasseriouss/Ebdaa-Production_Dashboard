import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Factory, Boxes, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import MetalOrders, { type MetalOrdersHandle } from "./metal-orders";
import MetalProduction from "./metal-production";
import WoodenOrders, { type WoodenOrdersHandle } from "./wooden-orders";
import WoodenProduction from "./wooden-production";
import SharedProjects from "./shared-projects";

const executiveTransition = { type: "spring" as const, damping: 30, stiffness: 200, mass: 1 };

type Tab = "wood" | "metal" | "both";
type SubTab = "orders" | "production";

const TABS: { id: Tab; label: string; icon: typeof Factory }[] = [
  { id: "wood", label: "المصنع الخشبي", icon: Boxes },
  { id: "metal", label: "المصنع المعدني", icon: Factory },
  { id: "both", label: "المصنعين معاً", icon: Layers },
];

export default function ProductionHub() {
  const [tab, setTab] = useState<Tab>("wood");
  const [subTab, setSubTab] = useState<SubTab>("orders");
  const woodenOrdersRef = useRef<WoodenOrdersHandle>(null);
  const metalOrdersRef = useRef<MetalOrdersHandle>(null);

  const showNewOrderCta = (tab === "wood" || tab === "metal") && subTab === "orders";

  return (
    <motion.div
      className="p-8 lg:p-12 space-y-8 max-w-(--breakpoint-2xl) mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={executiveTransition}
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">الإنتاج</h1>
        <p className="text-muted-foreground font-medium max-w-3xl leading-relaxed">
          إدارة أوامر الشغل والمتابعة اليومية لجميع المصانع.{" "}
          <span className="text-foreground/85">
            التسلسل في العمل: عميل واحد قد يملك عدة مشاريع، وكل مشروع يضم عدة أوامر شغل (تُسجَّل كمراجع منفصلة للمعدن أو الخشب).
          </span>
        </p>
      </header>

      {/* Main factory tabs + prominent new order (outside factory panels) */}
      <div className="flex flex-wrap gap-2 items-center">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); if (t.id === "both") setSubTab("orders"); }}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
              tab === t.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
        {showNewOrderCta && (
          <Button
            type="button"
            data-testid="btn-new-order-production-hub"
            className={cn(
              "mr-1 flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold border-0 shadow-lg transition-all duration-300",
              "bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-emerald-900/25",
              "hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-900/35",
              "focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            )}
            onClick={() => {
              if (tab === "wood") woodenOrdersRef.current?.openNewOrder();
              else metalOrdersRef.current?.openNewOrder();
            }}
          >
            <Plus className="h-4 w-4 shrink-0" />
            أمر تشغيل جديد
          </Button>
        )}
      </div>

      {/* Sub-tabs for individual factory views */}
      {tab !== "both" && (
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab("orders")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
              subTab === "orders" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
            )}
          >
            أوامر الشغل
          </button>
          <button
            onClick={() => setSubTab("production")}
            className={cn(
              "px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
              subTab === "production" ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
            )}
          >
            الإنتاج اليومي
          </button>
        </div>
      )}

      {/* Content */}
      <motion.div
        key={`${tab}-${subTab}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "wood" && subTab === "orders" && <WoodenOrders ref={woodenOrdersRef} />}
        {tab === "wood" && subTab === "production" && <WoodenProduction />}
        {tab === "metal" && subTab === "orders" && <MetalOrders ref={metalOrdersRef} />}
        {tab === "metal" && subTab === "production" && <MetalProduction />}
        {tab === "both" && <SharedProjects />}
      </motion.div>
    </motion.div>
  );
}
