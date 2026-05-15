import { useState } from "react";

const lanes = [
  {
    title: "تخطيط القسم",
    bullets: ["مزامنة المهام اليومية مع خط الإنتاج", "اكتشاف التداخل بين الطلبات مبكراً"],
  },
  {
    title: "مشاريع مشتركة",
    bullets: ["ربط المعدن والخشب تحت عميل واحد", "تتبع تبعيات التسليم بين المصنعين"],
  },
  {
    title: "تحليلات ضمن النطاق",
    bullets: ["مقاييس مراحل ذات صلة بالقسم", "مقارنة الأداء أسبوع بأسبوع"],
  },
];

export default function Slide20JourneyLead() {
  const [k, setK] = useState(0);
  const lane = lanes[k];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>JOURNEY · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>رحلة المهندس / رئيس القسم</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.25vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>department_lead — التنسيق بين التخطيط والتنفيذ</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginTop: "1vh" }}>Cycle focus areas — prev / next</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", gap: "1.2vw", marginTop: "2.5vh" }}>
          <button
            type="button"
            onClick={() => setK((v) => (v - 1 + lanes.length) % lanes.length)}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "1.2vw",
              padding: "1vh 1.6vw",
              borderRadius: "0.8vw",
              border: "0.1vw solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              cursor: "pointer",
            }}
          >
            السابق
          </button>
          <button
            type="button"
            onClick={() => setK((v) => (v + 1) % lanes.length)}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "1.2vw",
              padding: "1vh 1.6vw",
              borderRadius: "0.8vw",
              border: "0.1vw solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.1)",
              color: "#f59e0b",
              cursor: "pointer",
            }}
          >
            التالي
          </button>
          <div style={{ alignSelf: "center", fontFamily: "DM Sans, sans-serif", fontSize: "1.2vw", color: "#64748b" }}>
            {k + 1} / {lanes.length}
          </div>
        </div>

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "3vh 2.8vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "2.6vw", color: "#f59e0b", marginBottom: "2vh" }}>{lane.title}</div>
            <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.75vw", color: "#e2e8f0", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
              {lane.bullets.map((b) => (
                <li key={b} style={{ marginBottom: "1.2vh" }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "3vh 2.8vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.5vh" }}>مسارات في التطبيق</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#cbd5e1", lineHeight: 1.65 }}>
              ‎التخطيط · /planning‎ — ‎المشاريع · /projects‎ — ‎التحليلات · /analytics‎ — ‎مركز الإنتاج · /production‎ حسب الصلاحيات الفعلية للحساب.
            </div>
            <div style={{ marginTop: "2.5vh", fontFamily: "DM Sans, sans-serif", fontSize: "1.25vw", color: "#64748b", lineHeight: 1.55 }}>
              Engineers translate design intent into executable sequences — the system keeps those sequences visible to the floor.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
