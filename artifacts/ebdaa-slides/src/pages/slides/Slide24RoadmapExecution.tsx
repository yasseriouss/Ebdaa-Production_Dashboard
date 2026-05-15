import { useMemo, useState } from "react";

const phases = [
  {
    key: "hardening",
    ar: "تثبيت وجودة",
    en: "Stabilize typecheck/build, reduce flaky dev assumptions",
    weeks: "1–2",
    items: ["تمرير ‎pnpm run typecheck‎ بثبات", "توثيق تشغيل ‎api-server‎ + ‎factory-app‎"],
  },
  {
    key: "security",
    ar: "أمن الإنتاج",
    en: "JWT required + disable anonymous unrestricted paths",
    weeks: "1–3",
    items: ["‎JWT_SECRET‎ إلزامي في الإنتاج", "‎AUTH_ANONYMOUS_UNRESTRICTED=false‎", "تدقيق ‎requirePermission‎ على الكتابة"],
  },
  {
    key: "data",
    ar: "البيانات والنشر",
    en: "LibSQL/Turso readiness + backup discipline",
    weeks: "2–4",
    items: ["خطة ‎rfc-libsql-migration‎", "نسخ احتياطي لـ SQLite", "مراقبة أداء الاستعلامات"],
  },
];

export default function Slide24RoadmapExecution() {
  const [i, setI] = useState(0);
  const phase = phases[i];
  const disclaimer = useMemo(
    () => "تقديرات مدّية إرشادية فقط — تتأثر بموارد الفريق والاعتمادات الخارجية.",
    [],
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>EXECUTION · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>خارطة طريق تنفيذية</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.1vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>مراحل واعية للوصول إلى إنتاج جاد</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.45vw", color: "#94a3b8", marginTop: "1vh" }}>{disclaimer}</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", gap: "1vw", marginTop: "2.3vh", flexWrap: "wrap" }}>
          {phases.map((p, idx) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setI(idx)}
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontWeight: 900,
                fontSize: "1.25vw",
                padding: "1vh 1.6vw",
                borderRadius: "999px",
                border: idx === i ? "0.12vw solid rgba(245,158,11,0.65)" : "0.1vw solid rgba(148,163,184,0.2)",
                background: idx === i ? "rgba(245,158,11,0.14)" : "rgba(30,58,95,0.35)",
                color: idx === i ? "#f59e0b" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              {p.ar}{" "}
              <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.05vw", color: "#64748b" }}>(~{p.weeks}w)</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, marginTop: "2.3vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.3vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "3vh 2.6vw" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.25vw", color: "#f59e0b", letterSpacing: "0.12em" }}>PHASE</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "2.6vw", color: "#f1f5f9", marginTop: "1vh" }}>{phase.ar}</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.45vw", color: "#94a3b8", marginTop: "1.2vh", lineHeight: 1.45 }}>{phase.en}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "3vh 2.6vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.75vw", color: "#f59e0b", marginBottom: "1.4vh" }}>مخرجات متوقعة</div>
            <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.45vw", color: "#cbd5e1", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
              {phase.items.map((it) => (
                <li key={it} style={{ marginBottom: "1vh" }}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
