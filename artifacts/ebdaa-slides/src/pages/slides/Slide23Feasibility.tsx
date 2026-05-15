import { useState } from "react";

const rows = [
  { kpi: "زمن اكتشاف التأخير", before: "ساعات–أيام (ملفات/محادثات)", after: "دقائق (لوحة موحّدة)" },
  { kpi: "اتساق أرقام المراحل", before: "نسخ يدوي بين النوبات", after: "مصدر واحد في النظام" },
  { kpi: "شفافية التسليم للعميل", before: "تقديرات فردية", after: "مسار مرئي عبر المصنعين" },
  { kpi: "عبء الاجتماعات الدورية", before: "مزامنة يدوية طويلة", after: "تركيز على الاستثناءات فقط" },
];

export default function Slide23Feasibility() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>VALUE · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>الجدوى وأثر بيئة العمل</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.2vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>إدارة وتنسيق الإنتاج — دون أرقام وهمية</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.55vw", color: "#94a3b8", marginTop: "1vh" }}>Framework for before/after KPIs — fill with real factory data</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", gap: "1.2vw", marginTop: "2vh", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            style={{
              fontFamily: "Tajawal, sans-serif",
              fontWeight: 800,
              fontSize: "1.25vw",
              padding: "1vh 1.8vw",
              borderRadius: "999px",
              border: "0.1vw solid rgba(245,158,11,0.45)",
              background: "rgba(245,158,11,0.12)",
              color: "#f59e0b",
              cursor: "pointer",
            }}
          >
            {show ? "إخفاء إطار القياس" : "إظهار إطار القياس"}
          </button>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#64748b" }}>Governance: assign owners + measurement method</div>
        </div>

        <div style={{ flex: 1, marginTop: "2.2vh", overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: show ? "1fr 1fr 1fr" : "1fr 1fr", gap: "1.2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.35vw", color: "#64748b", padding: "1vh 0.4vw" }}>مؤشر</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.35vw", color: "#64748b", padding: "1vh 0.4vw" }}>قبل</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.35vw", color: "#64748b", padding: "1vh 0.4vw", display: show ? "block" : "none" }}>بعد (فراغ للبيانات)</div>

            {rows.map((r) => (
              <div key={r.kpi} style={{ display: "contents" }}>
                <div style={{ background: "rgba(30,58,95,0.45)", border: "0.08vw solid rgba(148,163,184,0.12)", borderRadius: "0.8vw", padding: "1.6vh 1.4vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.35vw", color: "#f1f5f9" }}>{r.kpi}</div>
                <div style={{ background: "rgba(30,58,95,0.35)", border: "0.08vw solid rgba(148,163,184,0.12)", borderRadius: "0.8vw", padding: "1.6vh 1.4vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.25vw", color: "#94a3b8", lineHeight: 1.45 }}>{r.before}</div>
                <div
                  style={{
                    background: show ? "rgba(245,158,11,0.08)" : "transparent",
                    border: show ? "0.08vw dashed rgba(245,158,11,0.35)" : "none",
                    borderRadius: "0.8vw",
                    padding: "1.6vh 1.4vw",
                    fontFamily: "Tajawal, sans-serif",
                    fontSize: "1.25vw",
                    color: show ? "#cbd5e1" : "transparent",
                    display: show ? "block" : "none",
                  }}
                >
                  {show ? r.after : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "2vh", fontFamily: "Tajawal, sans-serif", fontSize: "1.25vw", color: "#64748b", lineHeight: 1.55 }}>
          أثر بيئة العمل: تقليل الضغط النفسي من «عدم التيقن»، تقليل الاصطدام بين النوبات، وزيادة الثقة بين الإدارة والإنتاج عندما يكون المصدر واحداً.
        </div>
      </div>
    </div>
  );
}
