import { useState } from "react";

type Node = { id: string; ar: string; en: string; children?: Node[] };

const tree: Node = {
  id: "root",
  ar: "Factory-Data-Hub (pnpm workspaces)",
  en: "Monorepo root · MIT",
  children: [
    {
      id: "artifacts",
      ar: "artifacts/ — تطبيقات قابلة للنشر",
      en: "Primary deployables",
      children: [
        { id: "fa", ar: "factory-app — واجهة المصنع RTL", en: "React 19 + Vite" },
        { id: "api", ar: "api-server — خادم Express", en: "REST /api" },
        { id: "slides", ar: "ebdaa-slides — عروض تفاعلية", en: "Marketing / training" },
      ],
    },
    {
      id: "lib",
      ar: "lib/ — كود مشترك",
      en: "Shared libraries",
      children: [
        { id: "db", ar: "db — Drizzle + مخطط SQLite/LibSQL", en: "@workspace/db" },
        { id: "spec", ar: "api-spec · api-zod · api-client-react", en: "Contract-driven client" },
      ],
    },
    { id: "apps", ar: "apps/web — حزمة مساعدة / تجارب", en: "Optional Vite app" },
  ],
};

function TreeRows({ node, depth, open, toggle }: { node: Node; depth: number; open: Set<string>; toggle: (id: string) => void }) {
  const hasChildren = !!node.children?.length;
  const isOpen = open.has(node.id);
  const pad = depth * 2.2;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "1vw",
          paddingInlineStart: `${pad}vw`,
          marginBottom: "1vh",
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggle(node.id)}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "1.35vw",
              width: "2.4vw",
              height: "2.4vw",
              borderRadius: "0.5vw",
              border: "0.1vw solid rgba(245,158,11,0.35)",
              background: "rgba(245,158,11,0.12)",
              color: "#f59e0b",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-expanded={isOpen}
          >
            {isOpen ? "−" : "+"}
          </button>
        ) : (
          <span style={{ width: "2.4vw" }} />
        )}
        <div>
          <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "1.55vw", color: "#f1f5f9" }}>{node.ar}</div>
          <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.25vw", color: "#64748b", marginTop: "0.4vh" }}>{node.en}</div>
        </div>
      </div>
      {hasChildren && isOpen ? node.children!.map((c) => <TreeRows key={c.id} node={c} depth={depth + 1} open={open} toggle={toggle} />) : null}
    </div>
  );
}

export default function Slide16Monorepo() {
  const [open, setOpen] = useState(() => new Set<string>(["root", "artifacts", "lib"]));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0e1628 0%, #111c35 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-[0.7vh]" style={{ background: "#f59e0b" }} />

      <div className="flex h-full flex-col px-[6vw] pt-[7vh] pb-[6vh]">
        <div style={{ fontSize: "1.5vw", fontWeight: 600, color: "#f59e0b", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          <span style={{ fontFamily: "DM Sans, sans-serif" }}>MONOREPO · </span><span style={{ fontFamily: "Tajawal, sans-serif" }}>هيكل المستودع</span>
        </div>
        <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 900, fontSize: "3.5vw", color: "#f1f5f9", marginTop: "1vh", lineHeight: 1.15 }}>
          حزم منفصلة لتسريع البناء وفصل المخاطر
        </div>
        <div style={{ fontFamily: "DM Sans, sans-serif", fontSize: "1.65vw", color: "#94a3b8", marginTop: "1vh" }}>
          Expand / collapse nodes — interactive documentation tree
        </div>
        <div style={{ width: "9vw", height: "0.35vh", background: "#f59e0b", marginTop: "3vh" }} />

        <div style={{ flex: 1, marginTop: "2.5vh", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "2.5vw", minHeight: 0 }}>
          <div style={{ background: "rgba(30,58,95,0.45)", border: "0.1vw solid rgba(245,158,11,0.2)", borderRadius: "1vw", padding: "2.5vh 2vw", overflow: "auto" }}>
            <TreeRows node={tree} depth={0} open={open} toggle={toggle} />
          </div>
          <div style={{ background: "rgba(245,158,11,0.06)", border: "0.1vw solid rgba(245,158,11,0.25)", borderRadius: "1vw", padding: "3vh 2.5vw" }}>
            <div style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 800, fontSize: "2vw", color: "#f59e0b", marginBottom: "1.5vh" }}>لماذا Monorepo هنا؟</div>
            <ul style={{ fontFamily: "Tajawal, sans-serif", fontSize: "1.45vw", color: "#cbd5e1", lineHeight: 1.65, paddingInlineStart: "1.2em", margin: 0 }}>
              <li>عقد API واحد يغذي الخادم والعميل المولَّع</li>
              <li>مخطط قاعدة البيانات مصدر حقيقة واحد في ‎@workspace/db‎</li>
              <li>نوعيات TypeScript مشتركة عبر الحزم</li>
              <li>عروض ووثائق داخل ‎artifacts‎ دون خلطها بكود الواجهة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
