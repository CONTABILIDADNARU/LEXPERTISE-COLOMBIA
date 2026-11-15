"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Lock, MessageCircle, TriangleAlert } from "lucide-react";
import { track } from "@/lib/analytics";
import { leerAtribucion } from "@/lib/attribution";
import { CIUDADES_SUGERIDAS, type Publico } from "@/lib/areas";
import type { RespuestaApi } from "@/lib/leads/schema";
import { CLAVE_SIGUIENTE_PASO, ETAPAS, MODALIDADES, URGENCIAS, type SiguientePaso } from "@/lib/leads/opciones";
import { hoyEnBogota, sumarDias, validarCiudad, validarCorreo, validarFechaPreferida, validarNombre, validarTelefono } from "@/lib/leads/validators";
import { buttonClasses, cx } from "./ui";

export type AreaOpcion = {
  key: string;
  nombre: string;
  publicos: Publico[];
  subcategorias: Record<Publico, { valor: string; etiqueta: string }[]>;
};

type Paso = "consulta" | "situacion" | "atencion" | "datos";
const NOMBRE_PASO: Record<Paso, string> = {
  consulta: "Tu consulta",
  situacion: "Tu situación",
  atencion: "Atención",
  datos: "Datos de contacto",
};

type Valores = {
  publico: Publico | "";
  area: string;
  subcategoria: string;
  etapa: "" | (typeof ETAPAS)[number]["valor"];
  urgencia: "" | (typeof URGENCIAS)[number]["valor"];
  ciudad: string;
  preferenciaContacto: "" | "whatsapp" | "llamada" | "correo";
  modalidad: "" | "virtual" | "presencial" | "telefonica" | "sin-preferencia";
  fechas: [string, string, string];
  franja: "" | "manana" | "tarde" | "indiferente";
  nombre: string;
  telefono: string;
  correo: string;
  empresa: string;
  comoNosConocio: string;
  consentimientoDatos: boolean;
  consentimientoComercial: boolean;
};

type Props = {
  tipo: "contacto" | "agendamiento";
  areas: AreaOpcion[];
  preset?: { publico?: Publico; area?: string; subcategoria?: string };
  consent: { version: string; tratamientoDatos: string; comunicacionesComerciales: string; avisoFormulario: string };
  comoNosConocio: string[];
  whatsappHref: string | null;
  /** Hay agenda en línea: no se piden fechas posibles (la cita se elige en /gracias). */
  conAgenda: boolean;
  titulo?: string;
  descripcion?: string;
  className?: string;
};

const CAMPO_A_PASO: Record<string, Paso> = {
  publico: "consulta",
  area: "consulta",
  subcategoria: "situacion",
  etapa: "situacion",
  urgencia: "situacion",
  ciudad: "atencion",
  preferenciaContacto: "atencion",
  modalidad: "atencion",
  fechasPreferidas: "atencion",
  franja: "atencion",
  nombre: "datos",
  telefono: "datos",
  correo: "datos",
  empresa: "datos",
  consentimientoDatos: "datos",
};

