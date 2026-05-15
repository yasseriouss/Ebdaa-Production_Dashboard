import { useQuery } from "@tanstack/react-query";
import { ArabicText } from "../components/brand/ArabicText";
import { apiJson } from "../lib/api/client";

type Person = {
  employeeId: string;
  name: string;
  departmentName: string | null;
  auditActions30d: number;
};

export default function PerformancePeople() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["performance", "people"],
    queryFn: () => apiJson<{ people: Person[] }>("/api/performance/people?limit=80"),
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase">People performance</h1>
        <ArabicText className="text-brand-metal mt-1">مؤشر نشاط الأفراد (تدقيق 30 يوماً)</ArabicText>
        <p className="text-[10px] text-brand-metal mt-2">
          Uses <code className="text-brand-luxury">audit_events.actor_employee_id</code> when mutations carry an employee
          id. Sparse until user–employee linkage is populated.
        </p>
      </header>

      {isLoading ? <p className="text-xs text-brand-metal">Loading…</p> : null}
      {isError ? <p className="text-xs text-brand-error">Failed to load (check performance permissions).</p> : null}

      <div className="overflow-x-auto glass-panel border border-brand-border text-xs">
        <table className="w-full text-left">
          <thead className="border-b border-brand-border text-[10px] uppercase tracking-widest text-brand-metal">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Department</th>
              <th className="p-2">Audit actions (30d)</th>
            </tr>
          </thead>
          <tbody>
            {(data?.people ?? []).map((p) => (
              <tr key={p.employeeId} className="border-b border-brand-border/50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.departmentName ?? "—"}</td>
                <td className="p-2 font-mono">{p.auditActions30d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
