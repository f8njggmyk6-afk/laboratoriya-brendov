-- Overall progress is manual; per-service completion is independent.
-- Deletion hides the order and invalidates public tracking, retaining its audit history.
begin;
alter table public.lb_orders add column progress_percent integer not null default 0 check(progress_percent between 0 and 100);
alter table public.lb_orders add column service_progress jsonb not null default '{}' check(jsonb_typeof(service_progress)='object');
alter table public.lb_orders add column deleted_at timestamptz;
create or replace function public.lb_admin_update_order(p_id uuid,p_version integer,p_patch jsonb,p_actor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare before_row public.lb_orders; after_row public.lb_orders; changes jsonb; editable jsonb;
begin
  select * into before_row from public.lb_orders where id=p_id for update;
  if before_row.deleted_at is not null then raise exception 'order_not_found';end if;
  if not found then raise exception 'order_not_found'; end if;
  if before_row.version<>p_version then raise exception 'version_conflict';end if;
  if p_patch = '{"deleted":true}'::jsonb then
    update public.lb_orders set deleted_at=now(),updated_at=now(),version=version+1 where id=p_id returning * into after_row;
    insert into public.lb_order_history(order_id,actor_email,changes) values(p_id,p_actor,jsonb_build_object('deleted_at',jsonb_build_object('before',null,'after',after_row.deleted_at)));
    return to_jsonb(after_row);
  end if;
  if p_patch ? 'service_progress' then
    if jsonb_typeof(p_patch->'service_progress')<>'object' then raise exception 'invalid_service_progress';end if;
    if exists(select 1 from jsonb_each_text(p_patch->'service_progress') e where e.value not in ('pending','in_progress','completed') or not exists(select 1 from jsonb_array_elements(before_row.services) s where s->>'code'=e.key)) then raise exception 'invalid_service_progress';end if;
  end if;
  if p_patch-'progress_percent'-'service_progress'-'customer_name'-'customer_email'-'agreed_amount'-'due_date'-'agreed_scope'-'status'-'notes'-'terms_confirmed'-'paid'-'delivered'-'public_notice'-'public_notice_until'<>'{}'::jsonb then raise exception 'invalid_patch';end if;
  update public.lb_orders set
    progress_percent=coalesce((p_patch->>'progress_percent')::integer,before_row.progress_percent),service_progress=coalesce(p_patch->'service_progress',before_row.service_progress),
    customer_name=p_patch->>'customer_name',customer_email=p_patch->>'customer_email',
    agreed_amount=(p_patch->>'agreed_amount')::numeric,due_date=(p_patch->>'due_date')::date,
    agreed_scope=p_patch->>'agreed_scope',status=p_patch->>'status',notes=p_patch->>'notes',
    terms_confirmed=(p_patch->>'terms_confirmed')::boolean,paid=(p_patch->>'paid')::boolean,delivered=(p_patch->>'delivered')::boolean,
    public_notice=coalesce(p_patch->>'public_notice',''),public_notice_until=(p_patch->>'public_notice_until')::timestamptz,
    public_updated_at=case when before_row.progress_percent is distinct from coalesce((p_patch->>'progress_percent')::integer,before_row.progress_percent)
        or before_row.service_progress is distinct from coalesce(p_patch->'service_progress',before_row.service_progress)
        or before_row.status is distinct from p_patch->>'status'
        or before_row.public_notice is distinct from coalesce(p_patch->>'public_notice','')
        or before_row.public_notice_until is distinct from (p_patch->>'public_notice_until')::timestamptz
        or before_row.agreed_amount is distinct from (p_patch->>'agreed_amount')::numeric
        or before_row.due_date is distinct from (p_patch->>'due_date')::date
        or before_row.terms_confirmed is distinct from (p_patch->>'terms_confirmed')::boolean
        or before_row.paid is distinct from (p_patch->>'paid')::boolean
        or before_row.delivered is distinct from (p_patch->>'delivered')::boolean then now() else before_row.public_updated_at end,
    version=version+1,updated_at=now()
  where id=p_id returning * into after_row;
  select coalesce(jsonb_object_agg(k,jsonb_build_object('before',to_jsonb(before_row)->k,'after',to_jsonb(after_row)->k)),'{}'::jsonb)
    into changes from jsonb_object_keys(p_patch) as fields(k) where to_jsonb(before_row)->k is distinct from to_jsonb(after_row)->k;
  if changes<>'{}'::jsonb then insert into public.lb_order_history(order_id,actor_email,changes) values(p_id,p_actor,changes);end if;
  return to_jsonb(after_row);
end;
$$;

commit;
