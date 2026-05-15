import { useState } from "react";

const modes = [
  {
    id: "orders",
    ar: "أوامر العمل",
    en: "Metal / wooden lists — open order detail.",
    routes: ["/metal/orders", "/wooden/orders"],
  },
  {
    id: "production",
    ar: "شاشات الإنتاج",
    en: "Stage grids — numeric completion tracking.",
    routes: ["/production", "order detail stage panels"],
  },
  {
    id: "rhythm",
    ar: "إيقاع اليوم",
    en: "Quick updates — fewer context switches than spreadsheets.",
    routes: ["status codes / quantities per stage"],
  },
];

export default function Slide21JourneyOperator() {
  const [mode, setMode] = useState(0);
  const m = modes[mode];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>JOURNEY · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>رحلة الفني / المشغّل</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.35vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>operator — دقة التحديث أهم من حجم الصلاحيات</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginTop: "1vh" }}>Switch modes — tap segments</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", gap: "1vw", marginTop: "2.5vh", flexWrap: "wrap" }}>
          {modes.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => setMode(i)}
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontWeight: 800,
                fontSize: "1.35vw",
                padding: "1.1vh 1.8vw",
                borderRadius: "999px",
                border: i === mode ? "0.12vw solid rgba(245,158,11,0.65)" : "0.1vw solid rgba(148,163,184,0.2)",
                background: i === mode ? "rgba(245,158,11,0.14)" : "rgba(30,58,95,0.35)",
                color: i === mode ? "#f59e0b" : "#94a3b8",
                cursor: "pointer",
              }}
            >
              {x.ar}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "3vh 2.8vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "2.7vw", color: "#f59e0b", marginBottom: "1.5vh" }}>{m.ar}</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8", lineHeight: 1.55 }}>{m.en}</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "3vh 2.8vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.85vw", color: "#f59e0b", marginBottom: "1.2vh" }}>مسارات مألوفة</div>
            <ul style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#cbd5e1", lineHeight: 1.7, paddingInlineStart: "1.2em", margin: 0 }}>
              {m.routes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div style={{ marginTop: "2.2vh", fontFamily: "Tajawal, sans-serif", fontSize: "1.35vw", color: "#64748b", lineHeight: 1.55 }}>
              بيئة عمل أوضح: أقل نسخ ولصق، وأقل سوء فهم لأرقام المراحل بين النوبات.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
