import { SHOW_REVIEW_MARKS } from "@/lib/env";
import { cx } from "./ui";

/**
 * Marcador visible para datos que LEXPERTISE aún no ha confirmado.
 * Apagado por defecto: solo se muestra con NEXT_PUBLIC_REVIEW_MARKS=1 fuera de producción.
 */
export function Pending({ campo, className, oscuro }: { campo: string; className?: string; oscuro?: boolean }) {
  if (!SHOW_REVIEW_MARKS) return null;
  return (
    <mark
      data-pendiente={campo}
      className={cx(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 align-middle font-sans text-[0.7rem] font-bold uppercase tracking-wide",
        oscuro ? "bg-pending/90 text-ink-950" : "bg-pending text-ink-950 ring-1 ring-amber-300",
        className,
      )}
    >
      Pendiente · {campo}
    </mark>
  );
}
