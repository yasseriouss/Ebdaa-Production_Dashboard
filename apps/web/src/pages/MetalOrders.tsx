import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import { useLocation } from "wouter";
import { apiJson } from "../lib/api/client";
import { useTranslation } from "../context/I18nContext";

type MetalOrder = {
  id: string;
  moNumber: string;
  project: string;
  client: string;
  product: string;
  qty: string;
  status: string;
  completionPct: string;
};

export default function MetalOrders() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const openDetail = (id: string) =>
    navigate(`/orders/metal/${encodeURIComponent(id)}`);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["metal", "orders"],
    queryFn: () => apiJson<MetalOrder[]>("/api/metal/orders"),
    staleTime: 20_000,
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Cpu className="w-6 h-6 text-brand-luxury" />
          {t("pages.metalOrders.title")}
        </h1>
        <p className="text-sm text-brand-metal mt-1">{t("pages.metalOrders.subtitle")}</p>
        <p className="text-[10px] text-brand-metal mt-3 max-w-3xl leading-relaxed" dir="ltr" lang="en">
          {t("pages.metalOrders.contractHint")}
        </p>
      </header>

      {isLoading ? (
        <p className="text-xs text-brand-metal">{t("common.loading")}</p>
      ) : isError ? (
        <p className="text-xs text-brand-error">
          {error instanceof Error ? error.message : t("pages.metalOrders.loadFail")}
        </p>
      ) : (
        <div className="overflow-x-auto glass-panel border border-brand-border">
          <table className="w-full text-start text-xs">
            <thead className="border-b border-brand-border text-[10px] uppercase tracking-widest text-brand-metal">
              <tr>
                <th className="p-3">{t("pages.metalOrders.colMo")}</th>
                <th className="p-3">{t("pages.metalOrders.colProject")}</th>
                <th className="p-3">{t("pages.metalOrders.colClient")}</th>
                <th className="p-3">{t("pages.metalOrders.colProduct")}</th>
                <th className="p-3">{t("pages.metalOrders.colQty")}</th>
                <th className="p-3">{t("pages.metalOrders.colStatus")}</th>
                <th className="p-3">{t("pages.metalOrders.colPct")}</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  className="border-b border-brand-border/60 hover:bg-brand-border/20 cursor-pointer"
                  onClick={() => openDetail(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(row.id);
                    }
                  }}
                >
                  <td className="p-3 font-mono text-brand-luxury">{row.moNumber}</td>
                  <td className="p-3">{row.project}</td>
                  <td className="p-3">{row.client}</td>
                  <td className="p-3">{row.product}</td>
                  <td className="p-3">{row.qty}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">{row.completionPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
