-- Solicitudes del sitio web de LEXPERTISE.
--
-- Diseño de acceso mínimo:
-- * La tabla vive en el esquema privado `lexpertise`, que la API de Supabase no expone.
-- * El sitio solo puede escribir a través de dos funciones (`lx_registrar_solicitud` y `lx_actualizar_crm`),
--   que exigen un secreto del servidor (SUPABASE_RPC_SECRET). En la base se guarda solo su hash SHA-256.
-- * Con la clave pública (publishable/anon) nadie puede leer, listar ni borrar solicitudes.
-- * La lectura se hace desde el panel de Supabase o desde el CRM.
--
-- Después de aplicar esta migración, registrar el hash del secreto (no versionar el secreto):
--   insert into lexpertise.config (clave, valor)
--   values ('rpc_secret_sha256', encode(sha256(convert_to('<SECRETO>', 'UTF8')), 'hex'))
--   on conflict (clave) do update set valor = excluded.valor;

create schema if not exists lexpertise;
revoke all on schema lexpertise from public;
revoke all on schema lexpertise from anon, authenticated;

create table if not exists lexpertise.solicitudes (
  id text primary key check (id ~ '^LX-[0-9]{8}-[A-Z0-9]{6}$'),
  idempotency_key uuid not null unique,
  creado_en timestamptz not null default now(),
  tipo text not null check (tipo in ('contacto', 'agendamiento')),
  publico text not null check (publico in ('persona', 'empresa')),
  area text not null,
  estado text not null default 'solicitud_recibida',
  canal text not null default 'directo',
  crm_estado text not null default 'pendiente' check (crm_estado in ('pendiente', 'enviado', 'no_configurado', 'error')),
  consentimiento_version text not null,
  responsable text,
  registro jsonb not null
);
create index if not exists solicitudes_creado_en_idx on lexpertise.solicitudes (creado_en desc);
create index if not exists solicitudes_crm_pendiente_idx on lexpertise.solicitudes (crm_estado) where crm_estado <> 'enviado';
alter table lexpertise.solicitudes enable row level security;
comment on table lexpertise.solicitudes is 'Solicitudes del sitio web de LEXPERTISE. Datos personales (Ley 1581 de 2012): acceso restringido.';

create table if not exists lexpertise.config (
  clave text primary key,
  valor text not null
);
alter table lexpertise.config enable row level security;

create or replace function lexpertise.autorizado(p_secreto text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(p_secreto, '') <> ''
     and encode(pg_catalog.sha256(pg_catalog.convert_to(p_secreto, 'UTF8')), 'hex')
         = (select c.valor from lexpertise.config c where c.clave = 'rpc_secret_sha256');
$$;
revoke all on function lexpertise.autorizado(text) from public, anon, authenticated;

create or replace function public.lx_registrar_solicitud(p_secreto text, p_registro jsonb)
returns table (ref text, duplicada boolean)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_id text := p_registro->>'id';
  v_clave uuid;
begin
  if not lexpertise.autorizado(p_secreto) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if p_registro is null or jsonb_typeof(p_registro) <> 'object' or octet_length(p_registro::text) > 20000 then
    raise exception 'registro inválido' using errcode = '22023';
  end if;
  v_clave := (p_registro->>'idempotencyKey')::uuid;

  insert into lexpertise.solicitudes (id, idempotency_key, creado_en, tipo, publico, area, estado, canal, crm_estado, consentimiento_version, registro)
  values (
    v_id,
    v_clave,
    coalesce((p_registro->>'creadoEn')::timestamptz, now()),
    p_registro->>'tipo',
    p_registro->>'publico',
    p_registro->>'area',
    coalesce(p_registro->>'estado', 'solicitud_recibida'),
    coalesce(p_registro->>'canal', 'directo'),
    coalesce(p_registro#>>'{crm,estado}', 'pendiente'),
    p_registro#>>'{consentimiento,version}',
    p_registro
  )
  on conflict (idempotency_key) do nothing;

  if found then
    return query select v_id, false;
  else
    return query select s.id, true from lexpertise.solicitudes s where s.idempotency_key = v_clave;
  end if;
end;
$$;

create or replace function public.lx_actualizar_crm(p_secreto text, p_id text, p_estado text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not lexpertise.autorizado(p_secreto) then
    raise exception 'no autorizado' using errcode = '42501';
  end if;
  if p_estado not in ('pendiente', 'enviado', 'no_configurado', 'error') then
    raise exception 'estado inválido' using errcode = '22023';
  end if;
  update lexpertise.solicitudes set crm_estado = p_estado where id = p_id;
end;
$$;

revoke all on function public.lx_registrar_solicitud(text, jsonb) from public, authenticated;
revoke all on function public.lx_actualizar_crm(text, text, text) from public, authenticated;
grant execute on function public.lx_registrar_solicitud(text, jsonb) to anon, service_role;
grant execute on function public.lx_actualizar_crm(text, text, text) to anon, service_role;

-- Conservación sugerida (ajustar a la decisión de la firma):
-- delete from lexpertise.solicitudes where creado_en < now() - interval '24 months' and estado in ('no_contratado', 'cerrado');
