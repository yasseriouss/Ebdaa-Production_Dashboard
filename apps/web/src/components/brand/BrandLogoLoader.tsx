import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { cn } from "../../lib/cn";

export function BrandLogoLoader({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 p-10 rounded-sm border border-brand-border bg-brand-elevated/95 backdrop-blur-md shadow-xl",
        className,
      )}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {reduceMotion ? (
        <BrandLogo className="h-16 w-auto max-w-[220px] object-contain opacity-90" />
      ) : (
        <motion.div
          animate={{ opacity: [0.72, 1, 0.72], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
        >
          <BrandLogo className="h-16 w-auto max-w-[220px] object-contain" />
        </motion.div>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function BrandLogoOverlay({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/55 backdrop-blur-[2px] p-6">
      <BrandLogoLoader label={label} />
    </div>
  );
}
