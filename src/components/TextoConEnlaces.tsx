import Link from "next/link";

const CLASE_ENLACE = "font-semibold text-ink underline decoration-brand underline-offset-4 hover:decoration-2";

/**
 * Texto con enlaces escritos como [texto](/ruta) o [texto](mailto:correo).
 * Solo admite rutas del propio sitio y correos: cualquier otra cosa se muestra como texto.
 */
export function TextoConEnlaces({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split(/(\[[^\]]+\]\((?:\/[^\s)]*|mailto:[^\s)]+)\))/g);
  const clase = className ?? CLASE_ENLACE;
  return (
    <>
      {partes.map((parte, i) => {
        const m = /^\[([^\]]+)\]\((\/[^\s)]*|mailto:[^\s)]+)\)$/.exec(parte);
        if (!m) return parte;
        return m[2].startsWith("/") ? (
          <Link key={i} href={m[2]} className={clase}>
            {m[1]}
          </Link>
        ) : (
          <a key={i} href={m[2]} className={clase}>
            {m[1]}
          </a>
        );
      })}
    </>
  );
}
