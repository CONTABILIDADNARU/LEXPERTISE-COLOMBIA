import Image from "next/image";
import Link from "next/link";
import { cx } from "./ui";

/**
 * Logotipo de LEXPERTISE COLOMBIA S.A.S: el triángulo del logotipo oficial (imagen con fondo transparente,
 * `public/brand/logo-triangulo.png`) junto al nombre en texto, con las mayúsculas romanas finas y el gris del logotipo.
 * El nombre se escribe como texto, no como imagen, para que se vea nítido en cualquier pantalla y lo lean los lectores de pantalla.
 */
export function Logo({ dark, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="LEXPERTISE COLOMBIA S.A.S, ir al inicio" className={cx("group inline-flex items-center gap-3 leading-none", className)}>
      <Image
        src="/brand/logo-triangulo.png"
        alt=""
        width={480}
        height={390}
        priority
        className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
      />
      <span className={cx("flex flex-col font-serif uppercase", dark ? "text-ivory" : "text-steel")}>
        <span className="text-[1.3rem] tracking-[0.2em]">Lexpertise</span>
        <span aria-hidden className={cx("mt-1.5 text-[0.66rem] tracking-[0.34em]", dark ? "text-ivory/75" : "text-steel/90")}>
          Colombia S.A.S
        </span>
      </span>
    </Link>
  );
}
