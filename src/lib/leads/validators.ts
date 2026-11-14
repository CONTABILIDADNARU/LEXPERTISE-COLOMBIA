/**
 * Validaciones compartidas entre el navegador (mensajes inmediatos) y el servidor (validación definitiva).
 * Sin dependencias, para no cargar librerías en el cliente.
 */

export const LIMITES = {
  nombre: 100,
  ciudad: 60,
  correo: 150,
  empresa: 120,
};

export function normalizarTelefono(valor: string): string | null {
  const limpio = valor.replace(/[\s().-]/g, "");
  if (/^\+\d{8,15}$/.test(limpio)) {
    // +57 debe tener 10 dígitos nacionales.
    if (limpio.startsWith("+57") && limpio.length !== 13) return null;
    return limpio;
  }
  if (/^57\d{10}$/.test(limpio)) return `+${limpio}`;
  // Celulares (3xx) y fijos con indicativo (60x) en Colombia: 10 dígitos.
  if (/^(3\d{9}|60\d{8})$/.test(limpio)) return `+57${limpio}`;
  return null;
}

export function validarNombre(v: string): string | null {
  const t = v.trim();
  if (t.length < 3) return "Escribe tu nombre (mínimo 3 caracteres).";
  if (t.length > LIMITES.nombre) return `El nombre admite máximo ${LIMITES.nombre} caracteres.`;
  if (!/^[\p{L} .'-]+$/u.test(t)) return "El nombre solo puede contener letras, espacios, puntos, apóstrofos o guiones.";
  return null;
}

export function validarTelefono(v: string): string | null {
  if (!v.trim()) return "Escribe un número de teléfono.";
  return normalizarTelefono(v) ? null : "Escribe un celular colombiano de 10 dígitos (p. ej. 300 123 4567) o un número internacional con el prefijo +.";
}

export function validarCorreo(v: string): string | null {
  const t = v.trim();
  if (!t) return "Escribe un correo electrónico.";
  if (t.length > LIMITES.correo) return "El correo es demasiado largo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return "Revisa el formato del correo (ejemplo: nombre@dominio.com).";
  return null;
}

export function validarCiudad(v: string): string | null {
  const t = v.trim();
  if (t.length < 2) return "Indica la ciudad desde la que consultas.";
  if (t.length > LIMITES.ciudad) return "El nombre de la ciudad es demasiado largo.";
  if (!/^[\p{L} .,'-]+$/u.test(t)) return "La ciudad solo puede contener letras.";
  return null;
}

/** Fecha AAAA-MM-DD válida entre mañana y 90 días, en hora de Colombia. */
export function validarFechaPreferida(v: string, hoyBogota: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Fecha inválida.";
  if (v <= hoyBogota) return "Elige una fecha a partir de mañana.";
  const limite = sumarDias(hoyBogota, 90);
  if (v > limite) return "Elige una fecha dentro de los próximos 90 días.";
  return null;
}

export function hoyEnBogota(ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

export function sumarDias(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + dias));
  return f.toISOString().slice(0, 10);
}
