import { useState } from "react";

const scenes = [
  { id: "dash", ar: "لوحة التحكم", en: "KPIs للمصنعين، ومؤشرات التأخير والحمولة." },
  { id: "plan", ar: "التخطيط والجدولة", en: "Gantt / PERT — مسار حرج وتداخل مهام." },
  { id: "ana", ar: "التحليلات", en: "اتجاهات الإنجاز، اختناقات المراحل، أداء العملاء." },
  { id: "io", ar: "الاستيراد والتصدير", en: "جسر من وإلى Excel عند اعتماد العمليات." },
  { id: "perf", ar: "الأداء والمتابعة", en: "ربط الأقسام بالأهداف — قرارات مبنية على بيانات." },
];

export default function Slide19JourneyAdmin() {
  const [open, setOpen] = useState<string[]>(() => scenes.map((s) => s.id));

  const toggle = (id: string) => {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>JOURNEY · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>رحلة الإدارة</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.45vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>من اللوحة إلى القرار التشغيلي</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginTop: "1vh" }}>factory_admin / super_admin persona — toggle tiles</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5vw", minHeight: 0 }}>
          {scenes.map((s) => {
            const is = open.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                style={{
                  borderRadius: "1vw",
                  border: is ? "0.12vw solid rgba(245,158,11,0.55)" : "0.1vw solid rgba(148,163,184,0.18)",
                  background: is ? "rgba(245,158,11,0.1)" : "rgba(30,58,95,0.45)",
                  padding: "2.2vh 1.6vw",
                  cursor: "pointer",
                  textAlign: "start",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1vh",
                  minHeight: 0,
                }}
              >
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.65vw", color: "#f59e0b" }}>{s.ar}</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: is ? "#cbd5e1" : "#64748b", flex: 1, overflow: "hidden" }}>{is ? s.en : "اضغط للتوسيع"}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "2.5vh", padding: "2vh 2.2vw", borderRadius: "1vw", border: "0.1vw solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.65vw", color: "#f1f5f9" }}>القيمة للإدارة</div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.4vw", color: "#94a3b8", marginTop: "1vh", lineHeight: 1.55 }}>
            صورة واحدة للمصنعين مع شفافية التسليم؛ تقليل الاعتماد على ملفات مشتتة؛ اجتماعات أقصر لأن الأرقام متفق عليها مسبقاً.
          </div>
        </div>
      </div>
    </div>
  );
}
