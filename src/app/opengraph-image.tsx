import { ImageResponse } from "next/og";

export const alt = "LEXPERTISE COLOMBIA S.A.S · Servicios jurídicos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir en redes: composición tipográfica, sin fotografías. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#142235",
          color: "#FAF9F6",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, letterSpacing: 8 }}>
            LEXPERTISE
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#B39A70" }} />
          </div>
          <div style={{ display: "flex", fontSize: 15, letterSpacing: 7, color: "#B39A70", textTransform: "uppercase" }}>Colombia S.A.S</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", width: 64, height: 2, background: "#B39A70" }} />
          <div style={{ fontSize: 68, lineHeight: 1.08, maxWidth: 900 }}>Cada decisión jurídica merece un análisis cuidadoso.</div>
          <div style={{ fontSize: 28, color: "rgba(250,249,246,0.7)" }}>Servicios jurídicos para personas y empresas en Colombia</div>
        </div>
      </div>
    ),
    size,
  );
}
