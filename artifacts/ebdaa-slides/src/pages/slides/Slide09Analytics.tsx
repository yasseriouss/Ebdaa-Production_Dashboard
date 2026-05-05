export default function Slide09Analytics() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>ANALYTICS · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>التحليلات والإحصائيات</span>
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          بيانات قابلة للقراءة والتحليل
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          From raw production data to actionable management insights
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "3.5vh" }} />

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw", flex: 1 }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.2vh" }}>معدل الإنجاز عبر الزمن</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>Completion rate trend chart — per factory and combined</div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw", flex: 1 }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.2vh" }}>تحليل مرحلة الاختناق</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>Stage bottleneck heatmap — highest WIP concentration</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw", flex: 1 }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.2vh" }}>أداء التسليم للعملاء</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>Client-level on-time vs late delivery performance</div>
            </div>
            <div style={{ background: "rgba(245,158,11,0.07)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "0.8vw", padding: "2.5vh 2.5vw", flex: 1 }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.2vh" }}>اتجاه المتأخرات</div>
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>Backlog trend over time — identify risk before it escalates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
