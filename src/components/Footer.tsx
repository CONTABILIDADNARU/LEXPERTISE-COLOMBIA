import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { getServicio, servicioVisible } from "@/lib/content";
import { IS_PRODUCTION } from "@/lib/env";
import { sitio } from "@/lib/settings";
import { getNavItems } from "./Header";
import { Logo } from "./Logo";
import { Pending } from "./Pending";
import { CookiePreferencesButton } from "./CookiePreferences";
import { Container } from "./ui";

const LEGALES = [
  { href: "/politica-de-privacidad", label: "Aviso de privacidad" },
  { href: "/tratamiento-de-datos", label: "Tratamiento de datos personales" },
  { href: "/politica-de-cookies", label: "Política de cookies" },
  { href: "/terminos-de-uso", label: "Términos de uso" },
];

export function Footer() {
  const nav = getNavItems();
  const e = sitio.empresa;
  const areas = AREAS.filter((a) => {
    const s = getServicio(a.slug);
    return s && servicioVisible(s);
  });
  const redes = Object.entries(sitio.redes).filter(([, url]) => url);
  const titulo = "text-xs font-bold uppercase tracking-[0.16em] text-bronze";
  const enlace = "text-ivory/75 transition-colors hover:text-ivory";

  return (
    <footer className="bg-navy-950 pb-24 pt-16 text-ivory lg:pb-10">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-xs text-sm text-ivory/70">{sitio.descripcion}</p>
            <div className="mt-6 space-y-1.5 text-sm text-ivory/80">
              <p>{e.razonSocial || <Pending campo="Razón social" oscuro />}</p>
              <p>{e.nit ? `NIT ${e.nit}` : <Pending campo="NIT" oscuro />}</p>
              {e.correo && (
                <p>
                  <a className={enlace} href={`mailto:${e.correo}`}>
                    {e.correo}
                  </a>
                </p>
              )}
              {e.telefono && <p>{e.telefono}</p>}
              {e.direccion && <p>{`${e.direccion}${e.ciudad ? `, ${e.ciudad}` : ""}`}</p>}
            </div>
            {redes.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {redes.map(([red, url]) => (
                  <li key={red}>
                    <a className={`${enlace} capitalize`} href={url} target="_blank" rel="noopener noreferrer">
                      {red}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Mapa del sitio">
            <p className={titulo}>Navegación</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {nav.map((it) => (
                <li key={it.href}>
                  <Link className={enlace} href={it.href}>
                    {it.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className={enlace} href="/nosotros">
                  La firma
                </Link>
              </li>
              <li>
                <Link className={enlace} href="/agendar-consulta">
                  Solicitar una consulta
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Áreas de práctica">
            <p className={titulo}>Áreas de práctica</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {areas.map((a) => (
                <li key={a.key}>
                  <Link className={enlace} href={`/${a.slug}`}>
                    {a.corto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Información legal">
            <p className={titulo}>Legal</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {LEGALES.map((l) => (
                <li key={l.href}>
                  <Link className={enlace} href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton className={`${enlace} text-left underline-offset-4 hover:underline`} />
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 border-t border-ivory/10 pt-8 text-xs leading-relaxed text-ivory/60">
          <p className="max-w-4xl">
            La información publicada en este sitio es de carácter general y no constituye asesoría jurídica ni crea una relación
            abogado-cliente. Cada asunto requiere el análisis de sus hechos, documentos y normas aplicables. {sitio.marca} no presta
            servicios de derecho penal.
          </p>
          <p className="mt-4">
            © {new Date().getFullYear()} {sitio.marca}.{!IS_PRODUCTION && " Identidad visual provisional, pendiente del manual de marca."}
          </p>
        </div>
      </Container>
    </footer>
  );
}
