import { useState } from "react";

const suggestions = [
  {
    id: "fk",
    title: "ربط أوامر العمل بالمصنع/القسم",
    body:
      "إضافة ‎factory_id‎ / ‎department_id‎ اختيارية إلى ‎wooden_work_orders‎ و‎metal_work_orders‎ مع FK إلى ‎factories‎ / ‎departments‎ يحسّن حيز البيانات والتقارير الموحّدة.",
  },
  {
    id: "hub",
    title: "Factory Hub مقابل الجداول المعيارية",
    body:
      "جداول ‎fh_*‎ تحفظ لقطات ووثائق؛ مع الوقت ربط المعرّفات بأوامر العمل المعيارية يقلل ازدواج المصدر بين الفريقين.",
  },
  {
    id: "idx",
    title: "فهارس بعد القياس",
    body:
      "إضافة فهارس على تواريخ الطلب، حالة التنفيذ، معرّف العميل/المشروع عند ظهور مسح كامل في الاستعلامات الحقيقية.",
  },
  {
    id: "audit",
    title: "تدقيق أدق",
    body:
      "توحيد حقول ‎audit_events‎ مع معرّفات حقيقية (بدل نصوص فقط) عندما تستقر أسماء الأقسام في المخطط.",
  },
] as const;

export default function Slide22DatabaseEr() {
  const [sel, setSel] = useState<string | null>(suggestions[0].id);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>DATA MODEL · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>قاعدة البيانات واقتراحات التحسين</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.1vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>ER منطقي + قيود Drizzle الحالية</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.55vw", color: "#94a3b8", marginTop: "1vh" }}>Select a card — deep-dive on schema evolution</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ flex: 1, marginTop: "2.2vh", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.2vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.45)", border: "0.1vw solid rgba(245,158,11,0.18)", borderRadius: "1vw", padding: "2.4vh 2.2vw", overflow: "auto" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.85vw", color: "#f59e0b", marginBottom: "1.4vh" }}>ما هو مُصرَّح به اليوم؟</div>
            <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.35vw", color: "#cbd5e1", lineHeight: 1.6, paddingInlineStart: "1.2em", margin: 0 }}>
              <li>‎factories → departments → tasks‎</li>
              <li>‎employees‎ مرتبطة بالمصنع وربما القسم</li>
              <li>‎wooden_work_orders → wooden_production_stages‎</li>
              <li>‎metal_work_orders → metal_production_stages + metal_stage_log‎</li>
              <li>‎auth_*‎ و‎audit_events‎ لسجل الهوية والتغييرات</li>
              <li>‎shared_projects‎ كفهرس مشاريع مستقل حالياً عن مراحل الإنتاج التفصيلية</li>
            </ul>
            <div style={{ marginTop: "2vh", fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#64748b", lineHeight: 1.5 }}>
              Internal engineers: see also ‎/__internal/project-atlas‎ (dev) for Mermaid ER views.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", overflow: "auto" }}>
            {suggestions.map((s) => {
              const active = sel === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSel(s.id)}
                  style={{
                    textAlign: "start",
                    borderRadius: "1vw",
                    border: active ? "0.12vw solid rgba(245,158,11,0.55)" : "0.1vw solid rgba(148,163,184,0.18)",
                    background: active ? "rgba(245,158,11,0.1)" : "rgba(30,58,95,0.45)",
                    padding: "1.6vh 1.8vw",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.55vw", color: "#f59e0b" }}>{s.title}</div>
                  {active ? (
                    <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.35vw", color: "#cbd5e1", marginTop: "1vh", lineHeight: 1.55 }}>{s.body}</div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
