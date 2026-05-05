import { useEffect, useState } from "react";

const base = import.meta.env.BASE_URL;

interface TitleStats {
  metalTotalOrders: number;
  woodenTotalOrders: number;
}

const FALLBACK: TitleStats = {
  metalTotalOrders: 17,
  woodenTotalOrders: 128,
};

export default function Slide01Title() {
  const [stats, setStats] = useState<TitleStats>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard/stats", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data: TitleStats) => {
        setStats({
          metalTotalOrders: data.metalTotalOrders ?? FALLBACK.metalTotalOrders,
          woodenTotalOrders: data.woodenTotalOrders ?? FALLBACK.woodenTotalOrders,
        });
        setLive(true);
      })
      .catch(() => {
        // keep fallback values
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0e1628" }}>
      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Factory background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.22 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0e1628 0%, rgba(14,22,40,0.7) 60%, #162040 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[0.4vh]" style={{ background: "rgba(245,158,11,0.3)" }} />

      <div className="relative flex flex-col items-center justify-center w-full h-full px-[8vw]">
        <div className="mb-[3vh]" style={{ color: "#f59e0b", fontSize: "1.6vw", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "1vw" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>ENCID FACTORIES · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>مصانع إبداع</span>
          <span style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.9vw",
            fontWeight: 500,
            letterSpacing: "0.1em",
            color: live ? "#4ade80" : "#64748b",
            background: live ? "rgba(74,222,128,0.1)" : "rgba(100,116,139,0.1)",
            border: `0.05vw solid ${live ? "rgba(74,222,128,0.3)" : "rgba(100,116,139,0.3)"}`,
            borderRadius: "9999px",
            padding: "0.2vh 0.8vw",
          }}>
            {live ? "● LIVE" : "● STATIC"}
          </span>
        </div>

        <div className="text-center" style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "5.5vw", color: "#f1f5f9", lineHeight: 1.15, textWrap: "balance" }}>
          نظام إدارة مصنعي إبداع للأثاث
        </div>

        <div className="mt-[2vh] mb-[4vh]" style={{ width: "12vw", height: "0.4vh", background: "linear-gradient(90deg, #f59e0b, transparent)" }} />

        <div className="text-center" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, fontSize: "2.4vw", color: "#94a3b8", textWrap: "balance" }}>
          Ebdaa Furniture Factory Management System
        </div>

        <div className="mt-[5vh] flex gap-[4vw]">
          <div className="text-center">
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "3vw", color: "#f59e0b" }}>2</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>مصنع</div>
          </div>
          <div style={{ width: "0.15vw", background: "rgba(245,158,11,0.4)", alignSelf: "stretch" }} />
          <div className="text-center">
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "3vw", color: "#f59e0b" }}>{stats.metalTotalOrders}</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>مرحلة معدنية</div>
          </div>
          <div style={{ width: "0.15vw", background: "rgba(245,158,11,0.4)", alignSelf: "stretch" }} />
          <div className="text-center">
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "3vw", color: "#f59e0b" }}>{stats.woodenTotalOrders}+</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>أمر خشبي</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[4vw]" style={{ fontSize: "1.5vw", color: "rgba(148,163,184,0.6)" }}>
        <span style={{ fontFamily: "DM Sans, sans-serif" }}>2026 · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>نظام إدارة المصانع المتكامل</span>
      </div>
    </div>
  );
}
