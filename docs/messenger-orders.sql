alter table public.lb_orders drop constraint lb_orders_customer_email_check;
alter table public.lb_orders add constraint lb_orders_customer_email_check check (length(customer_email) = 0 or length(customer_email) between 3 and 254);
