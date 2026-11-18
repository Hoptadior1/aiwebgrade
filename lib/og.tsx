import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Branded social share image (Pinterest, Facebook, Reddit, X, iMessage previews). */
export function ogImage(title: string, subtitle: string, section = "Free calculator") {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#16191d", padding: 64, color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, background: "#f5a300", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#16191d", fontSize: 40, fontWeight: 800 }}>÷</div>
          <div style={{ fontSize: 34, fontWeight: 800, display: "flex" }}>
            AIWebGrade<span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 400, marginLeft: 10 }}>Calculators</span>
          </div>
        </div>
        <div style={{ marginTop: 70, fontSize: 26, color: "#f5a300", textTransform: "uppercase", letterSpacing: 4, display: "flex" }}>{section}</div>
        <div style={{ marginTop: 14, fontSize: 76, fontWeight: 800, lineHeight: 1.05, display: "flex" }}>{title}</div>
        <div style={{ marginTop: 22, fontSize: 36, color: "rgba(255,255,255,0.75)", display: "flex" }}>{subtitle}</div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)", display: "flex" }}>www.aiwebgrade.com</div>
          <div style={{ background: "#f5a300", color: "#16191d", fontSize: 30, fontWeight: 800, padding: "14px 30px", borderRadius: 10, display: "flex" }}>Shopping list + PDF →</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
