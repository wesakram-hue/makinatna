-- Enable RLS
alter table if exists listings enable row level security;
alter table if exists suppliers enable row level security;

-- Backfill city_id from suppliers.city to cities.name_en or slug (case-insensitive)
-- Run as needed to normalise city references
update listings
set city_id = c.id
from suppliers s
join cities c
  on lower(c.name_en) = lower(s.city)
   or lower(c.slug) = lower(s.city)
where listings.supplier_id = s.id
  and listings.city_id is null;

-- Drop existing policies (idempotent)
do $$
begin
  if exists (select 1 from pg_policies where polname = 'public_select_published_listings') then
    drop policy "public_select_published_listings" on listings;
  end if;
  if exists (select 1 from pg_policies where polname = 'owner_select_listings') then
    drop policy "owner_select_listings" on listings;
  end if;
  if exists (select 1 from pg_policies where polname = 'owner_insert_listings') then
    drop policy "owner_insert_listings" on listings;
  end if;
  if exists (select 1 from pg_policies where polname = 'owner_update_listings') then
    drop policy "owner_update_listings" on listings;
  end if;

  if exists (select 1 from pg_policies where polname = 'public_select_active_suppliers') then
    drop policy "public_select_active_suppliers" on suppliers;
  end if;
  if exists (select 1 from pg_policies where polname = 'owner_select_suppliers') then
    drop policy "owner_select_suppliers" on suppliers;
  end if;
  if exists (select 1 from pg_policies where polname = 'owner_upsert_suppliers') then
    drop policy "owner_upsert_suppliers" on suppliers;
  end if;
end$$;

-- Listings policies
create policy "public_select_published_listings"
  on listings for select
  using (status = 'published');

create policy "owner_select_listings"
  on listings for select
  using (
    exists (
      select 1
      from suppliers s
      where s.id = listings.supplier_id
        and s.owner_id = auth.uid()
    )
  );

create policy "owner_insert_listings"
  on listings for insert
  with check (
    exists (
      select 1
      from suppliers s
      where s.id = listings.supplier_id
        and s.owner_id = auth.uid()
    )
  );

create policy "owner_update_listings"
  on listings for update
  using (
    exists (
      select 1
      from suppliers s
      where s.id = listings.supplier_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from suppliers s
      where s.id = listings.supplier_id
        and s.owner_id = auth.uid()
    )
  );

-- Suppliers policies
create policy "public_select_active_suppliers"
  on suppliers for select
  using (coalesce(is_active, true));

create policy "owner_select_suppliers"
  on suppliers for select
  using (owner_id = auth.uid());

create policy "owner_upsert_suppliers"
  on suppliers for insert with check (owner_id = auth.uid())
  , update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Grants
grant usage on schema public to anon, authenticated;
grant select on public.cities to anon, authenticated;
grant select on public.listings to anon, authenticated;
grant select (id, display_name, city, is_active) on public.suppliers to anon, authenticated;

-- Verification note:
-- If hitting "[manage listing] Listing not visible..." on /en|ar/supplier/listings/<uuid>,
-- apply these policies and ensure your auth role is authenticated (not anon).
