export default function Slide12StatusUpdate() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full">
        <div className="flex flex-col justify-center px-[5vw] w-[42vw]" style={{ borderRight: "0.1vw solid rgba(245,158,11,0.2)" }}>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
            STATUS UPDATE · تحديث الحالة
          </div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "2vh" }}>
            تتبع الكميات بالأرقام
          </div>
          <div style={{ width: "7vw", height: "0.35vh", background: "#f59e0b", marginBottom: "2.5vh" }} />
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.7vw", color: "#94a3b8", marginBottom: "3vh", textWrap: "pretty" }}>
            Numeric quantity input per product and per production stage — updated daily by floor supervisors
          </div>
          <div className="flex flex-col gap-[1.5vh]">
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>· لم يتم البدء</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f59e0b" }}>· تحت التصنيع</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#94a3b8" }}>· في المخزن</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#4ade80" }}>· تم الانتهاء</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f87171" }}>· متوقف</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#60a5fa" }}>· تم التسليم</div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-[4vw] w-[58vw] py-[7vh]">
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "2.5vh" }}>مثال — MOM 1089 · الكيان العسكري</div>
          <div className="flex flex-col gap-[1.5vh]">
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.6vw", padding: "1.5vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>الليزر</div>
              <div className="flex items-center gap-[2vw]">
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>هدف: 50</div>
                <div style={{ background: "rgba(34,197,94,0.15)", borderRadius: "0.4vw", padding: "0.4vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#4ade80", fontWeight: 600 }}>50 ✓</div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.6vw", padding: "1.5vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>المقص</div>
              <div className="flex items-center gap-[2vw]">
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>هدف: 50</div>
                <div style={{ background: "rgba(34,197,94,0.15)", borderRadius: "0.4vw", padding: "0.4vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#4ade80", fontWeight: 600 }}>50 ✓</div>
              </div>
            </div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "0.1vw solid rgba(245,158,11,0.3)", borderRadius: "0.6vw", padding: "1.5vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f59e0b" }}>لحام CO₂</div>
              <div className="flex items-center gap-[2vw]">
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>هدف: 50</div>
                <div style={{ background: "rgba(245,158,11,0.2)", borderRadius: "0.4vw", padding: "0.4vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#f59e0b", fontWeight: 600 }}>32 / 50</div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.35)", borderRadius: "0.6vw", padding: "1.5vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#64748b" }}>الدهان</div>
              <div className="flex items-center gap-[2vw]">
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>هدف: 50</div>
                <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.4vw", padding: "0.4vh 1.2vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#475569" }}>0 / 50</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
