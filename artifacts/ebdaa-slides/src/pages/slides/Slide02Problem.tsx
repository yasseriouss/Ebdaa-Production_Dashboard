export default function Slide02Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="absolute right-0 top-0 bottom-0 w-[35vw]" style={{ background: "rgba(245,158,11,0.04)" }} />

      <div className="flex h-full">
        <div className="flex flex-col justify-center px-[6vw] w-[55vw]">
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5vh" }}>
            THE CHALLENGE · التحدي
          </div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "4vw", color: "#f1f5f9", lineHeight: 1.2, textWrap: "balance", marginBottom: "2.5vh" }}>
            بيانات مشتتة
            <br />
            ولا رؤية موحدة
          </div>
          <div style={{ width: "8vw", height: "0.35vh", background: "#f59e0b", marginBottom: "4vh" }} />

          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.8vw", color: "#94a3b8", marginBottom: "4vh", textWrap: "pretty" }}>
            Disconnected Excel files across two factories
            <br />with no shared visibility or unified reporting
          </div>

          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex items-start gap-[1.5vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "1vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.9vw", color: "#f1f5f9" }}>ملفات إكسل منفصلة لكل مصنع</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>Separate spreadsheets per factory — no link between them</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.5vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "1vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.9vw", color: "#f1f5f9" }}>تتبع يدوي للمراحل الإنتاجية</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>Manual stage tracking — error-prone and slow</div>
              </div>
            </div>
            <div className="flex items-start gap-[1.5vw]">
              <div style={{ width: "0.5vw", height: "0.5vw", borderRadius: "50%", background: "#f59e0b", marginTop: "1vh", flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.9vw", color: "#f1f5f9" }}>غياب التقارير اللحظية</div>
                <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b" }}>No real-time dashboards for management decisions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-[45vw] px-[3vw]">
          <div style={{ border: "0.15vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "4vh 3vw", width: "100%", background: "rgba(245,158,11,0.04)" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "7vw", color: "rgba(245,158,11,0.18)", textAlign: "center", lineHeight: 1 }}>!</div>
            <div className="flex flex-col gap-[2vh] mt-[1vh]">
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#94a3b8", textAlign: "center" }}>17 مرحلة إنتاجية معدنية</div>
              <div style={{ height: "0.15vh", background: "rgba(245,158,11,0.2)" }} />
              <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.7vw", color: "#94a3b8", textAlign: "center" }}>4 مراحل إنتاجية خشبية</div>
              <div style={{ height: "0.15vh", background: "rgba(245,158,11,0.2)" }} />
              <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.6vw", color: "#64748b", textAlign: "center" }}>All tracked manually</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
