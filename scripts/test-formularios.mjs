#!/usr/bin/env node
/**
 * Pruebas de la API de solicitudes contra un servidor en ejecución.
 *   BASE_URL=http://localhost:3100 node scripts/test-formularios.mjs
 * Usa datos ficticios (dominio example.com) y direcciones IP de prueba distintas por caso
 * para no activar el límite de envíos, salvo en la prueba específica del límite.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const BASE = (process.env.BASE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const VERSION = JSON.parse(readFileSync("content/legal/consentimientos.json", "utf8")).version;
let ipN = 10;

function fechaBogota(dias) {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  const [y, m, d] = hoy.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

const base = (extra = {}) => ({
  tipo: "contacto",
  publico: "persona",
  area: "familia",
  subcategoria: "divorcio-mutuo-acuerdo",
  etapa: "sin-iniciar",
  urgencia: "este-mes",
  modalidad: "virtual",
  pago: "puede",
  ciudad: "Bogotá",
  preferenciaContacto: "whatsapp",
  nombre: "Prueba Automática",
  telefono: "300 000 0000",
  correo: "qa+api@example.com",
  empresa: "",
  comoNosConocio: "Google",
  aceptaPoliticaCancelacion: true,
  consentimientoDatos: true,
  consentimientoComercial: false,
  versionConsentimiento: VERSION,
  paginaOrigen: "/divorcio-mutuo-acuerdo",
  atribucion: { primero: { landing: "/divorcio-mutuo-acuerdo", referrer: "", fecha: new Date().toISOString(), utm_source: "meta", utm_medium: "paid_social", utm_campaign: "qa" }, ultimo: { landing: "/divorcio-mutuo-acuerdo", referrer: "", fecha: new Date().toISOString(), utm_source: "meta", utm_medium: "paid_social", utm_campaign: "qa" } },
  idempotencyKey: randomUUID(),
  website: "",
  t: Date.now() - 20_000,
  ...extra,
});

async function enviar(body, { origin = BASE, ip = `198.51.100.${ipN++}`, raw } = {}) {
  const res = await fetch(`${BASE}/api/solicitudes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin, "X-Forwarded-For": ip },
    body: raw ?? JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => null) };
}

const resultados = [];
async function caso(nombre, fn) {
  try {
    const detalle = await fn();
    resultados.push({ nombre, ok: true, detalle });
  } catch (e) {
    resultados.push({ nombre, ok: false, detalle: e.message });
  }
}
const esperar = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const valida = base();
let idCreado = "";
await caso("Envío válido (contacto) → prioridad alta, ruta agendar", async () => {
  const r = await enviar(valida);
  esperar(r.status === 201 && r.data?.ok && /^LX-\d{8}-[A-Z0-9]{6}$/.test(r.data.id), `status ${r.status} ${JSON.stringify(r.data)}`);
  esperar(r.data.prioridad === "alta" && r.data.ruta === "agendar", `prioridad ${r.data.prioridad} / ruta ${r.data.ruta}`);
  idCreado = r.data.id;
  return `201 · ${r.data.id} · alta → agendar`;
});
await caso("Reenvío con la misma clave (doble clic / reintento)", async () => {
  const r = await enviar(valida);
  esperar(r.status === 200 && r.data?.duplicada && r.data.id === idCreado && r.data.ruta === "agendar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `200 · misma referencia ${r.data.id}, sin duplicar`;
});
await caso("Sin etapa ni urgencia (filtro obligatorio)", async () => {
  const r = await enviar(base({ etapa: undefined, urgencia: undefined }));
  esperar(r.status === 422 && r.data?.campos?.etapa && r.data?.campos?.urgencia, `status ${r.status} ${JSON.stringify(r.data?.campos)}`);
  return `422 · «${r.data.campos.etapa}» / «${r.data.campos.urgencia}»`;
});
await caso("Fecha límite próxima → prioridad alta aunque no sepa cuándo avanzar", async () => {
  const r = await enviar(base({ etapa: "fecha-limite", urgencia: "no-se" }));
  esperar(r.status === 201 && r.data.prioridad === "alta" && r.data.ruta === "agendar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id} · alta → agendar`;
});
await caso("Puede pagar, sin urgencia (próximos meses) → prioridad media, agenda por WhatsApp", async () => {
  const r = await enviar(base({ urgencia: "proximos-meses" }));
  esperar(r.status === 201 && r.data.prioridad === "media" && r.data.ruta === "agendar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id} · media → agendar`;
});
await caso("Puede pagar pero solo quiere informarse → prioridad baja, se guarda igual", async () => {
  const r = await enviar(base({ etapa: "informarse", urgencia: "inmediata" }));
  esperar(r.status === 201 && r.data.prioridad === "baja" && r.data.ruta === "agendar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id} · baja → agendar`;
});
await caso("Quiere conversar la forma de pago → prioridad media, ruta WhatsApp", async () => {
  const r = await enviar(base({ pago: "conversar" }));
  esperar(r.status === 201 && r.data.prioridad === "media" && r.data.ruta === "conversar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id} · media → conversar`;
});
await caso("Sin respuesta sobre el pago (encuesta obligatoria)", async () => {
  const r = await enviar(base({ pago: undefined }));
  esperar(r.status === 422 && r.data?.campos?.pago, `status ${r.status} ${JSON.stringify(r.data?.campos)}`);
  return `422 · «${r.data.campos.pago}»`;
});
await caso("Respuesta de pago fuera de la lista (la opción «no puedo pagar» ya no existe)", async () => {
  const r = await enviar(base({ pago: "no-puede" }));
  esperar(r.status === 422 && r.data?.campos?.pago, `status ${r.status} ${JSON.stringify(r.data)}`);
  return "422 · no se guarda";
});
await caso("Sin aceptar la Política de Cancelación y Reprogramación", async () => {
  const r = await enviar(base({ aceptaPoliticaCancelacion: false }));
  esperar(r.status === 422 && r.data?.campos?.aceptaPoliticaCancelacion, `status ${r.status} ${JSON.stringify(r.data?.campos)}`);
  return `422 · «${r.data.campos.aceptaPoliticaCancelacion}»`;
});
await caso("Correo inválido", async () => {
  const r = await enviar(base({ correo: "correo-sin-arroba" }));
  esperar(r.status === 422 && r.data?.campos?.correo, `status ${r.status}`);
  return `422 · «${r.data.campos.correo}»`;
});
await caso("Teléfono inválido", async () => {
  const r = await enviar(base({ telefono: "12345" }));
  esperar(r.status === 422 && r.data?.campos?.telefono, `status ${r.status}`);
  return "422 · campo telefono";
});
await caso("Sin autorización de datos", async () => {
  const r = await enviar(base({ consentimientoDatos: false }));
  esperar(r.status === 422 && r.data?.campos?.consentimientoDatos, `status ${r.status}`);
  return "422 · campo consentimientoDatos";
});
await caso("Área no disponible para el público (familia + empresa)", async () => {
  const r = await enviar(base({ publico: "empresa", subcategoria: "" }));
  esperar(r.status === 422 && r.data?.campos?.area, `status ${r.status}`);
  return "422 · campo area";
});
await caso("Campo trampa lleno (bot)", async () => {
  const r = await enviar(base({ website: "http://spam.example" }));
  esperar(r.status === 400 && r.data?.codigo === "RECHAZADA", `status ${r.status}`);
  return "400 · rechazada sin registrar";
});
await caso("Envío demasiado rápido (bot)", async () => {
  const r = await enviar(base({ t: Date.now() }));
  esperar(r.status === 400 && r.data?.codigo === "RECHAZADA", `status ${r.status}`);
  return "400 · rechazada sin registrar";
});
await caso("Origen externo (CSRF)", async () => {
  const r = await enviar(base(), { origin: "https://sitio-malicioso.example" });
  esperar(r.status === 403, `status ${r.status}`);
  return "403";
});
await caso("Versión de consentimiento desactualizada", async () => {
  const r = await enviar(base({ versionConsentimiento: "2000-01-01.0" }));
  esperar(r.status === 409, `status ${r.status}`);
  return "409 · pide recargar";
});
await caso("Cuerpo demasiado grande", async () => {
  const r = await enviar(null, { raw: JSON.stringify(base({ ciudad: "x".repeat(20_000) })) });
  esperar(r.status === 413, `status ${r.status}`);
  return "413";
});
await caso("JSON malformado", async () => {
  const r = await enviar(null, { raw: "{no-json" });
  esperar(r.status === 400, `status ${r.status}`);
  return "400";
});
await caso("Agendamiento válido (3 fechas, franja, modalidad)", async () => {
  const r = await enviar(base({ tipo: "agendamiento", modalidad: "virtual", franja: "manana", fechasPreferidas: [fechaBogota(3), fechaBogota(5), fechaBogota(7)], paginaOrigen: "/agendar-consulta" }));
  esperar(r.status === 201 && r.data?.ok, `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id}`;
});
await caso("Agendamiento con fecha pasada", async () => {
  const r = await enviar(base({ tipo: "agendamiento", modalidad: "virtual", franja: "tarde", fechasPreferidas: [fechaBogota(-1)] }));
  esperar(r.status === 422 && r.data?.campos?.fechasPreferidas, `status ${r.status}`);
  return `422 · «${r.data.campos.fechasPreferidas}»`;
});
await caso("Fuera del portafolio (área «otro») → revisión humana, prioridad media", async () => {
  const r = await enviar(base({ area: "otro", subcategoria: "" }));
  esperar(r.status === 201 && r.data.prioridad === "media" && r.data.ruta === "agendar", `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id} (requiereRevisionHumana) · media → agendar`;
});
await caso("Empresa (B2B) sin NIT", async () => {
  const r = await enviar(base({ publico: "empresa", area: "comercial", subcategoria: "contratos-comerciales", empresa: "Empresa de Prueba SAS", paginaOrigen: "/empresas" }));
  esperar(r.status === 201, `status ${r.status} ${JSON.stringify(r.data)}`);
  return `201 · ${r.data.id}`;
});
await caso("Límite de envíos por IP", async () => {
  const ip = "203.0.113.77";
  let ultimo = 0;
  for (let i = 0; i < 7; i++) ultimo = (await enviar(base({ correo: "invalido" }), { ip })).status;
  esperar(ultimo === 429, `último status ${ultimo}`);
  return "429 tras 5 intentos en 10 min";
});
await caso("GET no permitido", async () => {
  const res = await fetch(`${BASE}/api/solicitudes`);
  esperar(res.status === 405, `status ${res.status}`);
  return "405";
});

console.log(`\nPruebas de formularios contra ${BASE}\n`);
for (const r of resultados) console.log(`${r.ok ? "✔" : "✖"} ${r.nombre} — ${r.detalle}`);
const fallos = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - fallos}/${resultados.length} pruebas superadas.`);
process.exit(fallos ? 1 : 0);
