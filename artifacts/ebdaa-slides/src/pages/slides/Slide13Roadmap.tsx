export default function Slide13Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>ROADMAP · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>خارطة الطريق</span>
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          التطوير القادم للنظام
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          Planned improvements beyond the current release
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "4vh" }} />

        <div className="grid gap-[2.5vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr", flex: 1 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.3)", borderRadius: "1vw", padding: "3.5vh 2.5vw" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b", letterSpacing: "0.1em", marginBottom: "1.5vh", textTransform: "uppercase" }}>Phase 1 · المرحلة الأولى</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9", marginBottom: "2vh" }}>صلاحيات المستخدمين</div>
            <div style={{ height: "0.2vh", background: "rgba(245,158,11,0.25)", marginBottom: "2vh" }} />
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>نظام تسجيل الدخول</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>أدوار: مدير / مشرف / مستخدم</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#475569" }}>User login and role-based access control per factory</div>
          </div>

          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.15)", borderRadius: "1vw", padding: "3.5vh 2.5vw" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b", letterSpacing: "0.1em", marginBottom: "1.5vh", textTransform: "uppercase" }}>Phase 2 · المرحلة الثانية</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9", marginBottom: "2vh" }}>الأداء والكفاءة</div>
            <div style={{ height: "0.2vh", background: "rgba(245,158,11,0.15)", marginBottom: "2vh" }} />
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>تحميل المراحل عند الطلب</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>تصفية وبحث متقدمة</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#475569" }}>Lazy-load production stages — faster grid rendering</div>
          </div>

          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.15)", borderRadius: "1vw", padding: "3.5vh 2.5vw" }}>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b", letterSpacing: "0.1em", marginBottom: "1.5vh", textTransform: "uppercase" }}>Phase 3 · المرحلة الثالثة</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9", marginBottom: "2vh" }}>التكامل والتنبيهات</div>
            <div style={{ height: "0.2vh", background: "rgba(245,158,11,0.15)", marginBottom: "2vh" }} />
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>تكامل مع نظام ERP</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8", marginBottom: "1.2vh" }}>تنبيهات فورية للتأخيرات</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#475569" }}>Real-time delay alerts and ERP system integration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
