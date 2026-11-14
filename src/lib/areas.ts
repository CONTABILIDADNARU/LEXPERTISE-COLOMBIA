/**
 * Catálogo de áreas de práctica y subcategorías del formulario.
 * Es seguro para el navegador (sin acceso a archivos). La disponibilidad comercial de cada área
 * se controla desde content/servicios/*.md (campo `estado`).
 */

export const AREA_KEYS = [
  "familia",
  "laboral",
  "civil",
  "comercial",
  "tributario",
  "administrativo",
  "propiedad-intelectual",
] as const;
export type AreaKey = (typeof AREA_KEYS)[number];
export type Publico = "persona" | "empresa";

type Subcategoria = { valor: string; etiqueta: string };

export type AreaDef = {
  key: AreaKey;
  nombre: string;
  corto: string;
  /** Página principal del área. */
  slug: string;
  publicos: Publico[];
  subcategorias: Record<Publico, Subcategoria[]>;
};

const OTRO = (texto: string): Subcategoria => ({ valor: "otro", etiqueta: texto });

export const AREAS: AreaDef[] = [
  {
    key: "familia",
    nombre: "Derecho de familia y sucesiones",
    corto: "Familia y sucesiones",
    slug: "derecho-de-familia",
    publicos: ["persona"],
    subcategorias: {
      persona: [
        { valor: "divorcio-mutuo-acuerdo", etiqueta: "Divorcio de mutuo acuerdo" },
        { valor: "divorcio-unilateral", etiqueta: "Divorcio unilateral" },
        { valor: "divorcio-hijos-bienes", etiqueta: "Divorcio con hijos o bienes" },
        { valor: "alimentos-custodia-visitas", etiqueta: "Alimentos, custodia o visitas" },
        { valor: "sucesiones", etiqueta: "Sucesión o herencia" },
        OTRO("Otro asunto de familia"),
      ],
      empresa: [],
    },
  },
  {
    key: "laboral",
    nombre: "Derecho laboral y seguridad social",
    corto: "Laboral y seguridad social",
    slug: "derecho-laboral",
    publicos: ["persona", "empresa"],
    subcategorias: {
      persona: [
        { valor: "terminacion", etiqueta: "Terminación del contrato o despido" },
        { valor: "liquidacion", etiqueta: "Liquidación o pagos laborales" },
        { valor: "seguridad-social", etiqueta: "Seguridad social" },
        OTRO("Otro asunto laboral"),
      ],
      empresa: [
        { valor: "contratacion", etiqueta: "Contratación y documentos laborales" },
        { valor: "terminaciones", etiqueta: "Terminación de contratos de trabajo" },
        { valor: "prevencion", etiqueta: "Asesoría laboral preventiva" },
        OTRO("Otro asunto laboral"),
      ],
    },
  },
  {
    key: "civil",
    nombre: "Derecho civil y contratos",
    corto: "Civil y contratos",
    slug: "derecho-civil-y-contratos",
    publicos: ["persona", "empresa"],
    subcategorias: {
      persona: [
        { valor: "revision-contrato", etiqueta: "Revisión de un contrato" },
        { valor: "elaboracion-contrato", etiqueta: "Elaboración de un contrato" },
        { valor: "incumplimiento", etiqueta: "Incumplimiento de un acuerdo" },
        { valor: "analisis-documentos", etiqueta: "Análisis de documentos" },
        OTRO("Otro asunto civil"),
      ],
      empresa: [
        { valor: "revision-contrato", etiqueta: "Revisión de un contrato" },
        { valor: "elaboracion-contrato", etiqueta: "Elaboración de un contrato" },
        { valor: "incumplimiento", etiqueta: "Incumplimiento contractual" },
        OTRO("Otro asunto civil"),
      ],
    },
  },
  {
    key: "comercial",
    nombre: "Derecho comercial y empresarial",
    corto: "Comercial y empresarial",
    slug: "derecho-comercial",
    publicos: ["empresa"],
    subcategorias: {
      persona: [],
      empresa: [
        { valor: "contratos-comerciales", etiqueta: "Contratos comerciales" },
        { valor: "proveedores-clientes", etiqueta: "Relaciones con proveedores o clientes" },
        { valor: "revision-documentos", etiqueta: "Revisión jurídica de documentos" },
        OTRO("Otro asunto empresarial"),
      ],
    },
  },
  {
    key: "tributario",
    nombre: "Derecho tributario",
    corto: "Tributario",
    slug: "derecho-tributario",
    publicos: ["persona", "empresa"],
    subcategorias: {
      persona: [
        { valor: "orientacion", etiqueta: "Orientación tributaria general" },
        { valor: "requerimiento", etiqueta: "Requerimiento o actuación de la autoridad tributaria" },
        OTRO("Otro asunto tributario"),
      ],
      empresa: [
        { valor: "orientacion", etiqueta: "Orientación tributaria general" },
        { valor: "requerimiento", etiqueta: "Requerimiento o actuación de la autoridad tributaria" },
        OTRO("Otro asunto tributario"),
      ],
    },
  },
  {
    key: "administrativo",
    nombre: "Derecho administrativo",
    corto: "Administrativo",
    slug: "derecho-administrativo",
    publicos: ["persona", "empresa"],
    subcategorias: {
      persona: [
        { valor: "peticion", etiqueta: "Derecho de petición" },
        { valor: "actuacion-entidad", etiqueta: "Actuación ante una entidad pública" },
        { valor: "recursos", etiqueta: "Recursos administrativos" },
        OTRO("Otro asunto administrativo"),
      ],
      empresa: [
        { valor: "peticion", etiqueta: "Derecho de petición" },
        { valor: "actuacion-entidad", etiqueta: "Actuación ante una entidad pública" },
        { valor: "recursos", etiqueta: "Recursos administrativos" },
        OTRO("Otro asunto administrativo"),
      ],
    },
  },
  {
    key: "propiedad-intelectual",
    nombre: "Propiedad intelectual y registro de marcas",
    corto: "Propiedad intelectual y marcas",
    slug: "propiedad-intelectual-y-marcas",
    publicos: ["persona", "empresa"],
    subcategorias: {
      persona: [{ valor: "registro-marca", etiqueta: "Registro de marca" }, OTRO("Otro asunto de propiedad intelectual")],
      empresa: [{ valor: "registro-marca", etiqueta: "Registro de marca" }, OTRO("Otro asunto de propiedad intelectual")],
    },
  },
];

export const AREA_OTRO = { key: "otro", nombre: "Otro asunto / no estoy seguro" } as const;

export function getArea(key: string): AreaDef | undefined {
  return AREAS.find((a) => a.key === key);
}

export function subcategoriasValidas(area: string, publico: Publico): string[] {
  return getArea(area)?.subcategorias[publico].map((s) => s.valor) ?? [];
}

export const CIUDADES_SUGERIDAS = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Villavicencio",
  "Ibagué",
  "Santa Marta",
  "Cúcuta",
  "Pasto",
  "Neiva",
  "Tunja",
  "Chía",
  "Soacha",
];
