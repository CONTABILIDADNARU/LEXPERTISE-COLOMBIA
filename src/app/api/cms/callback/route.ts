import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function pagina(estado: "success" | "error", contenido: object, origen: string) {
  // Protocolo de Decap CMS: la ventana emergente avisa a la ventana del panel y le entrega el token
  // únicamente si el mensaje viene del mismo origen del sitio.
  const mensaje = JSON.stringify(`authorization:github:${estado}:${JSON.stringify(contenido)}`);
  const html = `<!doctype html><html lang="es"><body><p>Autenticando…</p><script>
(function () {
  var origen = ${JSON.stringify(origen)};
  function recibir(e) {
    if (e.origin !== origen) return;
    window.opener.postMessage(${mensaje}, origen);
    window.removeEventListener("message", recibir);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener("message", recibir, false);
  window.opener && window.opener.postMessage("authorizing:github", origen);
})();
</script></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  const origen = req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const esperado = req.cookies.get("lx_cms_state")?.value;
  if (!code || !state || !esperado || state !== esperado) {
    return pagina("error", { message: "Solicitud de inicio de sesión inválida." }, origen);
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: `${origen}/api/cms/callback`,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  const data = (await res?.json().catch(() => null)) as { access_token?: string; error_description?: string } | null;
  if (!data?.access_token) {
    return pagina("error", { message: data?.error_description ?? "No fue posible iniciar sesión con GitHub." }, origen);
  }
  const respuesta = pagina("success", { token: data.access_token, provider: "github" }, origen);
  respuesta.cookies.delete("lx_cms_state");
  return respuesta;
}
