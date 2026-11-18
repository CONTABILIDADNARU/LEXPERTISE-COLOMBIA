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
  // Forum: la tipografía más parecida a las mayúsculas del logotipo (licencia abierta, OFL).
  const forum = await readFile(join(process.cwd(), "src", "app", "fonts", "Forum-Regular.ttf"));

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
          background: "#4A4C4F",
          color: "#FAFCFC",
          fontFamily: "Forum",
          backgroundImage:
            "radial-gradient(900px 420px at 88% -10%, rgba(19,215,214,0.28), rgba(19,215,214,0) 62%), radial-gradient(700px 360px at -6% 108%, rgba(15,195,254,0.16), rgba(15,195,254,0) 60%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 72px 72px, 72px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={96} height={78} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", fontSize: 40, letterSpacing: 12 }}>LEXPERTISE</div>
            <div style={{ display: "flex", fontSize: 17, letterSpacing: 9, color: "rgba(250,252,252,0.78)", textTransform: "uppercase" }}>Colombia S.A.S</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", width: 88, height: 4, backgroundImage: "linear-gradient(90deg, #2BDBC9, #13D7D6, #0FC3FE)" }} />
          <div style={{ fontSize: 70, lineHeight: 1.1, maxWidth: 940 }}>Cada decisión jurídica merece un análisis cuidadoso.</div>
          <div style={{ fontSize: 28, color: "rgba(250,252,252,0.75)" }}>Servicios jurídicos para personas y empresas en Colombia</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Forum", data: forum, style: "normal", weight: 400 }] },
  );
}
