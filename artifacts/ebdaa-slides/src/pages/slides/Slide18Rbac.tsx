import { useMemo, useState } from "react";

const roles = [
  {
    slug: "super_admin",
    ar: "سوبر أدمن",
    map: "أعلى سلطة تقنية — جميع مفاتيح الكاتالوج.",
  },
  {
    slug: "factory_admin",
    ar: "مدير مصنع / إدارة",
    map: "رؤية واسعة: لوحات، تخطيط، تحليلات، استيراد/تصدير (بحسب الإعدادات).",
  },
  {
    slug: "department_lead",
    ar: "مهندس / رئيس قسم",
    map: "تركيز على قسم ومشاريع: تخطيط، مشاريع مشتركة، تحليلات ضمن النطاق.",
  },
  {
    slug: "operator",
    ar: "فني / مشغّل",
    map: "تحديثات يومية لأوامر العمل والمراحل — صلاحيات تحليل أضيق.",
  },
  {
    slug: "viewer",
    ar: "مشاهد",
    map: "قراءة فقط للمزايا التي تنتهي بـ ‎:view‎ / ‎:read‎ (باستثناء إدارة الصلاحيات).",
  },
] as const;

const examples = [
  { route: "/metal, /wooden", perm: "orders:* + writes", note: "محمي بـ requirePermission" },
  { route: "/factory-hub*", perm: "factory_hub:*", note: "قراءة/كتابة حسب المفتاح" },
  { route: "dashboard, import/export", perm: "يختلف حسب الإصدار", note: "راجع تغطية الإنتاج مقابل التطوير" },
];

export default function Slide18Rbac() {
  const [filter, setFilter] = useState<string>("all");
  const visible = useMemo(() => (filter === "all" ? roles : roles.filter((r) => r.slug === filter)), [filter]);

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>RBAC · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>الأدوار والصلاحيات</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.35vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>مفاتيح صلاحية — وليس مجرد عناوين وظيفية</div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginTop: "1vh" }}>Filter roles — technical honesty on route guards</div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1vw", marginTop: "2vh" }}>
          <button
            type="button"
            onClick={() => setFilter("all")}
            style={{
              fontFamily: "Tajawal, sans-serif",
              fontSize: "1.25vw",
              fontWeight: 700,
              padding: "0.9vh 1.6vw",
              borderRadius: "999px",
              border: filter === "all" ? "0.1vw solid rgba(245,158,11,0.6)" : "0.1vw solid rgba(148,163,184,0.25)",
              background: filter === "all" ? "rgba(245,158,11,0.14)" : "transparent",
              color: filter === "all" ? "#f59e0b" : "#94a3b8",
              cursor: "pointer",
            }}
          >
            الكل
          </button>
          {roles.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => setFilter(r.slug)}
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "1.15vw",
                fontWeight: 600,
                padding: "0.9vh 1.4vw",
                borderRadius: "999px",
                border: filter === r.slug ? "0.1vw solid rgba(245,158,11,0.6)" : "0.1vw solid rgba(148,163,184,0.2)",
                background: filter === r.slug ? "rgba(245,158,11,0.14)" : "rgba(30,58,95,0.35)",
                color: filter === r.slug ? "#f59e0b" : "#cbd5e1",
                cursor: "pointer",
              }}
            >
              {r.slug}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.18)", borderRadius: "1vw", padding: "2.5vh 2.2vw", overflow: "auto" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.9vw", color: "#f59e0b", marginBottom: "1.8vh" }}>دليل الأدوار البرمجية ↔ الإدارة</div>
            {visible.map((r) => (
              <div key={r.slug} style={{ padding: "1.5vh 0", borderBottom: "0.08vw solid rgba(148,163,184,0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "2vw", flexWrap: "wrap" }}>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.65vw", color: "#f1f5f9" }}>{r.ar}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#64748b", alignSelf: "center" }}>{r.slug}</div>
                </div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.4vw", color: "#94a3b8", marginTop: "0.9vh", lineHeight: 1.55 }}>{r.map}</div>
              </div>
            ))}
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.25vw", color: "#64748b", marginTop: "2vh" }}>المصدر: ‎lib/db/src/permissionCatalog.ts‎ — ‎ROLE_PRESETS‎.</div>
          </div>

          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "2.5vh 2.2vw", overflow: "auto" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "1.9vw", color: "#f59e0b", marginBottom: "1.8vh" }}>نزاهة تقنية</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.4vw", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "2vh" }}>
              بعض المسارات يجب تأمينها صراحة في الإنتاج (JWT إلزامي، ‎AUTH_ANONYMOUS_UNRESTRICTED=false‎، وتغطية ‎requirePermission‎ لكل نقاط الكتابة الحساسة).
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
              {examples.map((e) => (
                <details key={e.route} style={{ borderRadius: "0.8vw", border: "0.1vw solid rgba(148,163,184,0.18)", padding: "1.2vh 1.2vw", background: "rgba(30,58,95,0.35)" }}>
                  <summary style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.25vw", color: "#f1f5f9", cursor: "pointer" }}>{e.route}</summary>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.25vw", color: "#94a3b8", marginTop: "1vh" }}>{e.perm}</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.15vw", color: "#64748b", marginTop: "0.6vh" }}>{e.note}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
