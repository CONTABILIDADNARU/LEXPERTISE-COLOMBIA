import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Inicio del login de GitHub para el panel de contenidos (Decap CMS).
 * Solo quienes tengan permiso de escritura en el repositorio podrán guardar cambios.
 */
export function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) return new NextResponse("Panel no configurado: falta GITHUB_OAUTH_CLIENT_ID.", { status: 503 });
  const state = randomBytes(16).toString("hex");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", `${req.nextUrl.origin}/api/cms/callback`);
  const res = NextResponse.redirect(url);
  res.cookies.set("lx_cms_state", state, { httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "lax", path: "/api/cms", maxAge: 600 });
  return res;
}
