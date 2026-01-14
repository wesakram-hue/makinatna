-- Supabase schema v1 for MVP marketplace
create extension if not exists pgcrypto;

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.current_supplier_id()
returns uuid
language sql
stable
as $$
  select s.id
  from public.suppliers s
  where s.owner_id = auth.uid()
  order by s.created_at asc
  limit 1;
$$;

create or replace function public.is_supplier_owner(supplier_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.suppliers s
    where s.id = supplier_id and s.owner_id = auth.uid()
  );
$$;

create or replace function public.is_buyer_of_rfq(rfq_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.rfqs r
    where r.id = rfq_id and r.buyer_id = auth.uid()
  );
$$;

create or replace function public.is_invited_to_rfq(rfq_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.rfq_invites ri
    where ri.rfq_id = rfq_id
      and ri.supplier_id = public.current_supplier_id()
  );
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'buyer' check (role in ('buyer','supplier','admin')),
  full_name text,
  locale text not null default 'en' check (locale in ('en','ar')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles select own" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles insert own" on public.profiles
for insert with check (id = auth.uid() or public.is_admin());

create policy "profiles update own" on public.profiles
for update using (id = auth.uid() or public.is_admin());

create policy "profiles admin all" on public.profiles
for all using (public.is_admin());

-- Suppliers
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  display_name text not null,
  city text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger suppliers_set_updated_at
before update on public.suppliers
for each row
execute procedure public.set_updated_at();

alter table public.suppliers enable row level security;

create policy "suppliers owner select" on public.suppliers
for select using (owner_id = auth.uid() or public.is_admin());

create policy "suppliers owner insert" on public.suppliers
for insert with check (owner_id = auth.uid() or public.is_admin());

create policy "suppliers owner update" on public.suppliers
for update using (owner_id = auth.uid() or public.is_admin());

create policy "suppliers admin all" on public.suppliers
for all using (public.is_admin());

-- Supplier private details
create table if not exists public.supplier_private (
  supplier_id uuid primary key references public.suppliers(id) on delete cascade,
  legal_name text,
  cr_number text,
  contact_email text,
  contact_phone text,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger supplier_private_set_updated_at
before update on public.supplier_private
for each row
execute procedure public.set_updated_at();

alter table public.supplier_private enable row level security;

create policy "supplier_private owner select" on public.supplier_private
for select using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "supplier_private owner insert" on public.supplier_private
for insert with check (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "supplier_private owner update" on public.supplier_private
for update using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "supplier_private admin all" on public.supplier_private
for all using (public.is_admin());

-- Categories
create table if not exists public.categories (
  id bigserial primary key,
  slug text unique,
  name_en text,
  name_ar text
);

alter table public.categories enable row level security;

create policy "categories public read" on public.categories
for select using (true);

insert into public.categories (slug, name_en, name_ar) values
  ('cranes', 'Cranes', 'الرافعات'),
  ('generators', 'Generators', 'المولدات'),
  ('pumps', 'Pumps', 'المضخات'),
  ('compressors', 'Compressors', 'الضواغط'),
  ('lighting-towers', 'Lighting Towers', 'أبراج الإنارة')
on conflict do nothing;

-- Cities
create table if not exists public.cities (
  id bigserial primary key,
  slug text unique,
  name_en text,
  name_ar text
);

alter table public.cities enable row level security;

create policy "cities public read" on public.cities
for select using (true);

insert into public.cities (slug, name_en, name_ar) values
  ('riyadh', 'Riyadh', 'الرياض'),
  ('jeddah', 'Jeddah', 'جدة'),
  ('dammam', 'Dammam', 'الدمام'),
  ('mecca', 'Mecca', 'مكة'),
  ('medina', 'Medina', 'المدينة')
on conflict do nothing;

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id),
  category_id bigint references public.categories(id),
  city_id bigint references public.cities(id),
  title_en text,
  title_ar text,
  description_en text,
  description_ar text,
  daily_rate numeric(12,2),
  weekly_rate numeric(12,2),
  currency text not null default 'SAR',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger listings_set_updated_at
before update on public.listings
for each row
execute procedure public.set_updated_at();

alter table public.listings enable row level security;

create policy "listings public published" on public.listings
for select using (status = 'published');

create policy "listings owner read" on public.listings
for select using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "listings owner write" on public.listings
for insert with check (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "listings owner update" on public.listings
for update using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "listings admin all" on public.listings
for all using (public.is_admin());

-- RFQs
create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id),
  city_id bigint references public.cities(id),
  title text,
  description text,
  start_date date,
  end_date date,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  currency text not null default 'SAR',
  status text not null default 'draft' check (status in ('draft','submitted','closed','awarded','cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger rfqs_set_updated_at
before update on public.rfqs
for each row
execute procedure public.set_updated_at();

alter table public.rfqs enable row level security;

create policy "rfqs buyer manage" on public.rfqs
for all
using (buyer_id = auth.uid() or public.is_admin())
with check (buyer_id = auth.uid() or public.is_admin());

create policy "rfqs invited suppliers read" on public.rfqs
for select using (
  public.is_invited_to_rfq(id) or public.is_admin() or buyer_id = auth.uid()
);

create policy "rfqs admin all" on public.rfqs
for all using (public.is_admin());

-- RFQ Items
create table if not exists public.rfq_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  category_id bigint references public.categories(id),
  quantity int not null default 1,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger rfq_items_set_updated_at
before update on public.rfq_items
for each row
execute procedure public.set_updated_at();

alter table public.rfq_items enable row level security;

create policy "rfq_items buyer manage" on public.rfq_items
for all
using (public.is_buyer_of_rfq(rfq_id) or public.is_admin())
with check (public.is_buyer_of_rfq(rfq_id) or public.is_admin());

create policy "rfq_items invited suppliers read" on public.rfq_items
for select using (public.is_invited_to_rfq(rfq_id) or public.is_admin() or public.is_buyer_of_rfq(rfq_id));

create policy "rfq_items admin all" on public.rfq_items
for all using (public.is_admin());

-- RFQ Invites
create table if not exists public.rfq_invites (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited','viewed','responded','declined','expired')),
  created_at timestamptz default now(),
  unique (rfq_id, supplier_id)
);

alter table public.rfq_invites enable row level security;

create policy "rfq_invites buyer insert" on public.rfq_invites
for insert with check (public.is_buyer_of_rfq(rfq_id) or public.is_admin());

create policy "rfq_invites buyer read" on public.rfq_invites
for select using (public.is_buyer_of_rfq(rfq_id) or public.is_admin());

create policy "rfq_invites supplier read" on public.rfq_invites
for select using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "rfq_invites supplier update status" on public.rfq_invites
for update using (public.is_supplier_owner(supplier_id) or public.is_admin());

create policy "rfq_invites admin all" on public.rfq_invites
for all using (public.is_admin());

-- Offers
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  price_total numeric(12,2),
  currency text not null default 'SAR',
  message text,
  status text not null default 'submitted' check (status in ('submitted','accepted','rejected','withdrawn')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (rfq_id, supplier_id)
);

create trigger offers_set_updated_at
before update on public.offers
for each row
execute procedure public.set_updated_at();

alter table public.offers enable row level security;

create policy "offers supplier insert" on public.offers
for insert with check (
  (public.is_supplier_owner(supplier_id) and public.is_invited_to_rfq(rfq_id))
  or public.is_admin()
);

create policy "offers supplier select" on public.offers
for select using (
  (public.is_supplier_owner(supplier_id) and public.is_invited_to_rfq(rfq_id))
  or public.is_admin()
);

create policy "offers supplier update" on public.offers
for update using (
  (public.is_supplier_owner(supplier_id) and public.is_invited_to_rfq(rfq_id))
  or public.is_admin()
);

create policy "offers buyer read" on public.offers
for select using (public.is_buyer_of_rfq(rfq_id) or public.is_admin());

create policy "offers buyer update status" on public.offers
for update using (public.is_buyer_of_rfq(rfq_id) or public.is_admin());

create policy "offers admin all" on public.offers
for all using (public.is_admin());

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references public.rfqs(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "messages participants read" on public.messages
for select using (
  public.is_buyer_of_rfq(rfq_id)
  or public.is_invited_to_rfq(rfq_id)
  or public.is_admin()
);

create policy "messages participants insert" on public.messages
for insert with check (
  sender_id = auth.uid()
  and (
    public.is_buyer_of_rfq(rfq_id)
    or public.is_invited_to_rfq(rfq_id)
    or public.is_admin()
  )
);

create policy "messages admin all" on public.messages
for all using (public.is_admin());

-- Events
create table if not exists public.events (
  id bigserial primary key,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "events actor insert" on public.events
for insert with check (actor_id = auth.uid() or public.is_admin());

create policy "events admin read" on public.events
for select using (public.is_admin());

create policy "events admin all" on public.events
for all using (public.is_admin());
