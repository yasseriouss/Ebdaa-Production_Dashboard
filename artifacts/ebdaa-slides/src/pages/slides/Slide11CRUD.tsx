export default function Slide11CRUD() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            DATA MANAGEMENT · إدارة البيانات
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          إنشاء، تعديل، حذف بأمان
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          Full CRUD on all tables — with confirmation guards on destructive actions
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "3.5vh" }} />

        <div className="grid gap-[2.5vw]" style={{ gridTemplateColumns: "1fr 1fr", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
              <div className="flex items-center gap-[1.5vw] mb-[1.2vh]">
                <div style={{ width: "3vw", height: "3vw", borderRadius: "0.5vw", background: "rgba(34,197,94,0.15)", border: "0.1vw solid rgba(34,197,94,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.6vw", color: "#4ade80" }}>+</div>
                </div>
                <div>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>إضافة سجل</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Create — Add new order or stage record</div>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
              <div className="flex items-center gap-[1.5vw] mb-[1.2vh]">
                <div style={{ width: "3vw", height: "3vw", borderRadius: "0.5vw", background: "rgba(59,130,246,0.15)", border: "0.1vw solid rgba(59,130,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.4vw", color: "#60a5fa" }}>✎</div>
                </div>
                <div>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>تعديل البيانات</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Edit — Inline row editing or full form modal</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
              <div className="flex items-center gap-[1.5vw] mb-[1.2vh]">
                <div style={{ width: "3vw", height: "3vw", borderRadius: "0.5vw", background: "rgba(245,158,11,0.15)", border: "0.1vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.4vw", color: "#f59e0b" }}>≡</div>
                </div>
                <div>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>عرض التفاصيل</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Read — Full order detail page with stage history</div>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw" }}>
              <div className="flex items-center gap-[1.5vw] mb-[1.2vh]">
                <div style={{ width: "3vw", height: "3vw", borderRadius: "0.5vw", background: "rgba(239,68,68,0.15)", border: "0.1vw solid rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: "1.4vw", color: "#f87171" }}>✕</div>
                </div>
                <div>
                  <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9" }}>حذف مع تأكيد</div>
                  <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Delete — Confirmation dialog prevents accidental removal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
