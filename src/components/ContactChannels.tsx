import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { IS_PRODUCTION } from "@/lib/env";
import { enlaceTelefono, enlaceWhatsApp, numeroWhatsApp, sitio, type WhatsAppContexto } from "@/lib/settings";
import { Pending } from "./Pending";
import { cx } from "./ui";

/** Lista de canales oficiales. Solo muestra datos confirmados; los faltantes quedan marcados en revisión. */
export function ContactChannels({ dark, contexto = "general" }: { dark?: boolean; contexto?: WhatsAppContexto }) {
  const e = sitio.empresa;
  const wa = enlaceWhatsApp(contexto);
  const tel = enlaceTelefono();
  const filas = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      valor: wa ? (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="underline decoration-bronze underline-offset-4">
          +{numeroWhatsApp()}
        </a>
      ) : null,
      pendiente: "Número oficial de WhatsApp",
    },
    {
      icon: Phone,
      label: "Teléfono",
      valor: tel ? (
        <a href={tel} className="underline decoration-bronze underline-offset-4">
          {e.telefono}
        </a>
      ) : null,
      pendiente: "Teléfono oficial",
    },
    {
      icon: Mail,
      label: "Correo",
      valor: e.correo ? (
        <a href={`mailto:${e.correo}`} className="underline decoration-bronze underline-offset-4">
          {e.correo}
        </a>
      ) : null,
      pendiente: "Correo oficial",
    },
    { icon: MapPin, label: "Dirección", valor: e.direccion ? `${e.direccion}${e.ciudad ? `, ${e.ciudad}` : ""}` : null, pendiente: "Dirección (si hay atención presencial)" },
    { icon: Clock, label: "Horario de atención", valor: e.horario || null, pendiente: "Horario de atención" },
  ];
  return (
    <ul className="grid gap-5">
      {filas.map(({ icon: Icon, label, valor, pendiente }) =>
        valor || !IS_PRODUCTION ? (
          <li key={label} className={cx("flex gap-4", !valor && "items-center")}>
            <Icon aria-hidden strokeWidth={1.5} className={cx("mt-0.5 size-5 shrink-0", dark ? "text-bronze" : "text-bronze-ink")} />
            <div>
              <p className={cx("text-xs font-bold uppercase tracking-[0.12em]", dark ? "text-ivory/60" : "text-slate")}>{label}</p>
              <p className={cx("mt-1", dark ? "text-ivory" : "text-navy")}>{valor ?? <Pending campo={pendiente} oscuro={dark} />}</p>
            </div>
          </li>
        ) : null,
      )}
    </ul>
  );
}
