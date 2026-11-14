import {
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardList,
  FilePen,
  FileText,
  ScrollText,
  Tag,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/** Iconografía lineal por área o servicio (sin balanzas, martillos ni columnas). */
const POR_SLUG: Record<string, LucideIcon> = {
  "derecho-de-familia": Users,
  divorcios: UsersRound,
  "divorcio-mutuo-acuerdo": UsersRound,
  "divorcio-unilateral": UsersRound,
  "divorcio-con-hijos-y-bienes": UsersRound,
  sucesiones: ScrollText,
  "derecho-laboral": BriefcaseBusiness,
  "derecho-civil-y-contratos": FilePen,
  "derecho-comercial": Building2,
  "derecho-tributario": Calculator,
  "derecho-administrativo": ClipboardList,
  "propiedad-intelectual-y-marcas": Tag,
};

const POR_AREA: Record<string, LucideIcon> = {
  familia: Users,
  laboral: BriefcaseBusiness,
  civil: FilePen,
  comercial: Building2,
  tributario: Calculator,
  administrativo: ClipboardList,
  "propiedad-intelectual": Tag,
};

export function AreaIcon({ slug, area, className }: { slug?: string; area?: string; className?: string }) {
  const Icon = (slug && POR_SLUG[slug]) || (area && POR_AREA[area]) || FileText;
  return <Icon aria-hidden strokeWidth={1.4} className={className} />;
}
