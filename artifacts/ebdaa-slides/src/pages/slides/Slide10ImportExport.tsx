export default function Slide10ImportExport() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full">
        <div className="flex flex-col justify-center px-[5vw] w-[45vw]" style={{ borderRight: "0.1vw solid rgba(245,158,11,0.2)" }}>
          <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>DATA · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>الاستيراد والتصدير</span>
          </div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "2vh" }}>
            تبادل البيانات مع Excel
          </div>
          <div style={{ width: "7vw", height: "0.35vh", background: "#f59e0b", marginBottom: "2.5vh" }} />
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.7vw", color: "#94a3b8", marginBottom: "3vh", textWrap: "pretty" }}>
            Import from existing Excel files and export any table or report — no data re-entry
          </div>

          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "0.6vw", background: "rgba(245,158,11,0.15)", border: "0.15vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: "1.8vw", color: "#f59e0b" }}>↑</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f1f5f9" }}>استيراد Excel</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Upload .xlsx for metal or wooden orders — auto-merge</div>
              </div>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "0.6vw", background: "rgba(245,158,11,0.15)", border: "0.15vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: "1.8vw", color: "#f59e0b" }}>↓</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f1f5f9" }}>تصدير Excel و PDF</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Export any table as .xlsx or branded PDF report</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-[4vw] w-[55vw] py-[7vh]">
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "2.5vh" }}>ملفات الإكسل المدعومة</div>
          <div className="flex flex-col gap-[1.8vh]">
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2.5vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>أوامر عمل المعدني</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b" }}>metal_orders.xlsx</div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.15)", borderRadius: "0.4vw", padding: "0.5vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>17 أمر</div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2.5vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>أوامر عمل الخشبي</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b" }}>wooden_orders.xlsx</div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.15)", borderRadius: "0.4vw", padding: "0.5vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>128 أمر</div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2.5vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>الإنتاج اليومي المعدني</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b" }}>Metal_daily_Production.xlsx</div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.15)", borderRadius: "0.4vw", padding: "0.5vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>289 سجل</div>
            </div>
            <div style={{ height: "0.15vh", background: "rgba(245,158,11,0.15)", margin: "1vh 0" }} />
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>
              الحقل "Extension" في الخشبي: حذف تلقائي لكلمة "VBC" عند الاستيراد
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
