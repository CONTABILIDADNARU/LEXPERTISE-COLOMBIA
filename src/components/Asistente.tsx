"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { CalendarCheck, MessageCircle, Phone, Send, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { responder, type AccionAsistente, type BaseAsistente } from "@/lib/asistente";
import type { EnlacesAsistente } from "@/lib/asistente-base";
import { AgendarConsultaLink } from "./ContactLinks";
import { InstagramIcon } from "./InstagramIcon";
import { TextoConEnlaces } from "./TextoConEnlaces";
import { cx } from "./ui";

type Mensaje = { id: number; de: "bot" | "yo"; texto: string; acciones?: AccionAsistente[] };

const ENLACE_CHAT = "font-semibold underline decoration-brand underline-offset-4 hover:decoration-2";
const PILDORA = "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-ink/50";

/**
 * Asistente de la página, abajo a la izquierda. Resuelve dudas básicas con la información ya publicada en el sitio
 * (ver src/lib/asistente.ts). No usa IA generativa, no guarda la conversación y no envía lo escrito a ningún servidor.
 */
export function Asistente({ base, enlaces }: { base: BaseAsistente; enlaces: EnlacesAsistente }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [
    {
      id: 1,
      de: "bot",
      texto: `¡Hola! Soy el asistente de ${base.marca}. Resuelvo dudas básicas con la información de este sitio. Elige un tema o escribe tu pregunta.`,
    },
  ]);
  const idPanel = useId();
  const contador = useRef(1);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const yaSeAbrio = useRef(false);

  const sugerencias = [
    "¿Qué servicios prestan?",
    "¿Cómo agendo una consulta?",
    "¿Cuánto cuesta y cuánto dura?",
    "Contacto y horario",
    ...(enlaces.instagram ? ["¿Tienen Instagram?"] : []),
  ];

  useEffect(() => {
    if (abierto) {
      yaSeAbrio.current = true;
      campo.current?.focus({ preventScroll: true });
    } else if (yaSeAbrio.current) {
      boton.current?.focus({ preventScroll: true });
    }
  }, [abierto]);

  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, abierto]);

  const abrir = () => {
    setAbierto(true);
    track("open_assistant", { ubicacion: "asistente" });
  };

  const enviar = (pregunta: string) => {
    const t = pregunta.trim();
    if (!t) return;
    const r = responder(t, base);
    setMensajes((m) => [
      ...m,
      { id: ++contador.current, de: "yo", texto: t },
      { id: ++contador.current, de: "bot", texto: r.texto, acciones: r.acciones },
    ]);
    setTexto("");
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    enviar(texto);
  };

  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === "Escape") setAbierto(false);
  };

  // Si la persona sigue un enlace de una respuesta, el panel se cierra para que vea la página.
  const alPulsar = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) setAbierto(false);
  };

  const accion = (a: AccionAsistente) => {
    switch (a) {
      case "agendar":
        return (
          <AgendarConsultaLink key={a} className={cx(PILDORA, "bg-brand-gradient border-transparent text-ink-950")} onIrAlFormulario={() => setAbierto(false)}>
            <CalendarCheck aria-hidden className="size-4" /> Agendar consulta
          </AgendarConsultaLink>
        );
      case "whatsapp":
        return enlaces.whatsapp ? (
          <a
            key={a}
            href={enlaces.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("click_whatsapp", { contexto: "asistente", ubicacion: "asistente" })}
            className={PILDORA}
          >
            <MessageCircle aria-hidden className="size-4" /> WhatsApp
          </a>
        ) : null;
      case "llamar":
        return enlaces.telefono ? (
          <a key={a} href={enlaces.telefono} onClick={() => track("click_call", { ubicacion: "asistente" })} className={PILDORA}>
            <Phone aria-hidden className="size-4" /> Llamar
          </a>
        ) : null;
      case "instagram":
        return enlaces.instagram ? (
          <a key={a} href={enlaces.instagram} target="_blank" rel="noopener noreferrer" className={PILDORA}>
            <InstagramIcon className="size-4" /> Instagram
          </a>
        ) : null;
      case "contacto":
        return (
          <Link key={a} href="/contacto" className={PILDORA}>
            Ver contacto
          </Link>
        );
    }
  };

  return (
    <div className="fixed bottom-[4.75rem] left-3 z-40 print:hidden lg:bottom-6 lg:left-6">
      {abierto ? (
        <section
          id={idPanel}
          role="dialog"
          aria-label={`Asistente de ${base.marca}`}
          onKeyDown={alTeclear}
          className="flex max-h-[min(34rem,calc(100dvh-7.5rem))] w-[calc(100vw-1.5rem)] max-w-[22rem] flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[0_18px_48px_rgba(47,49,51,0.28)] lg:max-h-[min(34rem,calc(100dvh-3rem))]"
        >
          <header className="bg-ink text-ivory">
            <div className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-sans text-[0.95rem] font-bold leading-tight">Asistente virtual</p>
                <p className="mt-0.5 text-xs text-ivory/75">Respuestas automáticas con la información de este sitio</p>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar el asistente"
                className="-mr-1 -mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ivory/85 transition-colors hover:bg-ivory/10 hover:text-ivory"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div aria-hidden className="h-0.5 bg-brand-gradient" />
          </header>

          <p className="bg-mist px-4 py-2 text-xs text-slate">No es asesoría jurídica. No escribas datos personales ni detalles de tu caso.</p>

          <div ref={lista} role="log" aria-live="polite" aria-label="Conversación" onClick={alPulsar} className="min-h-[9rem] flex-1 space-y-3 overflow-y-auto bg-ivory px-4 py-4 text-sm">
            {mensajes.map((m) => (
              <div key={m.id} className={cx("flex flex-col gap-2", m.de === "yo" ? "items-end" : "items-start")}>
                <p
                  className={cx(
                    "max-w-[88%] whitespace-pre-line rounded-[10px] px-3.5 py-2.5 leading-relaxed",
                    m.de === "yo" ? "bg-brand-gradient text-ink-950" : "border border-line bg-paper text-ink",
                  )}
                >
                  {m.de === "bot" ? <TextoConEnlaces texto={m.texto} className={ENLACE_CHAT} /> : m.texto}
                </p>
                {m.acciones && m.acciones.length > 0 && <div className="flex flex-wrap gap-2">{m.acciones.map(accion)}</div>}
              </div>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-line bg-paper px-3 py-2.5" aria-label="Preguntas sugeridas" role="group">
            {sugerencias.map((s) => (
              <button key={s} type="button" onClick={() => enviar(s)} className={cx(PILDORA, "shrink-0 whitespace-nowrap")}>
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={alEnviar} className="flex items-center gap-2 border-t border-line bg-paper p-3">
            <label htmlFor={`${idPanel}-campo`} className="sr-only">
              Escribe tu pregunta
            </label>
            <input
              id={`${idPanel}-campo`}
              ref={campo}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={200}
              autoComplete="off"
              placeholder="Escribe tu duda…"
              className="min-h-11 min-w-0 flex-1 rounded-[3px] border border-line bg-ivory px-3 text-sm text-ink placeholder:text-slate/70 focus:border-ink focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Enviar pregunta"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-[3px] bg-ink text-ivory transition-colors hover:bg-ink-800 disabled:opacity-50"
              disabled={!texto.trim()}
            >
              <Send aria-hidden className="size-4" />
            </button>
          </form>
        </section>
      ) : (
        <button
          ref={boton}
          type="button"
          onClick={abrir}
          aria-expanded={false}
          aria-controls={idPanel}
          aria-label="Abrir el asistente: resuelve dudas básicas"
          className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink py-3 pl-4 pr-4 text-[0.9375rem] font-semibold text-ivory shadow-[0_10px_28px_rgba(47,49,51,0.3)] ring-2 ring-brand/70 transition-colors hover:bg-ink-800 sm:pr-5"
        >
          <MessageCircle aria-hidden className="size-5 text-brand" />
          <span className="hidden sm:inline">¿Tienes dudas?</span>
        </button>
      )}
    </div>
  );
}
