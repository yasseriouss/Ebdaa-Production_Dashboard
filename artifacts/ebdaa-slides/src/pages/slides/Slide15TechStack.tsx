import { useState } from "react";

const tabBtn = (active: boolean) => ({
  fontFamily: "Tajawal, sans-serif",
  fontSize: "1.35vw",
  fontWeight: 700,
  padding: "1vh 1.8vw",
  borderRadius: "999px",
  border: active ? "0.1vw solid rgba(245,158,11,0.6)" : "0.1vw solid rgba(148,163,184,0.25)",
  background: active ? "rgba(245,158,11,0.15)" : "transparent",
  color: active ? "#f59e0b" : "#94a3b8",
  cursor: "pointer",
});

export default function Slide15TechStack() {
  const [tab, setTab] = useState<"ui" | "api" | "data">("ui");

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>STACK · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>التقنية ومكدس التنفيذ</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.6vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>واجهة حديثة وخدمة REST وقاعدة محلية قابلة للتوسع</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.65vw", color: "#94a3b8", marginTop: "1vh" }}>Guidance-only delivery estimates — not a contractual commitment</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", gap: "1.2vw", marginTop: "2.5vh", flexWrap: "wrap" }}>
          <button type="button" style={tabBtn(tab === "ui")} onClick={() => setTab("ui")}>
            الواجهة
          </button>
          <button type="button" style={tabBtn(tab === "api")} onClick={() => setTab("api")}>
            الخادم والـ API
          </button>
          <button type="button" style={tabBtn(tab === "data")} onClick={() => setTab("data")}>
            البيانات والعقود
          </button>
        </div>

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "3vh 2.5vw", overflow: "auto" }}>
            {tab === "ui" ? (
              <>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2.1vw", color: "#f59e0b", marginBottom: "2vh" }}>واجهة المصنع (factory-app)</div>
                <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.55vw", color: "#e2e8f0", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
                  <li>React 19 + Vite 7</li>
                  <li>Tailwind CSS v4 (تصميم RTL)</li>
                  <li>Wouter للتوجيه الخفيف</li>
                  <li>TanStack Query + عميل Orval المولَّد</li>
                  <li>مكوّنات واجهة حديثة (نمط shadcn)</li>
                </ul>
              </>
            ) : null}
            {tab === "api" ? (
              <>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2.1vw", color: "#f59e0b", marginBottom: "2vh" }}>خادم الـ API (api-server)</div>
                <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.55vw", color: "#e2e8f0", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
                  <li>Express 5 — مسارات تحت ‎/api‎</li>
                  <li>تحقق Zod للمدخلات</li>
                  <li>JWT اختياري + مصفوفة صلاحيات فعّالة</li>
                  <li>طبقة controllers ← services ← Drizzle</li>
                </ul>
              </>
            ) : null}
            {tab === "data" ? (
              <>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2.1vw", color: "#f59e0b", marginBottom: "2vh" }}>البيانات والعقود</div>
                <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.55vw", color: "#e2e8f0", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
                  <li>Drizzle ORM + SQLite عبر LibSQL</li>
                  <li>OpenAPI في ‎lib/api-spec‎</li>
                  <li>توليد ‎api-zod‎ و‎api-client-react‎ بـ Orval</li>
                  <li>مسار ترحيل إلى Turso وفق ‎docs/rfc-libsql-migration.md‎</li>
                </ul>
              </>
            ) : null}
          </div>

          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.28)", borderRadius: "1vw", padding: "3vh 2.5vw", overflow: "auto" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.5vh" }}>تقديرات إرشادية للمدة (أسابيع عمل)</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#64748b", marginBottom: "2vh" }}>تختلف حسب الفريق والنطاق؛ تُستخدم للتخطيط فقط.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.4vh" }}>
              {[
                { ar: "تثبيت نوعي + مراجعة مسارات الحماية", en: "1–2 wks", w: "35%" },
                { ar: "توسيع الواجهات وربط التحليلات", en: "2–4 wks", w: "55%" },
                { ar: "اختبارات، أداء، إعداد إنتاج LibSQL", en: "2–3 wks", w: "45%" },
              ].map((row) => (
                <div key={row.ar}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "2vw", marginBottom: "0.6vh" }}>
                    <span style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.45vw", color: "#cbd5e1" }}>{row.ar}</span>
                    <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.35vw", color: "#f59e0b", whiteSpace: "nowrap" }}>{row.en}</span>
                  </div>
                  <div style={{ height: "0.55vh", background: "rgba(30,58,95,0.7)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: row.w, height: "100%", background: "linear-gradient(90deg,#f59e0b,#fbbf24)", borderRadius: "999px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
