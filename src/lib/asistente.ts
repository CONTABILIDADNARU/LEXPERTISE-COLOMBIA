/**
 * Lógica del asistente de la página.
 *
 * Responde SOLO con información que ya está publicada en el sitio: preguntas frecuentes, páginas de servicio y datos
 * de contacto. No usa inteligencia artificial generativa, no guarda la conversación y no envía lo que escribe la
 * persona a ningún servidor: todo se calcula en el navegador. No da asesoría jurídica ni opina sobre casos concretos.
 */

export type AccionAsistente = "agendar" | "whatsapp" | "llamar" | "instagram" | "contacto";

export type BaseAsistente = {
  marca: string;
  /** Preguntas frecuentes publicadas en la portada. */
  faqs: { pregunta: string; respuesta: string }[];
  /** Páginas de servicio visibles. `esArea` marca las páginas principales de cada área. */
  servicios: { titulo: string; slug: string; esArea: boolean }[];
  contacto: { telefono: string; correo: string; horario: string; instagramUsuario: string };
};

export type Respuesta = { texto: string; acciones: AccionAsistente[] };

/** Minúsculas, sin tildes ni signos: «¿Cómo agendo?» → «como agendo». */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PARADAS = new Set([
  "derecho", "derechos", "sobre", "para", "como", "quiero", "necesito", "tengo", "tienen", "hacen", "informacion", "consulta",
  "asunto", "asuntos", "caso", "ayuda", "puedo", "pueden", "favor", "abogado", "abogados", "servicio", "servicios", "legal",
  "juridico", "juridica", "quisiera", "saber", "ustedes", "esto", "esta", "este", "tema", "temas",
]);

/** Palabras de la persona que remiten a una página de servicio; se agregan al texto antes de buscar. */
const SINONIMOS: [RegExp, string][] = [
  [/despid|liquidac|cesantia|prima|salario|trabaj|empleador|contrato laboral|pension|seguridad social/, "laboral"],
  [/herenc|testament|fallec|murio|sucesi|heredero/, "sucesiones"],
  [/marca|patente|propiedad intelectual|derechos de autor|registro de marca/, "propiedad intelectual marcas"],
  [/impuesto|dian|renta|tributar|iva\b|declaracion/, "tributario"],
  [/contrato|arrend|deuda|incumpl|civil|compraventa/, "civil contratos"],
  [/sociedad|empresa|comercial|negocio|emprend/, "comercial"],
  [/custodia|alimentos|hijos|union marital|familia|separacion|matrimonio/, "familia"],
  [/entidad|licitac|administrativ|contratacion publica|resolucion|sancion/, "administrativo"],
  [/divorci/, "divorcio"],
];

const palabras = (t: string) => t.split(" ").filter(Boolean);
const raices = (t: string) =>
  palabras(t)
    .filter((w) => w.length >= 4 && !PARADAS.has(w))
    .map((w) => w.slice(0, 5));

