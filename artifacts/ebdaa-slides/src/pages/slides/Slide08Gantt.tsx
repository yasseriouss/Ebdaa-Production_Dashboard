export default function Slide08Gantt() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full">
        <div className="flex flex-col justify-center px-[5vw] w-[40vw]" style={{ borderRight: "0.1vw solid rgba(245,158,11,0.2)" }}>
          <div style={{ fontSize: "1.4vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>PLANNING · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>التخطيط والجدولة</span>
          </div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "2vh" }}>
            Gantt وPERT تخطيط المشاريع
          </div>
          <div style={{ width: "7vw", height: "0.35vh", background: "#f59e0b", marginBottom: "2.5vh" }} />
          <div className="flex flex-col gap-[2vh]">
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.9vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f1f5f9" }}>مخطط جانت تفاعلي</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Interactive Gantt — group by factory and client</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.9vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f1f5f9" }}>شبكة PERT والمسار الحرج</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>PERT network with critical path highlighting</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.9vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f1f5f9" }}>اكتشاف التعارضات</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>Overlap and resource conflict detection</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center px-[4vw] w-[60vw] py-[8vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#64748b", marginBottom: "2vh", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sample Gantt View</div>
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "14vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#94a3b8", textAlign: "right" }}>الكيان العسكري</div>
              <div style={{ flex: 1, height: "3.5vh", borderRadius: "0.4vw", background: "rgba(245,158,11,0.7)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingRight: "1vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#0e1628", fontWeight: 600 }}>MOM 1089–1095</div>
              </div>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "14vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#94a3b8", textAlign: "right" }}>جزيرة مزارين</div>
              <div style={{ width: "20vw", flexShrink: 0 }} />
              <div style={{ flex: 1, height: "3.5vh", borderRadius: "0.4vw", background: "rgba(30,58,95,0.9)", border: "0.1vw solid rgba(245,158,11,0.4)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingRight: "1vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>MOM 1097–1102</div>
              </div>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "14vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#94a3b8", textAlign: "right" }}>فاينست</div>
              <div style={{ width: "8vw", flexShrink: 0 }} />
              <div style={{ flex: 1, height: "3.5vh", borderRadius: "0.4vw", background: "rgba(245,158,11,0.4)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingRight: "1vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f1f5f9" }}>MOM 1103–1105</div>
              </div>
            </div>
            <div className="flex items-center gap-[1.5vw]">
              <div style={{ width: "14vw", fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#94a3b8", textAlign: "right" }}>الحرس الجمهوري</div>
              <div style={{ width: "5vw", flexShrink: 0 }} />
              <div style={{ flex: 1, height: "3.5vh", borderRadius: "0.4vw", background: "rgba(200,50,50,0.4)", border: "0.1vw solid rgba(200,50,50,0.5)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingRight: "1vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#fca5a5" }}>MOM 1107–1109 · متأخر</div>
              </div>
            </div>
          </div>
          <div className="flex gap-[2vw] mt-[3vh]">
            <div className="flex items-center gap-[0.7vw]">
              <div style={{ width: "2vw", height: "1.2vh", borderRadius: "0.2vw", background: "rgba(245,158,11,0.7)" }} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>On track</div>
            </div>
            <div className="flex items-center gap-[0.7vw]">
              <div style={{ width: "2vw", height: "1.2vh", borderRadius: "0.2vw", background: "rgba(30,58,95,0.9)", border: "0.1vw solid rgba(245,158,11,0.4)" }} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Pending</div>
            </div>
            <div className="flex items-center gap-[0.7vw]">
              <div style={{ width: "2vw", height: "1.2vh", borderRadius: "0.2vw", background: "rgba(200,50,50,0.4)" }} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Delayed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