export function LeadForm({ tipo, areas, preset, consent, comoNosConocio, whatsappHref, conAgenda, titulo, descripcion, className }: Props) {
  const router = useRouter();
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const clave = useRef<string>("");
  const inicio = useRef<number>(0);
  const iniciado = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clave.current = uuid();
    inicio.current = Date.now();
  }, []);

  const [v, setV] = useState<Valores>({
    publico: preset?.publico ?? "",
    area: preset?.area ?? "",
    subcategoria: preset?.subcategoria ?? "",
    etapa: "",
    urgencia: "",
    ciudad: "",
    preferenciaContacto: "",
    modalidad: "",
    fechas: ["", "", ""],
    franja: "",
    nombre: "",
    telefono: "",
    correo: "",
    empresa: "",
    comoNosConocio: "",
    consentimientoDatos: false,
    consentimientoComercial: false,
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");
  const [mensajeError, setMensajeError] = useState("");

  const pasos = useMemo<Paso[]>(() => {
    const p: Paso[] = [];
    if (!preset?.publico || !preset?.area) p.push("consulta");
    p.push("situacion", "atencion", "datos");
    return p;
  }, [preset?.publico, preset?.area]);
  const pideFechas = tipo === "agendamiento" && !conAgenda;
  const [indice, setIndice] = useState(0);
  const paso = pasos[indice];

  const hoy = useMemo(() => hoyEnBogota(), []);
  const minFecha = sumarDias(hoy, 1);
  const maxFecha = sumarDias(hoy, 90);

  const areasDelPublico = areas.filter((a) => !v.publico || a.publicos.includes(v.publico));
  const areaActual = areas.find((a) => a.key === v.area);
  const subcats = areaActual && v.publico ? areaActual.subcategorias[v.publico] : [];

  function set<K extends keyof Valores>(k: K, valor: Valores[K]) {
    if (!iniciado.current) {
      iniciado.current = true;
      track("form_start", { formulario: tipo });
    }
    setV((prev) => {
      const next = { ...prev, [k]: valor };
      // Si cambia el público o el área, se limpian las opciones que dejan de ser válidas.
      if (k === "publico" && prev.area && !areas.find((a) => a.key === prev.area)?.publicos.includes(valor as Publico) && prev.area !== "otro") {
        next.area = "";
        next.subcategoria = "";
      }
      if (k === "area" && valor !== prev.area) next.subcategoria = "";
      return next;
    });
    setErrores((e) => {
      if (!e[k as string]) return e;
      const { [k as string]: _omit, ...rest } = e;
      void _omit;
      return rest;
    });
  }

  function validarPaso(p: Paso): Record<string, string> {
    const e: Record<string, string> = {};
    if (p === "consulta") {
      if (!v.publico) e.publico = "Indica si consultas como persona o como empresa.";
      if (!v.area) e.area = "Elige el área de tu consulta.";
    }
    if (p === "situacion") {
      if (subcats.length > 0 && !v.subcategoria) e.subcategoria = "Elige la opción que mejor describa tu asunto.";
      if (!v.etapa) e.etapa = "Indica en qué punto está tu asunto.";
      if (!v.urgencia) e.urgencia = "Indica cuándo quieres avanzar.";
    }
    if (p === "atencion") {
      const c = validarCiudad(v.ciudad);
      if (c) e.ciudad = c;
      if (!v.modalidad) e.modalidad = "Elige tu preferencia de modalidad.";
      if (!v.preferenciaContacto) e.preferenciaContacto = "Elige cómo prefieres que te contactemos.";
      if (pideFechas) {
        if (!v.franja) e.franja = "Elige una franja horaria.";
        const fechas = v.fechas.filter(Boolean);
        if (fechas.length === 0) e.fechasPreferidas = "Indica al menos una fecha posible.";
        for (const f of fechas) {
          const err = validarFechaPreferida(f, hoy);
          if (err) e.fechasPreferidas = err;
        }
        if (new Set(fechas).size !== fechas.length) e.fechasPreferidas = "Las fechas no deben repetirse.";
      }
    }
    if (p === "datos") {
      const n = validarNombre(v.nombre);
      if (n) e.nombre = n;
      const t = validarTelefono(v.telefono);
      if (t) e.telefono = t;
      const c = validarCorreo(v.correo);
      if (c) e.correo = c;
      if (!v.consentimientoDatos) e.consentimientoDatos = "Debes autorizar el tratamiento de datos para que podamos responder tu solicitud.";
    }
    return e;
  }

  function enfocarPrimerError(e: Record<string, string>) {
    requestAnimationFrame(() => {
      const primero = Object.keys(e)[0];
      contenedor.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus();
    });
  }

  function irA(nuevo: number) {
    setIndice(nuevo);
    requestAnimationFrame(() => contenedor.current?.querySelector<HTMLElement>("[data-titulo-paso]")?.focus());
  }

  function continuar() {
    const e = validarPaso(paso);
    if (Object.keys(e).length) {
      setErrores(e);
      enfocarPrimerError(e);
      return;
    }
    track("form_step", { formulario: tipo, paso: paso });
    irA(indice + 1);
  }

  async function enviar() {
    if (estado === "enviando") return;
    // Valida todos los pasos (por si algún dato quedó inválido).
    for (let i = 0; i < pasos.length; i++) {
      const e = validarPaso(pasos[i]);
      if (Object.keys(e).length) {
        setErrores(e);
        setIndice(i);
        enfocarPrimerError(e);
        return;
      }
    }
    setEstado("enviando");
    setMensajeError("");
    const payload = {
      tipo,
      publico: v.publico,
      area: v.area,
      subcategoria: v.subcategoria,
      etapa: v.etapa,
      urgencia: v.urgencia,
      modalidad: v.modalidad,
      ciudad: v.ciudad,
      preferenciaContacto: v.preferenciaContacto,
      nombre: v.nombre,
      telefono: v.telefono,
      correo: v.correo,
      empresa: v.publico === "empresa" ? v.empresa : "",
      comoNosConocio: v.comoNosConocio,
      ...(pideFechas ? { fechasPreferidas: v.fechas.filter(Boolean), franja: v.franja } : {}),
      consentimientoDatos: v.consentimientoDatos,
      consentimientoComercial: v.consentimientoComercial,
      versionConsentimiento: consent.version,
      paginaOrigen: window.location.pathname,
      atribucion: leerAtribucion(),
      idempotencyKey: clave.current,
      website: honeypot.current?.value ?? "",
      t: inicio.current,
    };

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      const data = (await res.json().catch(() => null)) as RespuestaApi | null;
      if (res.ok && data?.ok) {
        track(
          tipo === "agendamiento" ? "schedule_request" : "generate_lead",
          { formulario: tipo, area: v.area, publico: v.publico, prioridad: data.prioridad, ruta: data.ruta },
          { eventId: data.id },
        );
        guardarSiguientePaso(data.id);
        router.push(`/gracias?ref=${encodeURIComponent(data.id)}&tipo=${tipo}&ruta=${data.ruta}`);
        return;
      }
      if (data && !data.ok && data.campos) {
        setErrores(data.campos);
        const primerPaso = pasos.findIndex((p) => Object.keys(data.campos!).some((c) => CAMPO_A_PASO[c] === p));
        if (primerPaso >= 0) setIndice(primerPaso);
        enfocarPrimerError(data.campos);
      }
      setEstado("error");
      setMensajeError(data && !data.ok ? data.mensaje : "No pudimos registrar tu solicitud. Tus datos siguen en el formulario: inténtalo de nuevo.");
    } catch {
      setEstado("error");
      setMensajeError("No pudimos conectar con el servidor. Revisa tu conexión: tus datos siguen en el formulario y puedes intentarlo de nuevo.");
    } finally {
      clearTimeout(timer);
    }
  }

  /** Resumen para el mensaje de WhatsApp de /gracias. Solo vive en esta pestaña (sessionStorage). */
  function guardarSiguientePaso(ref: string) {
    const sub = subcats.find((x) => x.valor === v.subcategoria);
    const tema = sub && sub.valor !== "otro" ? sub.etiqueta : areaActual?.nombre ?? "otro asunto";
    const datos: SiguientePaso = {
      ref,
      tema: tema.toLowerCase(),
      etapa: ETAPAS.find((x) => x.valor === v.etapa)?.resumen ?? "",
      urgencia: URGENCIAS.find((x) => x.valor === v.urgencia)?.resumen ?? "",
    };
    try {
      sessionStorage.setItem(CLAVE_SIGUIENTE_PASO, JSON.stringify(datos));
    } catch {
      // Sin almacenamiento (modo privado estricto): /gracias usa un mensaje sin resumen.
    }
  }

  const err = (k: string) => errores[k];
  const total = pasos.length;
  const ultimo = indice === total - 1;

  return (
    <div ref={contenedor} className={cx("border border-line bg-paper p-5 text-graphite shadow-[var(--shadow-card)] sm:p-8", className)}>
      {titulo && <h2 className="text-2xl text-navy sm:text-3xl">{titulo}</h2>}
      {descripcion && <p className="mt-2 text-[0.95rem] text-slate">{descripcion}</p>}

      <div className={cx(titulo || descripcion ? "mt-6" : "")}>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate">
          <span>
            Paso {indice + 1} de {total}
          </span>
          <span className="text-bronze-ink">{NOMBRE_PASO[paso]}</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {pasos.map((p, i) => (
            <span key={p} className={cx("h-1 flex-1 transition-colors", i <= indice ? "bg-navy" : "bg-mist")} />
          ))}
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (ultimo) void enviar();
          else continuar();
        }}
        className="mt-6"
        aria-describedby={estado === "error" ? id("error") : undefined}
      >
        {/* Campo trampa para bots: oculto para personas y lectores de pantalla. */}
        <div aria-hidden className="absolute left-[-10000px] top-auto size-px overflow-hidden">
          <label htmlFor={id("website")}>No completar este campo</label>
          <input ref={honeypot} id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <fieldset>
          <legend data-titulo-paso tabIndex={-1} className="text-lg font-bold text-navy outline-none">
            {paso === "consulta" && (preset?.publico ? "¿Sobre qué área es tu consulta?" : "¿Sobre qué es tu consulta?")}
            {paso === "situacion" && "Cuéntanos tu situación"}
            {paso === "atencion" && (pideFechas ? "Cuéntanos tus preferencias" : "¿Cómo prefieres que te atendamos?")}
            {paso === "datos" && "¿Cómo te contactamos?"}
          </legend>

          {paso === "consulta" && (
            <div className="mt-5 grid gap-6">
              {!preset?.publico && (
                <Opciones
                  nombre="publico"
                  legend="Consultas como"
                  error={err("publico")}
                  errorId={id("e-publico")}
                  columnas={2}
                  valor={v.publico}
                  onChange={(x) => set("publico", x as Publico)}
                  opciones={[
                    { valor: "persona", etiqueta: "Persona natural", detalle: "Asuntos personales o familiares" },
                    { valor: "empresa", etiqueta: "Empresa u organización", detalle: "Asuntos de un negocio o entidad" },
                  ]}
                />
              )}
              {!preset?.area && (
                <Opciones
                  nombre="area"
                  legend="Área"
                  error={err("area")}
                  errorId={id("e-area")}
                  columnas={2}
                  denso
                  valor={v.area}
                  onChange={(x) => set("area", x)}
                  opciones={[
                    ...areasDelPublico.map((a) => ({ valor: a.key, etiqueta: a.nombre })),
                    { valor: "otro", etiqueta: "Otro asunto / no estoy seguro" },
                  ]}
                />
              )}
            </div>
          )}

          {paso === "situacion" && (
            <div className="mt-5 grid gap-6">
              {preset?.area && areaActual && (
                <p className="text-sm text-slate">
                  Área: <strong className="text-navy">{areaActual.nombre}</strong>
                </p>
              )}
              {subcats.length > 0 && (
                <Campo label="Tipo de asunto" htmlFor={id("subcategoria")} error={err("subcategoria")} errorId={id("e-subcategoria")}>
                  <select
                    id={id("subcategoria")}
                    data-campo="subcategoria"
                    value={v.subcategoria}
                    onChange={(e) => set("subcategoria", e.target.value)}
                    aria-invalid={Boolean(err("subcategoria"))}
                    aria-describedby={err("subcategoria") ? id("e-subcategoria") : undefined}
                    className={inputCls(err("subcategoria"))}
                  >
                    <option value="">Selecciona una opción</option>
                    {subcats.map((s) => (
                      <option key={s.valor} value={s.valor}>
                        {s.etiqueta}
                      </option>
                    ))}
                  </select>
                </Campo>
              )}
              <Opciones
                nombre="etapa"
                legend="¿En qué punto está tu asunto?"
                error={err("etapa")}
                errorId={id("e-etapa")}
                denso
                valor={v.etapa}
                onChange={(x) => set("etapa", x as Valores["etapa"])}
                opciones={ETAPAS.map((e) => ({ valor: e.valor, etiqueta: e.etiqueta }))}
              />
              <Opciones
                nombre="urgencia"
                legend="¿Cuándo quieres avanzar?"
                error={err("urgencia")}
                errorId={id("e-urgencia")}
                columnas={4}
                compacto
                valor={v.urgencia}
                onChange={(x) => set("urgencia", x as Valores["urgencia"])}
                opciones={URGENCIAS.map((u) => ({ valor: u.valor, etiqueta: u.etiqueta }))}
              />
            </div>
          )}

          {paso === "atencion" && (
            <div className="mt-5 grid gap-5">
              <Campo label="Ciudad" htmlFor={id("ciudad")} error={err("ciudad")} errorId={id("e-ciudad")} ayuda="Ciudad desde la que consultas.">
                <input
                  id={id("ciudad")}
                  data-campo="ciudad"
                  type="text"
                  list={id("ciudades")}
                  autoComplete="address-level2"
                  maxLength={60}
                  value={v.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)}
                  aria-invalid={Boolean(err("ciudad"))}
                  aria-describedby={err("ciudad") ? id("e-ciudad") : undefined}
                  className={inputCls(err("ciudad"))}
                />
                <datalist id={id("ciudades")}>
                  {CIUDADES_SUGERIDAS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Campo>

              <Opciones
                nombre="modalidad"
                legend="Modalidad preferida"
                ayuda="La firma confirmará las modalidades disponibles."
                error={err("modalidad")}
                errorId={id("e-modalidad")}
                columnas={4}
                compacto
                valor={v.modalidad}
                onChange={(x) => set("modalidad", x as Valores["modalidad"])}
                opciones={MODALIDADES.map((m) => ({ valor: m.valor, etiqueta: m.etiqueta }))}
              />

              {pideFechas && (
                <>
                  <fieldset>
                    <legend className="text-sm font-semibold text-navy">Fechas posibles (hora de Colombia)</legend>
                    <p className="mt-1 text-sm text-slate">Indica hasta tres fechas. No son citas confirmadas: te contactaremos para acordar el horario.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i}>
                          <label htmlFor={id(`fecha${i}`)} className="text-xs font-semibold text-slate">
                            Opción {i + 1}
                            {i > 0 && " (opcional)"}
                          </label>
                          <input
                            id={id(`fecha${i}`)}
                            data-campo={i === 0 ? "fechasPreferidas" : undefined}
                            type="date"
                            min={minFecha}
                            max={maxFecha}
                            value={v.fechas[i]}
                            onChange={(e) => {
                              const f = [...v.fechas] as Valores["fechas"];
                              f[i] = e.target.value;
                              set("fechas", f);
                              setErrores((x) => {
                                const { fechasPreferidas: _f, ...r } = x;
                                void _f;
                                return r;
                              });
                            }}
                            aria-invalid={Boolean(err("fechasPreferidas"))}
                            aria-describedby={err("fechasPreferidas") ? id("e-fechas") : undefined}
                            className={inputCls(err("fechasPreferidas"))}
                          />
                        </div>
                      ))}
                    </div>
                    {err("fechasPreferidas") && <MensajeError id={id("e-fechas")}>{err("fechasPreferidas")}</MensajeError>}
                  </fieldset>
                  <Opciones
                    nombre="franja"
                    legend="Franja horaria"
                    error={err("franja")}
                    errorId={id("e-franja")}
                    columnas={3}
                    compacto
                    valor={v.franja}
                    onChange={(x) => set("franja", x as Valores["franja"])}
                    opciones={[
                      { valor: "manana", etiqueta: "Mañana" },
                      { valor: "tarde", etiqueta: "Tarde" },
                      { valor: "indiferente", etiqueta: "Indiferente" },
                    ]}
                  />
                </>
              )}

              <Opciones
                nombre="preferenciaContacto"
                legend="¿Cómo prefieres que te contactemos?"
                error={err("preferenciaContacto")}
                errorId={id("e-preferencia")}
                columnas={3}
                compacto
                valor={v.preferenciaContacto}
                onChange={(x) => set("preferenciaContacto", x as Valores["preferenciaContacto"])}
                opciones={[
                  { valor: "whatsapp", etiqueta: "WhatsApp" },
                  { valor: "llamada", etiqueta: "Llamada" },
                  { valor: "correo", etiqueta: "Correo" },
                ]}
              />
            </div>
          )}

          {paso === "datos" && (
            <div className="mt-5 grid gap-5">
              <Campo label="Nombre" htmlFor={id("nombre")} error={err("nombre")} errorId={id("e-nombre")}>
                <input
                  id={id("nombre")}
                  data-campo="nombre"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={v.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  aria-invalid={Boolean(err("nombre"))}
                  aria-describedby={err("nombre") ? id("e-nombre") : undefined}
                  className={inputCls(err("nombre"))}
                />
              </Campo>
              <div className="grid gap-5 sm:grid-cols-2">
                <Campo label="Teléfono" htmlFor={id("telefono")} error={err("telefono")} errorId={id("e-telefono")}>
                  <input
                    id={id("telefono")}
                    data-campo="telefono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="300 123 4567"
                    value={v.telefono}
                    onChange={(e) => set("telefono", e.target.value)}
                    aria-invalid={Boolean(err("telefono"))}
                    aria-describedby={err("telefono") ? id("e-telefono") : undefined}
                    className={inputCls(err("telefono"))}
                  />
                </Campo>
                <Campo label="Correo electrónico" htmlFor={id("correo")} error={err("correo")} errorId={id("e-correo")}>
                  <input
                    id={id("correo")}
                    data-campo="correo"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={150}
                    value={v.correo}
                    onChange={(e) => set("correo", e.target.value)}
                    aria-invalid={Boolean(err("correo"))}
                    aria-describedby={err("correo") ? id("e-correo") : undefined}
                    className={inputCls(err("correo"))}
                  />
                </Campo>
              </div>
              {v.publico === "empresa" && (
                <Campo label="Empresa (opcional)" htmlFor={id("empresa")} error={err("empresa")} errorId={id("e-empresa")}>
                  <input
                    id={id("empresa")}
                    data-campo="empresa"
                    type="text"
                    autoComplete="organization"
                    maxLength={120}
                    value={v.empresa}
                    onChange={(e) => set("empresa", e.target.value)}
                    className={inputCls()}
                  />
                </Campo>
              )}
              {comoNosConocio.length > 0 && (
                <Campo label="¿Dónde conociste a LEXPERTISE? (opcional)" htmlFor={id("origen")}>
                  <select id={id("origen")} value={v.comoNosConocio} onChange={(e) => set("comoNosConocio", e.target.value)} className={inputCls()}>
                    <option value="">Prefiero no decirlo</option>
                    {comoNosConocio.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Campo>
              )}

              <div className="grid gap-3 border-t border-line pt-5 text-sm">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    data-campo="consentimientoDatos"
                    checked={v.consentimientoDatos}
                    onChange={(e) => set("consentimientoDatos", e.target.checked)}
                    aria-invalid={Boolean(err("consentimientoDatos"))}
                    aria-describedby={err("consentimientoDatos") ? id("e-consent") : undefined}
                    className="mt-1 size-4 shrink-0 accent-navy"
                  />
                  <span>
                    {consent.tratamientoDatos}{" "}
                    <Link href="/tratamiento-de-datos" target="_blank" className="font-semibold text-navy underline decoration-bronze underline-offset-4">
                      Ver política
                    </Link>
                    <span className="text-danger"> (obligatorio)</span>
                  </span>
                </label>
                {err("consentimientoDatos") && <MensajeError id={id("e-consent")}>{err("consentimientoDatos")}</MensajeError>}
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={v.consentimientoComercial}
                    onChange={(e) => set("consentimientoComercial", e.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-navy"
                  />
                  <span>
                    {consent.comunicacionesComerciales} <span className="text-slate">(opcional)</span>
                  </span>
                </label>
              </div>
              <p className="flex gap-2 text-xs text-slate">
                <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                {consent.avisoFormulario}
              </p>
            </div>
          )}
        </fieldset>

        {estado === "error" && mensajeError && (
          <div id={id("error")} role="alert" className="mt-6 flex gap-3 border border-danger/30 bg-danger/[0.06] p-4 text-sm text-danger">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">{mensajeError}</p>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("click_whatsapp", { ubicacion: "error_formulario", contexto: tipo })}
                  className="mt-2 inline-flex items-center gap-1.5 font-semibold text-navy underline underline-offset-4"
                >
                  <MessageCircle aria-hidden className="size-4" /> También puedes escribirnos por WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {indice > 0 ? (
            <button type="button" onClick={() => irA(indice - 1)} className={cx(buttonClasses("secondary"), "sm:w-auto")}>
              <ArrowLeft aria-hidden className="size-4" /> Atrás
            </button>
          ) : (
            <span />
          )}
          <button type="submit" disabled={estado === "enviando"} aria-busy={estado === "enviando"} className={cx(buttonClasses("primary"), "disabled:cursor-wait disabled:opacity-70 sm:min-w-52")}>
            {estado === "enviando" ? (
              <>
                <LoaderCircle aria-hidden className="size-4 animate-spin" /> Enviando…
              </>
            ) : ultimo ? (
              tipo === "agendamiento" ? "Enviar solicitud de consulta" : "Enviar solicitud"
            ) : (
              <>
                Continuar <ArrowRight aria-hidden className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/** UUID v4 también en contextos sin HTTPS (donde crypto.randomUUID no existe). */
function uuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function inputCls(error?: string) {
  return cx(
    "mt-1.5 block h-12 w-full rounded-[3px] border bg-paper px-3.5 text-base text-graphite transition-colors placeholder:text-slate/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-1",
    error ? "border-danger" : "border-line hover:border-navy/40 focus:border-navy",
  );
}

function MensajeError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
      <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
      {children}
    </p>
  );
}

function Campo({ label, htmlFor, error, errorId, ayuda, children }: { label: string; htmlFor: string; error?: string; errorId?: string; ayuda?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {ayuda && <p className="text-xs text-slate">{ayuda}</p>}
      {children}
      {error && errorId && <MensajeError id={errorId}>{error}</MensajeError>}
    </div>
  );
}

function Opciones({
  nombre,
  legend,
  ayuda,
  opciones,
  valor,
  onChange,
  error,
  errorId,
  columnas = 1,
  compacto,
  denso,
}: {
  nombre: string;
  legend?: string;
  ayuda?: string;
  opciones: { valor: string; etiqueta: string; detalle?: string }[];
  valor: string;
  onChange: (v: string) => void;
  error?: string;
  errorId: string;
  columnas?: 1 | 2 | 3 | 4;
  compacto?: boolean;
  denso?: boolean;
}) {
  const grid = columnas === 4 ? "grid-cols-2" : columnas === 3 ? "grid-cols-3" : columnas === 2 ? "sm:grid-cols-2" : "";
  const contenido = (
    <>
      <div role="radiogroup" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={cx("grid gap-2.5", legend || ayuda ? "mt-2" : "mt-5", grid)}>
        {opciones.map((o, i) => {
          const sel = valor === o.valor;
          return (
            <label
              key={o.valor}
              className={cx(
                "relative flex cursor-pointer items-start gap-3 rounded-[3px] border transition-colors",
                compacto ? "min-h-12 items-center justify-center px-3 py-2 text-center text-sm" : denso ? "px-3.5 py-3 text-[0.95rem]" : "p-4",
                sel ? "border-navy bg-navy/[0.04] ring-1 ring-navy" : "border-line hover:border-navy/40",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-bronze",
              )}
            >
              <input
                type="radio"
                name={nombre}
                value={o.valor}
                checked={sel}
                data-campo={i === 0 ? nombre : undefined}
                onChange={() => onChange(o.valor)}
                className={cx(compacto ? "sr-only" : "mt-1 size-4 shrink-0 accent-navy")}
              />
              <span>
                <span className={cx("block font-semibold", sel ? "text-navy" : "text-graphite")}>{o.etiqueta}</span>
                {o.detalle && <span className="mt-0.5 block text-sm text-slate">{o.detalle}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <MensajeError id={errorId}>{error}</MensajeError>}
    </>
  );
  if (!legend) return contenido;
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-navy">{legend}</legend>
      {ayuda && <p className="text-xs text-slate">{ayuda}</p>}
      {contenido}
    </fieldset>
  );
}
