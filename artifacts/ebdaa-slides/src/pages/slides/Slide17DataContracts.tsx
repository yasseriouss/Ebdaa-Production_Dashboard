import { useState } from "react";

const steps = [
  {
    title: "1 · الواجهة تستدعي REST",
    ar: "مكوّنات React تستخدم خطافات React Query على ‎/api/...‎ (بروكسي Vite في التطوير).",
    en: "TanStack Query + generated hooks from Orval",
  },
  {
    title: "2 · Express يوجّه الطلب",
    ar: "الموجّه الرئيسي يعلّق على ‎/api‎ ثم يوزّع إلى ملفات المسارات (معدن، خشب، لوحة، …).",
    en: "Thin routes → controllers → services",
  },
  {
    title: "3 · التحقق والمنطق",
    ar: "Zod يتحقق من المدخلات؛ الخدمات تنفّذ استعلامات Drizzle وترجع JSON موحّداً.",
    en: "Predictable JSON surfaces for the UI",
  },
  {
    title: "4 · العقد والتوليد",
    ar: "عند تغيير الـ OpenAPI: ‎pnpm --filter @workspace/api-spec run codegen‎ يحدّث العميل والأنواع.",
    en: "Contract-first iteration loop",
  },
];

export default function Slide17DataContracts() {
  const [idx, setIdx] = useState(0);
  const s = steps[idx];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>DATA PATH · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>مسار البيانات والعقود</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.5vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>من الشاشة إلى SQLite عبر عقد واضحة</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.65vw", color: "#94a3b8", marginTop: "1vh" }}>Click steps — interactive walkthrough</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            {steps.map((st, i) => (
              <button
                key={st.title}
                type="button"
                onClick={() => setIdx(i)}
                style={{
                  textAlign: "start",
                  padding: "1.6vh 1.8vw",
                  borderRadius: "0.9vw",
                  border: i === idx ? "0.12vw solid rgba(245,158,11,0.55)" : "0.1vw solid rgba(148,163,184,0.2)",
                  background: i === idx ? "rgba(245,158,11,0.12)" : "rgba(30,58,95,0.35)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.25vw", color: "#f59e0b", letterSpacing: "0.08em" }}>{st.title}</div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.35vw", color: "#94a3b8", marginTop: "0.6vh" }}>{st.en}</div>
              </button>
            ))}
          </div>

          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "3vh 2.8vw", overflow: "auto" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b", letterSpacing: "0.12em", marginBottom: "1.5vh" }}>STEP {idx + 1} / {steps.length}</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2.4vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "2vh" }}>{s.title}</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.75vw", color: "#cbd5e1", lineHeight: 1.65 }}>{s.ar}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
