import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArabicText } from "../components/brand/ArabicText";
import { apiJson } from "../lib/api/client";

type DeptRow = {
  departmentId: string;
  departmentName: string;
  factoryId: string;
  employeeCount: number;
  machineTaskCount: number;
};

type Payload = {
  departments: DeptRow[];
  throughput: { woodQtyDoneSum: string; metalQtyDoneSum: string };
};

export default function PerformanceDepartments() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["performance", "departments"],
    queryFn: () => apiJson<Payload>("/api/performance/departments"),
  });

  const chartData = (data?.departments ?? []).map((d) => ({
    name: d.departmentName.slice(0, 14),
    employees: d.employeeCount,
    stations: d.machineTaskCount,
  }));

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase">Department performance</h1>
        <ArabicText className="text-brand-metal mt-1">أداء الأقسام</ArabicText>
        {data?.throughput ? (
          <p className="text-[10px] text-brand-metal mt-2 font-mono" dir="ltr">
            Σ wood qty_done (legacy stages): {data.throughput.woodQtyDoneSum} · Σ metal qty_done:{" "}
            {data.throughput.metalQtyDoneSum}
          </p>
        ) : null}
      </header>

      {isLoading ? <p className="text-xs text-brand-metal">Loading…</p> : null}
      {isError ? <p className="text-xs text-brand-error">Failed to load (check performance permissions).</p> : null}

      <div className="glass-panel p-4 border border-brand-border h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 4, bottom: 32 }}>
            <XAxis dataKey="name" stroke="#71717A" fontSize={9} tickLine={false} angle={-18} textAnchor="end" height={52} />
            <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
            />
            <Bar dataKey="employees" fill="#D97706" name="Employees" />
            <Bar dataKey="stations" fill="#71717A" name="Stations" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
