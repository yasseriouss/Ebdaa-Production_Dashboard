import { useQuery } from "@tanstack/react-query";
import { Cpu } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { apiJson } from "../lib/api/client";

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
          Metal factory orders
        </h1>
        <ArabicText className="text-brand-metal mt-1">أوامر مصنع المعادن — مصدر البيانات</ArabicText>
        <p className="text-[10px] text-brand-metal mt-3 max-w-3xl leading-relaxed">
          Contract path: <code className="text-brand-luxury">GET /api/metal/orders</code> on the API server. No{" "}
          <code className="text-brand-luxury">fh_metal_*</code> hub layer yet; the legacy SQLite model stays the HTTP contract.
        </p>
      </header>

      {isLoading ? (
        <p className="text-xs text-brand-metal">Loading…</p>
      ) : isError ? (
        <p className="text-xs text-brand-error">
          {error instanceof Error ? error.message : "Failed to load orders"} — Is the API running on port 8787?
        </p>
      ) : (
        <div className="overflow-x-auto glass-panel border border-brand-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-brand-border text-[10px] uppercase tracking-widest text-brand-metal">
              <tr>
                <th className="p-3">MO</th>
                <th className="p-3">Project</th>
                <th className="p-3">Client</th>
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Status</th>
                <th className="p-3">%</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-brand-border/60 hover:bg-brand-border/20">
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
