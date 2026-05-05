export default function Slide06SharedProjects() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />
      <div className="absolute left-0 top-0 bottom-0 w-[0.5vw]" style={{ background: "linear-gradient(180deg, #f59e0b 0%, transparent 100%)" }} />

      <div className="flex h-full px-[6vw] pt-[7vh] pb-[6vh]" style={{ flexDirection: "column" }}>
        <div className="mb-[1vh]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            SHARED PROJECTS · المشاريع المشتركة
          </div>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.8vw", color: "#f1f5f9", lineHeight: 1.2, marginBottom: "1vh" }}>
          مشاريع موزعة على المصنعين
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "3vh" }}>
          Client orders spanning both metal and wooden factories — tracked together
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginBottom: "3.5vh" }} />

        <div className="flex gap-[3vw]" style={{ flex: 1 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "0.5vh" }}>عملاء مشتركون</div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>الكيان العسكري</div>
              <div style={{ display: "flex", gap: "0.8vw" }}>
                <div style={{ background: "rgba(245,158,11,0.2)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>Metal</div>
                <div style={{ background: "rgba(30,58,95,0.8)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Wood</div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>جزيرة مزارين</div>
              <div style={{ display: "flex", gap: "0.8vw" }}>
                <div style={{ background: "rgba(245,158,11,0.2)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>Metal</div>
                <div style={{ background: "rgba(30,58,95,0.8)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Wood</div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>فاينست</div>
              <div style={{ display: "flex", gap: "0.8vw" }}>
                <div style={{ background: "rgba(245,158,11,0.2)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>Metal</div>
                <div style={{ background: "rgba(30,58,95,0.8)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Wood</div>
              </div>
            </div>
            <div style={{ background: "rgba(30,58,95,0.5)", borderRadius: "0.8vw", padding: "2vh 2vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.8vw", color: "#f1f5f9" }}>الحرس الجمهوري</div>
              <div style={{ display: "flex", gap: "0.8vw" }}>
                <div style={{ background: "rgba(245,158,11,0.2)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#f59e0b" }}>Metal</div>
                <div style={{ background: "rgba(30,58,95,0.8)", borderRadius: "0.3vw", padding: "0.3vh 0.8vw", fontFamily: "DM Sans, sans-serif", fontSize: "1.4vw", color: "#94a3b8" }}>Wood</div>
              </div>
            </div>
          </div>

          <div style={{ width: "0.15vw", background: "rgba(245,158,11,0.2)" }} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh", justifyContent: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.8vw", color: "#f59e0b", marginBottom: "0.5vh" }}>ما يوفره النظام</div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.8vh", flexShrink: 0 }} />
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>ربط أوامر المعدني بالخشبي لنفس العميل</div>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.8vh", flexShrink: 0 }} />
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>نسبة إنجاز موحدة للمشروع</div>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.8vh", flexShrink: 0 }} />
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#f1f5f9" }}>تحليل أثر تأخر أحد المصنعين على الجدول</div>
            </div>
            <div className="flex items-start gap-[1.2vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "0.8vh", flexShrink: 0 }} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#94a3b8" }}>Cross-factory delay alerts for shared delivery dates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
