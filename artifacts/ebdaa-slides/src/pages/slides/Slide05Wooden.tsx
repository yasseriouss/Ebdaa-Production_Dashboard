export default function Slide05Wooden() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            WOODEN FACTORY · المصنع الخشبي
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          إدارة أوامر الأثاث الخشبي
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          128+ work orders tracked across 4 production stages
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "4vh" }} />

        <div className="grid gap-[2.5vw]" style={{ gridTemplateColumns: "1fr 1fr", flex: 1 }}>
          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.15)", borderRadius: "1vw", padding: "3.5vh 3vw" }}>
            <div className="flex items-center gap-[1.5vw] mb-[2vh]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "0.15vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.8vw", color: "#f59e0b" }}>1</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9" }}>القطع</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Cutting Stage</div>
              </div>
            </div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>قطع الألواح الخشبية وفق أبعاد التصميم المطلوب</div>
          </div>

          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.15)", borderRadius: "1vw", padding: "3.5vh 3vw" }}>
            <div className="flex items-center gap-[1.5vw] mb-[2vh]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "0.15vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.8vw", color: "#f59e0b" }}>2</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9" }}>التجميع</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Assembly Stage</div>
              </div>
            </div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>تجميع القطع وتركيبها وفق مخططات المنتج</div>
          </div>

          <div style={{ background: "rgba(30,58,95,0.5)", border: "0.1vw solid rgba(245,158,11,0.15)", borderRadius: "1vw", padding: "3.5vh 3vw" }}>
            <div className="flex items-center gap-[1.5vw] mb-[2vh]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "50%", background: "rgba(245,158,11,0.15)", border: "0.15vw solid rgba(245,158,11,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.8vw", color: "#f59e0b" }}>3</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f1f5f9" }}>التشطيب</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Finishing Stage</div>
              </div>
            </div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>الدهان والطلاء والمعالجة السطحية النهائية</div>
          </div>

          <div style={{ background: "rgba(245,158,11,0.08)", border: "0.15vw solid rgba(245,158,11,0.35)", borderRadius: "1vw", padding: "3.5vh 3vw" }}>
            <div className="flex items-center gap-[1.5vw] mb-[2vh]">
              <div style={{ width: "4vw", height: "4vw", borderRadius: "50%", background: "rgba(245,158,11,0.25)", border: "0.15vw solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "1.8vw", color: "#f59e0b" }}>4</div>
              </div>
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.2vw", color: "#f59e0b" }}>التغليف</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#92400e" }}>Packaging Stage</div>
              </div>
            </div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>التغليف والتجهيز للتسليم للعميل</div>
          </div>
        </div>
      </div>
    </div>
  );
}
