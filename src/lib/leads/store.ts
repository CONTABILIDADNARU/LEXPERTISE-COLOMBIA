import { appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { EstadoCrm, SolicitudRegistro } from "./schema";

/**
 * Almacenamiento persistente de solicitudes.
 * - "file": archivo JSONL en disco (desarrollo o servidor con disco persistente).
 * - "supabase": funciones de base de datos con acceso mínimo (ver supabase/migrations/001_solicitudes.sql).
 * Sin almacenamiento configurado, la API responde 503 y el formulario muestra un error: nunca un éxito falso.
 */
export type ResultadoGuardado = { estado: "creada" | "duplicada"; id: string };

export interface LeadStore {
  nombre: string;
  /** Guarda la solicitud. Si la clave de idempotencia ya existe, devuelve la referencia original. */
  guardar(registro: SolicitudRegistro): Promise<ResultadoGuardado>;
  actualizarCrm(id: string, estado: EstadoCrm): Promise<void>;
}

class FileLeadStore implements LeadStore {
  nombre = "file";
  private archivo: string;
  private eventos: string;
  private indice: Map<string, SolicitudRegistro> | null = null;

  constructor(private dir: string) {
    this.archivo = join(dir, "solicitudes.jsonl");
    this.eventos = join(dir, "eventos-crm.jsonl");
  }

  private async cargar() {
    if (this.indice) return this.indice;
    this.indice = new Map();
    try {
      const raw = await readFile(this.archivo, "utf8");
      for (const linea of raw.split("\n")) {
        if (!linea.trim()) continue;
        const r = JSON.parse(linea) as SolicitudRegistro;
        this.indice.set(r.idempotencyKey, r);
      }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
    return this.indice;
  }

  async guardar(r: SolicitudRegistro): Promise<ResultadoGuardado> {
    const indice = await this.cargar();
    const previo = indice.get(r.idempotencyKey);
    if (previo) return { estado: "duplicada", id: previo.id };
    // Se reserva la clave antes de escribir para que dos envíos simultáneos no se dupliquen.
    indice.set(r.idempotencyKey, r);
    try {
      await mkdir(this.dir, { recursive: true, mode: 0o700 });
      await appendFile(this.archivo, `${JSON.stringify(r)}\n`, { encoding: "utf8", mode: 0o600 });
    } catch (e) {
      indice.delete(r.idempotencyKey);
      throw e;
    }
    return { estado: "creada", id: r.id };
  }

  async actualizarCrm(id: string, estado: EstadoCrm) {
    await appendFile(this.eventos, `${JSON.stringify({ id, crm: estado, en: new Date().toISOString() })}\n`, { mode: 0o600 });
  }
}

/**
 * Supabase mediante funciones RPC protegidas por un secreto del servidor. La clave puede ser la
 * publicable (recomendado: acceso mínimo) o la service_role. La tabla vive en un esquema no expuesto.
 */
class SupabaseLeadStore implements LeadStore {
  nombre = "supabase";
  constructor(
    private url: string,
    private key: string,
    private secreto: string,
  ) {}

  private async rpc<T>(funcion: string, cuerpo: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.url}/rest/v1/rpc/${funcion}`, {
      method: "POST",
      headers: { apikey: this.key, "Content-Type": "application/json", ...(this.key.startsWith("eyJ") ? { Authorization: `Bearer ${this.key}` } : {}) },
      body: JSON.stringify({ p_secreto: this.secreto, ...cuerpo }),
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase ${funcion} respondió ${res.status}`);
    const texto = await res.text();
    return (texto ? JSON.parse(texto) : null) as T;
  }

  async guardar(r: SolicitudRegistro): Promise<ResultadoGuardado> {
    const filas = await this.rpc<{ ref: string; duplicada: boolean }[]>("lx_registrar_solicitud", { p_registro: r });
    const fila = filas?.[0];
    if (!fila?.ref) throw new Error("Supabase no devolvió la referencia");
    return { estado: fila.duplicada ? "duplicada" : "creada", id: fila.ref };
  }

  async actualizarCrm(id: string, estado: EstadoCrm) {
    await this.rpc("lx_actualizar_crm", { p_id: id, p_estado: estado });
  }
}

let instancia: LeadStore | null | undefined;

export function getLeadStore(): LeadStore | null {
  if (instancia !== undefined) return instancia;
  const tipo = process.env.LEAD_STORE ?? (process.env.NODE_ENV === "development" ? "file" : "");
  const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_RPC_SECRET } = process.env;
  if (tipo === "file") {
    instancia = new FileLeadStore(process.env.LEADS_DIR || join(process.cwd(), "data"));
  } else if (tipo === "supabase" && SUPABASE_URL && SUPABASE_KEY && SUPABASE_RPC_SECRET) {
    instancia = new SupabaseLeadStore(SUPABASE_URL.replace(/\/$/, ""), SUPABASE_KEY, SUPABASE_RPC_SECRET);
  } else {
    instancia = null;
  }
  return instancia;
}
