import { useState } from "react";

const risks = [
  { id: "backup", ar: "فقدان ملف SQLite", en: "Single-file DB — enforce backups + restore drills" },
  { id: "secret", ar: "تسريب JWT / مفاتيح", en: "Secrets only in env — rotate on staff changes" },
  { id: "perf", ar: "استعلامات ثقيلة", en: "Measure on real data — indexes + pagination" },
  { id: "adoption", ar: "مقاومة تغيير وسير عمل", en: "Training + super-users on each shift" },
];

export default function Slide25Risks() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>RISKS · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>المخاطر والاعتمادية</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.25vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>قائمة تحقق تفاعلية لمدير المشروع</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.55vw", color: "#94a3b8", marginTop: "1vh" }}>Toggle mitigations as reviewed</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ flex: 1, marginTop: "2.4vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.6vw", minHeight: 0, overflow: "auto" }}>
          {risks.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              style={{
                textAlign: "start",
                borderRadius: "1vw",
                border: done[r.id] ? "0.12vw solid rgba(74,222,128,0.45)" : "0.1vw solid rgba(245,158,11,0.2)",
                background: done[r.id] ? "rgba(74,222,128,0.08)" : "rgba(30,58,95,0.45)",
                padding: "2.4vh 2.2vw",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "2vw", alignItems: "baseline" }}>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.75vw", color: done[r.id] ? "#4ade80" : "#f59e0b" }}>{r.ar}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.1vw", color: "#64748b" }}>{done[r.id] ? "MITIGATED ✓" : "OPEN"}</div>
              </div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.3vw", color: "#94a3b8", marginTop: "1.1vh", lineHeight: 1.45 }}>{r.en}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: "2vh", fontFamily: "Tajawal, sans-serif", fontSize: "1.2vw", color: "#64748b" }}>هذه القائمة لا تحل محل ضبط الجودة أو المراجعة القانونية — إنما تساعد الفريق على عدم نسيان أساسيات التشغيل.</div>
      </div>
    </div>
  );
}
