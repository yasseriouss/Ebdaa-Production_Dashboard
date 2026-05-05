import { useEffect, useState } from "react";

interface DashboardStats {
  metalTotalOrders: number;
  woodenTotalOrders: number;
  metalBacklogTotal: number;
  woodenBacklogTotal: number;
  sharedProjectsCount: number;
  metalAvgCompletionPct: number;
  woodenAvgCompletionPct: number;
  metalActiveOrders: number;
  woodenActiveOrders: number;
}

const FALLBACK: DashboardStats = {
  metalTotalOrders: 17,
  woodenTotalOrders: 128,
  metalBacklogTotal: 54000,
  woodenBacklogTotal: 47000,
  sharedProjectsCount: 4,
  metalAvgCompletionPct: 62,
  woodenAvgCompletionPct: 55,
  metalActiveOrders: 10,
  woodenActiveOrders: 80,
};

function formatBacklog(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function Slide07Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard/stats", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data: DashboardStats) => {
        setStats(data);
        setLive(true);
      })
      .catch(() => {
        // keep fallback values
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const kpis = [
    { value: stats.metalTotalOrders, label: "أوامر معدني", color: "#f59e0b" },
    { value: stats.woodenTotalOrders, label: "أوامر خشبي", color: "#f59e0b" },
    { value: formatBacklog(stats.metalBacklogTotal), label: "متأخرات معدني", color: "#e87c1e" },
    { value: formatBacklog(stats.woodenBacklogTotal), label: "متأخرات خشبي", color: "#e87c1e" },
  ];

  const safeStats = {
    metalAvgCompletionPct: stats.metalAvgCompletionPct ?? FALLBACK.metalAvgCompletionPct,
    woodenAvgCompletionPct: stats.woodenAvgCompletionPct ?? FALLBACK.woodenAvgCompletionPct,
    metalActiveOrders: stats.metalActiveOrders ?? FALLBACK.metalActiveOrders,
    woodenActiveOrders: stats.woodenActiveOrders ?? FALLBACK.woodenActiveOrders,
    sharedProjectsCount: stats.sharedProjectsCount ?? FALLBACK.sharedProjectsCount,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "1vw" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>DASHBOARD &amp; KPIs · </span>
            <span style={{ fontFamily: "Tajawal, sans-serif" }}>لوحة التحكم</span>
            {!loading && (
              <span style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "0.9vw",
                fontWeight: 500,
                letterSpacing: "0.1em",
                color: live ? "#4ade80" : "#94a3b8",
                background: live ? "rgba(74,222,128,0.1)" : "rgba(148,163,184,0.1)",
                border: `0.05vw solid ${live ? "rgba(74,222,128,0.3)" : "rgba(148,163,184,0.3)"}`,
                borderRadius: "9999px",
                padding: "0.2vh 0.8vw",
              }}>
                {live ? "● LIVE" : "● STATIC"}
              </span>
            )}
          </div>
        </div>

        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          رؤية كاملة في لمحة واحدة
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          Management visibility across both factories at a glance
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "3vh" }} />

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "2.5vh" }}>
          {kpis.map((kpi) => (
            <div key={kpi.label} style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2vw", textAlign: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: kpi.color }}>
                {kpi.value}
              </div>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "0.8vh" }}>مؤشر الإنجاز</div>
            <div style={{ display: "flex", gap: "1.5vw", marginBottom: "0.8vh" }}>
              <div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#94a3b8" }}>Metal</div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>
                  {`${safeStats.metalAvgCompletionPct}%`}
                </div>
              </div>
              <div style={{ width: "0.1vw", background: "rgba(245,158,11,0.2)" }} />
              <div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#94a3b8" }}>Wood</div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>
                  {`${safeStats.woodenAvgCompletionPct}%`}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Average completion per factory, updated live</div>
          </div>

          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "0.8vh" }}>أوامر نشطة</div>
            <div style={{ display: "flex", gap: "1.5vw", marginBottom: "0.8vh" }}>
              <div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#94a3b8" }}>Metal</div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>
                  {safeStats.metalActiveOrders}
                </div>
              </div>
              <div style={{ width: "0.1vw", background: "rgba(245,158,11,0.2)" }} />
              <div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#94a3b8" }}>Wood</div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>
                  {safeStats.woodenActiveOrders}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Active orders in production across both factories</div>
          </div>

          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "0.8vh" }}>مشاريع مشتركة</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3vw", color: "#f1f5f9", marginBottom: "0.5vh" }}>
              {safeStats.sharedProjectsCount}
            </div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Cross-factory clients visible from one screen</div>
          </div>
        </div>
      </div>
    </div>
  );
}
