export default function Slide03Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />
      <div className="absolute right-0 top-0 bottom-0 w-[0.5vw]" style={{ background: "linear-gradient(180deg, #f59e0b 0%, transparent 100%)" }} />

      <div className="flex flex-col h-full px-[6vw] pt-[8vh] pb-[6vh]">
        <div className="mb-[1vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            THE SOLUTION · الحل
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.15, textWrap: "balance", marginBottom: "1.5vh" }}>
          منصة موحدة لكلا المصنعين
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.9vw", color: "#94a3b8", marginBottom: "3vh" }}>
          One integrated platform — metal factory and wooden factory, connected
        </div>
        <div style={{ width: "10vw", height: "0.35vh", background: "#f59e0b", marginBottom: "4vh" }} />

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr", flex: 1 }}>
          <div style={{ background: "rgba(245,158,11,0.07)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3vw", color: "#f59e0b", marginBottom: "1.5vh" }}>01</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9", marginBottom: "1vh" }}>تتبع أوامر العمل</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>Work order tracking across both factories with full CRUD</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.07)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3vw", color: "#f59e0b", marginBottom: "1.5vh" }}>02</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9", marginBottom: "1vh" }}>مراحل الإنتاج اليومية</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>Stage-by-stage daily production tracking with inline editing</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.07)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3vw", color: "#f59e0b", marginBottom: "1.5vh" }}>03</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2vw", color: "#f1f5f9", marginBottom: "1vh" }}>تقارير ولوحة تحكم</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>Real-time dashboards, KPI cards, analytics, Gantt charts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
