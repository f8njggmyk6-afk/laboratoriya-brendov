-- Installation script for a dedicated Brand Laboratory Supabase project.
-- Apply only after choosing the target project. Never apply to nirvana-core by default.
begin;
create table if not exists public.lb_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  customer_name text not null check(length(customer_name) between 1 and 120),
  customer_email text not null check(length(customer_email) between 3 and 254),
  brief text not null check(length(brief) between 1 and 4000),
  services jsonb not null default '[]',
  advertising_total numeric(12,2) not null default 0 check(advertising_total>=0),
  development_total numeric(12,2) not null default 0 check(development_total>=0),
  catalog_total numeric(12,2) not null default 0 check(catalog_total=advertising_total+development_total),
  has_custom boolean not null default false,
  agreed_amount numeric(12,2) check(agreed_amount>=0 and agreed_amount<=100000000),
  due_date date,
  agreed_scope text not null default '' check(length(agreed_scope)<=10000),
  status text not null default 'new' check(status in ('new','discussion','in_progress','approval','completed')),
  notes text not null default '' check(length(notes)<=10000),
  terms_confirmed boolean not null default false,
  paid boolean not null default false,
  delivered boolean not null default false,
  notification_status text not null default 'pending' check(notification_status in ('pending','sent','failed')),
  constraint work_requires_agreement check(status in ('new','discussion') or (terms_confirmed and agreed_amount is not null and due_date is not null and length(trim(agreed_scope))>0)),
  constraint completion_requires_handover check(status<>'completed' or (paid and delivered))
);
create index if not exists lb_orders_created on public.lb_orders(created_at desc);
create index if not exists lb_orders_due on public.lb_orders(due_date) where status<>'completed';
create table if not exists public.lb_order_history(
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.lb_orders(id),
  created_at timestamptz not null default now(),
  actor_email text not null,
  changes jsonb not null
);
create index if not exists lb_history_order on public.lb_order_history(order_id,created_at desc);
create table if not exists public.lb_admin_rate_limits(
  key text primary key,
  window_started timestamptz not null,
  hit_count integer not null
);
alter table public.lb_orders enable row level security;
alter table public.lb_order_history enable row level security;
alter table public.lb_admin_rate_limits enable row level security;
-- No anon/authenticated policies. All operations go through the owner-checked server API.
revoke all on public.lb_orders,public.lb_order_history,public.lb_admin_rate_limits from public,anon,authenticated;
revoke all on sequence public.lb_orders_order_number_seq from public,anon,authenticated;
grant select,insert,update on public.lb_orders to service_role;
grant select,insert on public.lb_order_history to service_role;
grant select,insert,update on public.lb_admin_rate_limits to service_role;
grant usage,select on sequence public.lb_orders_order_number_seq to service_role;
create or replace function public.lb_admin_rate_limit(p_key text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security invoker set search_path='' as $$
declare hits integer;
begin
  if p_limit<1 or p_seconds<1 or length(p_key)<>64 then return false;end if;
  insert into public.lb_admin_rate_limits(key,window_started,hit_count) values(p_key,now(),1)
  on conflict(key) do update set
    window_started=case when public.lb_admin_rate_limits.window_started<=now()-make_interval(secs=>p_seconds) then now() else public.lb_admin_rate_limits.window_started end,
    hit_count=case when public.lb_admin_rate_limits.window_started<=now()-make_interval(secs=>p_seconds) then 1 else public.lb_admin_rate_limits.hit_count+1 end
  returning hit_count into hits;
  return hits<=p_limit;
end;
$$;
create or replace function public.lb_admin_update_order(p_id uuid,p_version integer,p_patch jsonb,p_actor text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare before_row public.lb_orders; after_row public.lb_orders; changes jsonb; editable jsonb;
begin
  select * into before_row from public.lb_orders where id=p_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if before_row.version<>p_version then raise exception 'version_conflict';end if;
  if p_patch-'customer_name'-'customer_email'-'agreed_amount'-'due_date'-'agreed_scope'-'status'-'notes'-'terms_confirmed'-'paid'-'delivered'<>'{}'::jsonb then raise exception 'invalid_patch';end if;
  update public.lb_orders set
    customer_name=p_patch->>'customer_name',customer_email=p_patch->>'customer_email',
    agreed_amount=(p_patch->>'agreed_amount')::numeric,due_date=(p_patch->>'due_date')::date,
    agreed_scope=p_patch->>'agreed_scope',status=p_patch->>'status',notes=p_patch->>'notes',
    terms_confirmed=(p_patch->>'terms_confirmed')::boolean,paid=(p_patch->>'paid')::boolean,delivered=(p_patch->>'delivered')::boolean,
    version=version+1,updated_at=now()
  where id=p_id returning * into after_row;
  select coalesce(jsonb_object_agg(k,jsonb_build_object('before',to_jsonb(before_row)->k,'after',to_jsonb(after_row)->k)),'{}'::jsonb)
    into changes from jsonb_object_keys(p_patch) as fields(k) where to_jsonb(before_row)->k is distinct from to_jsonb(after_row)->k;
  if changes<>'{}'::jsonb then insert into public.lb_order_history(order_id,actor_email,changes) values(p_id,p_actor,changes);end if;
  return to_jsonb(after_row);
end;
$$;
revoke all on function public.lb_admin_rate_limit(text,integer,integer),public.lb_admin_update_order(uuid,integer,jsonb,text) from public,anon,authenticated;
grant execute on function public.lb_admin_rate_limit(text,integer,integer),public.lb_admin_update_order(uuid,integer,jsonb,text) to service_role;
commit;
