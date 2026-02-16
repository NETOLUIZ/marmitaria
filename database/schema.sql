-- Marmitaria - Supabase schema
-- Execute no SQL Editor do Supabase

create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  company_id bigint not null references public.companies(id) on delete restrict,
  qty integer not null check (qty >= 0),
  canceled_qty integer not null default 0 check (canceled_qty >= 0),
  address text,
  notes text,
  status text not null default 'Ativo',
  created_at timestamptz not null default now()
);

alter table public.orders
add column if not exists canceled_qty integer not null default 0;

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_companies_name on public.companies(name);
create index if not exists idx_orders_created_at on public.orders(created_at);
create index if not exists idx_orders_company_id on public.orders(company_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

alter table public.companies enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "companies public access" on public.companies;
create policy "companies public access"
on public.companies
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "menu_items public access" on public.menu_items;
create policy "menu_items public access"
on public.menu_items
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "orders public access" on public.orders;
create policy "orders public access"
on public.orders
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "order_items public access" on public.order_items;
create policy "order_items public access"
on public.order_items
for all
to anon, authenticated
using (true)
with check (true);
