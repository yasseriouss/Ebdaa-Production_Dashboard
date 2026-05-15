export default function Slide26Credits() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />
      <div className="absolute bottom-0 left-0 right-0 h-[0.35vh]" style={{ background: "rgba(245,158,11,0.25)" }} />

      <div className="flex h-full flex-col items-center justify-center px-[8vw] text-center">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2vh" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>CREDITS · </span>
          <span style={{ fontFamily: "Tajawal, sans-serif" }}>الاعتمادات</span>
        </div>

        <div
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 900,
            fontSize: "3.4vw",
            color: "#f1f5f9",
            lineHeight: 1.35,
            maxWidth: "85vw",
            textWrap: "balance",
            marginBottom: "2.5vh",
          }}
        >
          تمّت البرمجة والتصميم، باستثناء مساهمات الذكاء الاصطناعي، بواسطة
        </div>

        <a
          href="https://yasserious.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            fontSize: "3.8vw",
            color: "#f59e0b",
            textDecoration: "none",
            letterSpacing: "0.04em",
            display: "inline-block",
            padding: "1.2vh 2vw",
            borderRadius: "1vw",
            border: "0.12vw solid rgba(245,158,11,0.45)",
            background: "rgba(245,158,11,0.08)",
          }}
        >
          yasserious.com
        </a>

        <div
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "1.45vw",
            color: "#64748b",
            marginTop: "3.5vh",
            maxWidth: "70vw",
            lineHeight: 1.55,
          }}
        >
          Programming and design — excluding AI-assisted portions — by{" "}
          <span style={{ color: "#94a3b8" }}>yasserious.com</span>
        </div>
      </div>
    </div>
  );
}
