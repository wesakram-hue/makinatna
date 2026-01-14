# Schema v1 (Supabase)

This migration creates a minimal marketplace schema with strict row-level security for profiles, suppliers, listings, RFQs, offers, and messaging. It also seeds lightweight lookup data (categories and cities) and includes helper functions used by RLS policies.

## How to apply

1. Open Supabase Dashboard → SQL Editor.
2. Paste the contents of `supabase/migrations/0001_schema_v1.sql`.
3. Click **Run** to execute the migration.

## Tables overview

- **profiles**: Extends `auth.users`; stores role, name, and locale with automatic creation on signup.
- **suppliers**: Public company profile (no private contact data).
- **supplier_private**: Private/legal and contact info for a supplier.
- **categories**: Equipment categories (seeded).
- **cities**: City lookups (seeded).
- **listings**: Supplier-listed equipment with localized titles/descriptions and pricing.
- **rfqs**: Buyer requests with scheduling and budget range.
- **rfq_items**: Line items for each RFQ.
- **rfq_invites**: Which suppliers were invited to an RFQ.
- **offers**: Supplier offers in response to an RFQ.
- **messages**: Internal RFQ/offer messaging between buyer and invited suppliers.
- **events**: Audit/analytics events per actor.

Helper functions provide readable RLS checks: `is_admin`, `current_supplier_id`, `is_supplier_owner`, `is_buyer_of_rfq`, and `is_invited_to_rfq`.

## Smoke test queries

Run these in the Supabase SQL editor after applying the migration:

```sql
-- Lookup data
select * from public.categories;
select * from public.cities;

-- Optional: create a test listing as service role (example only)
-- insert into public.listings (supplier_id, title_en, status) values ('<supplier-uuid>', 'Demo', 'draft');

-- Confirm RLS is enabled on key tables
select relname, relrowsecurity from pg_class where relname in (
  'profiles','suppliers','supplier_private','listings','rfqs','rfq_items','rfq_invites','offers','messages','events'
);
```
