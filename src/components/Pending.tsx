import { IS_PRODUCTION } from "@/lib/env";
import { cx } from "./ui";

/**
 * Marcador visible para datos que LEXPERTISE aún no ha confirmado.
 * Solo aparece en el entorno de revisión; en producción no se renderiza nada.
 */
export function Pending({ campo, className, oscuro }: { campo: string; className?: string; oscuro?: boolean }) {
  if (IS_PRODUCTION) return null;
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
