import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "LEXPERTISE COLOMBIA S.A.S · Servicios jurídicos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir en redes: el triángulo del logotipo y una composición tipográfica, sin fotografías. */
export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "brand", "logo-triangulo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
          background: "#0B2B36",
          color: "#F5FAFB",
          backgroundImage:
            "radial-gradient(900px 420px at 88% -10%, rgba(19,215,214,0.22), rgba(19,215,214,0) 62%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 72px 72px, 72px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={78} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", fontSize: 38, letterSpacing: 9 }}>LEXPERTISE</div>
            <div style={{ display: "flex", fontSize: 15, letterSpacing: 7, color: "#2BDBC9", textTransform: "uppercase" }}>Colombia S.A.S</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", width: 88, height: 4, backgroundImage: "linear-gradient(90deg, #2BDBC9, #13D7D6, #0FC3FE)" }} />
          <div style={{ fontSize: 68, lineHeight: 1.08, maxWidth: 900 }}>Cada decisión jurídica merece un análisis cuidadoso.</div>
          <div style={{ fontSize: 28, color: "rgba(245,250,251,0.72)" }}>Servicios jurídicos para personas y empresas en Colombia</div>
        </div>
      </div>
    ),
    size,
  );
}
