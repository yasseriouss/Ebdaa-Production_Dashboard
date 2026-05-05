export default function Slide07Dashboard() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif" }}>DASHBOARD &amp; KPIs · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>لوحة التحكم</span>
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          رؤية كاملة في لمحة واحدة
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          Management visibility across both factories at a glance
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "3vh" }} />

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", marginBottom: "2.5vh" }}>
          <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f59e0b" }}>17</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>أوامر معدني</div>
          </div>
          <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f59e0b" }}>128</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>أوامر خشبي</div>
          </div>
          <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#e87c1e" }}>54k</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>متأخرات معدني</div>
          </div>
          <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2.5vh 2vw", textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#e87c1e" }}>47k</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>متأخرات خشبي</div>
          </div>
        </div>

        <div className="grid gap-[2vw]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "1vh" }}>مؤشر الإنجاز</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#94a3b8" }}>Completion % per factory and per order, updated daily</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "1vh" }}>توزيع الحالات</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#94a3b8" }}>Pie chart: active / completed / on-hold by factory</div>
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "0.8vw", padding: "2vh 2vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "1vh" }}>مشاريع مشتركة</div>
            <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", color: "#94a3b8" }}>Cross-factory clients visible from one screen</div>
          </div>
        </div>
      </div>
    </div>
  );
}
