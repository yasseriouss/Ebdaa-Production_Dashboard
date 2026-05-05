const base = import.meta.env.BASE_URL;

export default function Slide14ThankYou() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0e1628" }}>
      <img
        src={`${base}hero-factory.png`}
        crossOrigin="anonymous"
        alt="Factory"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12 }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0e1628 0%, rgba(14,22,40,0.85) 50%, #162040 100%)" }} />
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[0.4vh]" style={{ background: "rgba(245,158,11,0.3)" }} />

      <div className="relative flex flex-col items-center justify-center w-full h-full px-[8vw]">
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "2.5vh" }}>
          ENCID FACTORIES · مصانع إبداع
        </div>

        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "6vw", color: "#f1f5f9", lineHeight: 1.1, textAlign: "center", textWrap: "balance", marginBottom: "2vh" }}>
          شكراً
        </div>

        <div style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, fontSize: "2.6vw", color: "#94a3b8", textAlign: "center", marginBottom: "1.5vh" }}>
          Thank You
        </div>

        <div style={{ width: "12vw", height: "0.4vh", background: "linear-gradient(90deg, transparent, #f59e0b, transparent)", marginBottom: "4vh" }} />

        <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.9vw", color: "#64748b", textAlign: "center", textWrap: "balance" }}>
          نظام إدارة مصنعي إبداع للأثاث
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.7vw", color: "#475569", textAlign: "center", marginTop: "0.8vh" }}>
          Ebdaa Furniture Factory Management System
        </div>

        <div className="flex gap-[5vw] mt-[5vh]">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.5vw", color: "#f59e0b" }}>2</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>مصنع</div>
          </div>
          <div style={{ width: "0.15vw", background: "rgba(245,158,11,0.3)", alignSelf: "stretch" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.5vw", color: "#f59e0b" }}>21</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>مرحلة إنتاجية</div>
          </div>
          <div style={{ width: "0.15vw", background: "rgba(245,158,11,0.3)", alignSelf: "stretch" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "2.5vw", color: "#f59e0b" }}>145+</div>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.5vw", color: "#64748b" }}>أمر عمل</div>
          </div>
        </div>
      </div>
    </div>
  );
}
