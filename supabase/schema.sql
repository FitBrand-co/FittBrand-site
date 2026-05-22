-- FitBrand Supabase schema
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  address text,
  gender text,
  age int,
  weight numeric,
  height numeric,
  level text,
  training_location text,
  training_days int,
  equipment text,
  allergies text,
  goal text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  product_type text not null default 'digital',
  price_amount integer not null default 0,
  currency text not null default 'eur',
  stripe_price_id text unique,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  stripe_session_id text unique,
  stripe_payment_intent text,
  status text not null default 'pending',
  total_amount integer,
  currency text default 'eur',
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text,
  quantity int not null default 1,
  unit_amount integer,
  currency text default 'eur',
  created_at timestamptz default now()
);

create table if not exists public.user_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  product_slug text not null,
  product_name text,
  active boolean default true,
  stripe_session_id text,
  created_at timestamptz default now(),
  unique(user_id, product_slug)
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_access enable row level security;
alter table public.products enable row level security;

create policy "Users can read their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can read own orders" on public.orders
  for select using (auth.uid() = user_id);
create policy "Users can read own order items" on public.order_items
  for select using (
    exists(select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );
create policy "Users can read own access" on public.user_access
  for select using (auth.uid() = user_id);
create policy "Anyone can read active products" on public.products
  for select using (active = true);

insert into public.products (slug, name, product_type, price_amount, currency)
values
  ('aesthetic','Aesthetic Program','digital',499,'eur'),
  ('shred','Shred Program','digital',699,'eur'),
  ('strength','Strength Program','digital',699,'eur'),
  ('bundle','Complete Bundle + Meal Plan AI','digital',1897,'eur'),
  ('mealplan','Meal Plan Guide AI','digital',599,'eur'),
  ('shaker','Premium Shaker Bottle','physical',1499,'eur'),
  ('belt','Lifting Belt','physical',2499,'eur'),
  ('straps','Lifting Straps','physical',1299,'eur')
on conflict (slug) do update set
  name=excluded.name,
  product_type=excluded.product_type,
  price_amount=excluded.price_amount,
  currency=excluded.currency,
  active=true;


-- FitBrand early access lead capture table (v35)
create table if not exists public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  product_interest text,
  goal text,
  monthly_price_interest text,
  start_timeline text,
  notes text,
  source_page text,
  created_at timestamptz default now()
);

alter table public.early_access_leads enable row level security;

drop policy if exists "Anyone can insert early access leads" on public.early_access_leads;
drop policy if exists "Allow public early access insert" on public.early_access_leads;

create policy "Allow public early access insert"
on public.early_access_leads
for insert
to anon, authenticated
with check (true);
