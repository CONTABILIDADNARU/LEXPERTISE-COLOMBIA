-- Filtro de solicitudes y reporte «qué vende» (14-nov-2026).
--
-- * Columnas consultables con el filtro del formulario: etapa, urgencia, modalidad, prioridad y ruta
--   (el registro completo sigue en `registro`).
-- * La función de registro las llena a partir del JSON que envía el sitio.
-- * Vista `lexpertise.resumen_embudo`: solicitudes por semana, canal, campaña, página, área y prioridad.
--   Vive en el esquema privado: se consulta desde el panel de Supabase (SQL) o desde el CRM, nunca con la clave pública.
-- Solo agrega columnas y reemplaza funciones: no borra datos.

alter table lexpertise.solicitudes
  add column if not exists etapa text,
  add column if not exists urgencia text,
  add column if not exists modalidad text,
  add column if not exists prioridad text,
  add column if not exists ruta text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'solicitudes_prioridad_check') then
    alter table lexpertise.solicitudes add constraint solicitudes_prioridad_check check (prioridad is null or prioridad in ('alta', 'media', 'baja'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'solicitudes_ruta_check') then
    alter table lexpertise.solicitudes add constraint solicitudes_ruta_check check (ruta is null or ruta in ('agendar', 'conversar', 'informar'));
  end if;
end $$;

create index if not exists solicitudes_prioridad_idx on lexpertise.solicitudes (prioridad, creado_en desc);

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

  insert into lexpertise.solicitudes (
    id, idempotency_key, creado_en, tipo, publico, area, estado, canal, crm_estado, consentimiento_version,
    etapa, urgencia, modalidad, prioridad, ruta, registro
  )
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
    p_registro->>'etapa',
    p_registro->>'urgencia',
    p_registro->>'modalidad',
    p_registro->>'prioridad',
    p_registro->>'ruta',
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

revoke all on function public.lx_registrar_solicitud(text, jsonb) from public, authenticated;
grant execute on function public.lx_registrar_solicitud(text, jsonb) to anon, service_role;

create or replace view lexpertise.resumen_embudo
with (security_invoker = true)
as
select
  (date_trunc('week', s.creado_en at time zone 'America/Bogota'))::date as semana,
  s.canal,
  coalesce(nullif(s.registro#>>'{atribucion,ultimo,utm_campaign}', ''), nullif(s.registro#>>'{atribucion,primero,utm_campaign}', ''), '(sin campaña)') as campana,
  coalesce(nullif(s.registro#>>'{atribucion,primero,landing}', ''), s.registro->>'paginaOrigen') as pagina_de_entrada,
  s.area,
  coalesce(s.prioridad, '(sin clasificar)') as prioridad,
  count(*) as solicitudes,
  count(*) filter (where s.prioridad = 'alta') as prioridad_alta
from lexpertise.solicitudes s
group by 1, 2, 3, 4, 5, 6;

revoke all on lexpertise.resumen_embudo from public, anon, authenticated;
comment on view lexpertise.resumen_embudo is 'Qué vende: solicitudes por semana, canal, campaña, página de entrada, área y prioridad. Sin datos personales.';
