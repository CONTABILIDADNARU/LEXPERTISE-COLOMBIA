import { Clock, Mail, Phone } from "lucide-react";
import { IS_PRODUCTION } from "@/lib/env";
import { enlaceTelefono, sitio, type WhatsAppContexto } from "@/lib/settings";
import { Pending } from "./Pending";
import { cx } from "./ui";

/** Lista de canales oficiales. Solo muestra datos confirmados; los faltantes quedan marcados en revisión. */
export function ContactChannels({ dark, contexto = "general" }: { dark?: boolean; contexto?: WhatsAppContexto }) {
  const e = sitio.empresa;
  // WhatsApp no se lista aquí: se ofrece después del formulario, con el resumen de la solicitud ya escrito.
  void contexto;
  const tel = enlaceTelefono();
  const filas = [
    {
      icon: Phone,
      label: "Teléfono",
      valor: tel ? (
        <a href={tel} className="underline decoration-brand underline-offset-4">
          {e.telefono}
        </a>
      ) : null,
      pendiente: "Teléfono oficial",
    },
    {
      icon: Mail,
      label: "Correo",
      valor: e.correo ? (
        <a href={`mailto:${e.correo}`} className="underline decoration-brand underline-offset-4">
          {e.correo}
        </a>
      ) : null,
      pendiente: "Correo oficial",
    },
    { icon: Clock, label: "Horario de atención", valor: e.horario || null, pendiente: "Horario de atención" },
  ];
  return (
    <ul className="grid gap-5">
      {filas.map(({ icon: Icon, label, valor, pendiente }) =>
        valor || !IS_PRODUCTION ? (
          <li key={label} className={cx("flex gap-4", !valor && "items-center")}>
            <Icon aria-hidden strokeWidth={1.5} className={cx("mt-0.5 size-5 shrink-0", dark ? "text-brand" : "text-brand-ink")} />
            <div>
              <p className={cx("text-xs font-bold uppercase tracking-[0.12em]", dark ? "text-ivory/60" : "text-slate")}>{label}</p>
              <p className={cx("mt-1", dark ? "text-ivory" : "text-ink")}>{valor ?? <Pending campo={pendiente} oscuro={dark} />}</p>
            </div>
          </li>
        ) : null,
      )}
    </ul>
  );
}
