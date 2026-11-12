create table public.lb_admin_pin (
  owner_email text primary key,
  pin_hash text not null check (pin_hash ~ '^[a-f0-9]{32}:[a-f0-9]{64}$')
);
alter table public.lb_admin_pin enable row level security;
revoke all on public.lb_admin_pin from public, anon, authenticated;
grant select, insert, update on public.lb_admin_pin to service_role;
