-- Encuesta de participación (17-nov-2026): disposición a pagar la consulta ($200.000 COP).
-- * Columna `pago`: «puede» o «conversar». Quien no puede pagar no llega a la base: la encuesta lo
--   remite a la fundación sin pedir datos personales.
-- * La función de registro guarda `pago`; la vista `resumen_embudo` agrupa también por pago.
-- Solo agrega una columna y reemplaza la función y la vista: no borra datos.

alter table lexpertise.solicitudes add column if not exists pago text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'solicitudes_pago_check') then
    alter table lexpertise.solicitudes add constraint solicitudes_pago_check check (pago is null or pago in ('puede', 'conversar'));
  end if;
end $$;

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
    etapa, urgencia, modalidad, pago, prioridad, ruta, registro
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
    p_registro->>'pago',
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

drop view if exists lexpertise.resumen_embudo;
create view lexpertise.resumen_embudo
with (security_invoker = true)
as
select
  (date_trunc('week', s.creado_en at time zone 'America/Bogota'))::date as semana,
  s.canal,
  coalesce(nullif(s.registro#>>'{atribucion,ultimo,utm_campaign}', ''), nullif(s.registro#>>'{atribucion,primero,utm_campaign}', ''), '(sin campaña)') as campana,
  coalesce(nullif(s.registro#>>'{atribucion,primero,landing}', ''), s.registro->>'paginaOrigen') as pagina_de_entrada,
  s.area,
  coalesce(s.pago, '(sin dato)') as pago,
  coalesce(s.prioridad, '(sin clasificar)') as prioridad,
  count(*) as solicitudes,
  count(*) filter (where s.prioridad = 'alta') as prioridad_alta,
  count(*) filter (where s.pago = 'puede') as pueden_pagar
from lexpertise.solicitudes s
group by 1, 2, 3, 4, 5, 6, 7;

revoke all on lexpertise.resumen_embudo from public, anon, authenticated;
comment on view lexpertise.resumen_embudo is 'Qué vende: solicitudes por semana, canal, campaña, página de entrada, área, pago y prioridad. Sin datos personales.';