function listaConY(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/** Preguntas frecuentes que el asistente reconoce: expresión de la pregunta de la persona → pregunta publicada. */
const INTENCIONES_FAQ: { re: RegExp; faq: RegExp; acciones: AccionAsistente[] }[] = [
  {
    // Cancelar o cambiar una cita
    re: /\b(cancel\w*|reprogram\w*|aplaz\w*|cambiar (la )?(fecha|cita|hora)|mover (la )?cita|reembols\w*|devoluc\w*|inasistencia|tolerancia|llegar tarde|no puedo asistir)\b/,
    faq: /cancelar|reprogramar/,
    acciones: ["contacto"],
  },
  {
    // Qué pasa después de enviar la solicitud
    re: /\b(despues de (enviar|solicitar|agendar|llenar)|luego de|que (pasa|ocurre|sigue)|cuanto (tardan|demoran|se demoran)|responden|contestan|respuesta)\b/,
    faq: /despues de enviar/,
    acciones: ["whatsapp"],
  },
  {
    // Qué preparar
    re: /\b(prepar\w*|document\w*|papeles|llevar|requisit\w*|que (necesito|debo (llevar|tener|enviar|presentar))|informacion (debo|necesito))\b/,
    faq: /informacion debo preparar|preparar/,
    acciones: ["agendar"],
  },
  {
    // Costo y duración
    re: /\b(cuesta|costo|costos|precio|precios|valor|tarifa\w*|cobr\w*|honorario\w*|pago|pagar|gratis|gratuit\w*|duracion|dura|minutos|cuanto (vale|cuesta|cobran|es|dura|tiempo))\b/,
    faq: /cuanto cuesta|costo|duracion|dura/,
    acciones: ["agendar", "whatsapp"],
  },
  {
    // Modalidades y canales
    re: /\b(modalidad\w*|virtual\w*|presencial\w*|videollamada|a distancia|remot\w*|en linea|online|canal(es)? de atencion)\b/,
    faq: /modalidades/,
    acciones: ["whatsapp"],
  },
  {
    // Confidencialidad y datos
    re: /\b(confidencial\w*|privacidad|seguro|proteccion|datos|habeas|politica|tratamiento|secreto|reservad\w*)\b/,
    faq: /confidencial/,
    acciones: [],
  },
  {
    // Cómo agendar
    re: /\b(agend\w*|cita|citas|reserv\w*|program\w*|solicit\w*|pedir (una )?(cita|consulta)|turno|como (empiezo|inicio|comienzo)|primer paso)\b/,
    faq: /agendo/,
    acciones: ["agendar"],
  },
];

export function responder(pregunta: string, base: BaseAsistente): Respuesta {
  const t = normalizar(pregunta);
  const n = palabras(t).length;
  const c = base.contacto;

  if (/^(hola|holi|buenas|buenos dias|buen dia|buenas tardes|buenas noches|saludos|hey|que tal)\b/.test(t) && n <= 4) {
    return {
      texto: `¡Hola! Soy el asistente de ${base.marca}. Resuelvo dudas básicas con la información de este sitio. Elige un tema o escribe tu pregunta.`,
      acciones: [],
    };
  }

  if (/\b(gracias|muy amable|perfecto|chao|adios|hasta luego)\b/.test(t) && n <= 6) {
    return { texto: "Con gusto. Si tienes otra duda, aquí estoy. Cuando quieras, puedes solicitar tu consulta.", acciones: ["agendar"] };
  }

  if (/\b(hablar con (una |un )?(persona|abogad\w*|asesor\w*)|persona real|humano|asesor|que me (llamen|contacten|escriban)|comunicarme con)\b/.test(t)) {
    return {
      texto: `Para hablar con una persona del equipo, solicita tu consulta o escribe por WhatsApp.${c.horario ? ` Horario de atención: ${c.horario.replace(/\.$/, "")}.` : ""} Un integrante del equipo revisa tu solicitud y te responde.`,
      acciones: ["agendar", "whatsapp"],
    };
  }

  if (/\b(instagram|insta|redes|sociales)\b/.test(t)) {
    return c.instagramUsuario
      ? {
          texto: `Nuestro Instagram es @${c.instagramUsuario}. Puedes seguirnos desde el botón de abajo. Los asuntos concretos no se resuelven por redes sociales: se revisan en un espacio privado, en la consulta.`,
          acciones: ["instagram", "agendar"],
        }
      : { texto: "Por ahora te atendemos por los canales de contacto de este sitio.", acciones: ["contacto"] };
  }

  if (/\b(whats ?app|wasap|guasap)\b/.test(t)) {
    return {
      texto: "Puedes escribirnos por WhatsApp desde el botón de abajo. En el primer mensaje no envíes documentos ni detalles íntimos: eso se revisa en la consulta.",
      acciones: ["whatsapp"],
    };
  }

  if (/\b(contacto|contactar\w*|telefono|llamar\w*|numero|celular|correo|email|e mail|mail|horario|horas? de atencion|a que hora|hasta que hora|que dias|dias de atencion|abren|cierran|atienden hasta)\b/.test(t)) {
    const lineas = [
      "Estos son nuestros canales de atención:",
      "• WhatsApp (botón de abajo)",
      c.telefono && `• Teléfono: ${c.telefono}`,
      c.correo && `• Correo: [${c.correo}](mailto:${c.correo})`,
      c.horario && `• Horario: ${c.horario.replace(/\.$/, "")}`,
      c.instagramUsuario && `• Instagram: @${c.instagramUsuario}`,
    ].filter(Boolean);
    return { texto: lineas.join("\n"), acciones: ["whatsapp", "llamar", "instagram"] };
  }

  if (/\b(donde (estan|quedan|queda|atienden)|ubicacion|direccion|oficina|sede|ciudad|cobertura)\b/.test(t)) {
    return {
      texto: "Prestamos servicios jurídicos a personas y empresas en Colombia. Los canales de atención están en [Contacto](/contacto) y la modalidad de la consulta se confirma al programarla.",
      acciones: ["agendar"],
    };
  }

  for (const i of INTENCIONES_FAQ) {
    if (!i.re.test(t)) continue;
    const faq = base.faqs.find((f) => i.faq.test(normalizar(f.pregunta)));
    if (faq) return { texto: faq.respuesta, acciones: i.acciones };
  }

  const areas = base.servicios.filter((s) => s.esArea);
  if (/\b(servicios|areas|materias|especialidad\w*|que (hacen|atienden|manejan|tramitan|ofrecen)|asuntos|temas|practica)\b/.test(t) && areas.length) {
    return {
      texto: `Acompañamos asuntos de:\n${areas.map((s) => `• [${s.titulo}](/${s.slug})`).join("\n")}\nCada página tiene información general. Para tu caso concreto, solicita una consulta.`,
      acciones: ["agendar"],
    };
  }

  // Tema concreto (divorcio, herencia, despido, marcas…): se remite a la página de información general.
  const extra = SINONIMOS.filter(([re]) => re.test(t)).map(([, w]) => w).join(" ");
  const consulta = new Set(raices(`${t} ${extra}`));
  const coinciden = base.servicios
    .map((s) => ({ s, puntos: raices(normalizar(s.titulo)).filter((r) => consulta.has(r)).length }))
    .filter((x) => x.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || Number(b.s.esArea) - Number(a.s.esArea))
    .slice(0, 4);
  if (coinciden.length) {
    return {
      texto: `Encuentras información general sobre eso en:\n${coinciden.map(({ s }) => `• [${s.titulo}](/${s.slug})`).join("\n")}\nCada caso depende de los hechos y los documentos. Para analizar el tuyo, solicita una consulta.`,
      acciones: ["agendar"],
    };
  }

  const temas = ["servicios", "cómo agendar", "costo y duración", "cancelación", "contacto y horario"];
  return {
    texto: `No tengo una respuesta para eso. Puedo ayudarte con ${listaConY(temas)}. Si tu duda es sobre un caso concreto, el equipo la revisa en la consulta: no escribas datos personales aquí.`,
    acciones: ["agendar", "whatsapp"],
  };
}
