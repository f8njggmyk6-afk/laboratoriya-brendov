-- Customer tracking: private capability codes and explicit public updates.
begin;
alter table public.lb_orders add column tracking_code text not null default ('LB-'||upper(replace(gen_random_uuid()::text,'-',''))) unique;
alter table public.lb_orders add constraint lb_tracking_format check(tracking_code ~ '^LB-[0-9A-F]{32}$');
alter table public.lb_orders add column public_notice text not null default '' check(length(public_notice)<=600);
alter table public.lb_orders add column public_notice_until timestamptz;
alter table public.lb_orders add column public_updated_at timestamptz not null default now();
alter table public.lb_orders drop constraint lb_orders_status_check;
alter table public.lb_orders add constraint lb_orders_status_check check(status in ('new','discussion','in_progress','approval','payment','handover','completed'));
alter table public.lb_orders add constraint handover_requires_payment check((status<>'handover' and not delivered) or paid);
create or replace function public.lb_admin_update_order(p_id uuid,p_version integer,p_patch jsonb,p_actor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare before_row public.lb_orders; after_row public.lb_orders; changes jsonb; editable jsonb;
begin
  select * into before_row from public.lb_orders where id=p_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if before_row.version<>p_version then raise exception 'version_conflict';end if;
  if p_patch-'customer_name'-'customer_email'-'agreed_amount'-'due_date'-'agreed_scope'-'status'-'notes'-'terms_confirmed'-'paid'-'delivered'-'public_notice'-'public_notice_until'<>'{}'::jsonb then raise exception 'invalid_patch';end if;
  update public.lb_orders set
    customer_name=p_patch->>'customer_name',customer_email=p_patch->>'customer_email',
    agreed_amount=(p_patch->>'agreed_amount')::numeric,due_date=(p_patch->>'due_date')::date,
    agreed_scope=p_patch->>'agreed_scope',status=p_patch->>'status',notes=p_patch->>'notes',
    terms_confirmed=(p_patch->>'terms_confirmed')::boolean,paid=(p_patch->>'paid')::boolean,delivered=(p_patch->>'delivered')::boolean,
    public_notice=coalesce(p_patch->>'public_notice',''),public_notice_until=(p_patch->>'public_notice_until')::timestamptz,
    public_updated_at=case when before_row.status is distinct from p_patch->>'status'
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
