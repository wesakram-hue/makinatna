"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { isUuid } from "@/lib/uuid";

type Locale = "en" | "ar";
type Status = "draft" | "published" | "archived";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function isStatus(v: unknown): v is Status {
  return v === "draft" || v === "published" || v === "archived";
}

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function getNum(fd: FormData, key: string): number | null {
  const raw = getStr(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function setListingStatus(localeArg: Locale, idArg: string, nextStatusArg: Status) {
  const locale = safeLocale(localeArg);

  if (!isUuid(idArg) || !isStatus(nextStatusArg)) {
    throw new Error("bad_request: invalid id or status");
  }

  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: listing } = await supabase
    .from("listings")
    .select("id,supplier_id,slug")
    .eq("id", idArg)
    .maybeSingle();

  if (!listing) {
    redirect(`/${locale}/supplier/listings?err=not_found&src=action`);
  }

  const { data: owns } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", listing.supplier_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!owns) {
    redirect(`/${locale}/supplier/listings?err=not_found&src=action`);
  }

  const wantsPublish = nextStatusArg === "published";

  let nextSlug: string | null = listing.slug ?? null;

  if (wantsPublish && (!nextSlug || nextSlug.trim().length === 0)) {
    nextSlug = `listing-${String(listing.id).slice(0, 8)}`;
  }

  const patch: { status: Status; published_at: string | null; slug?: string | null } = {
    status: nextStatusArg,
    published_at: wantsPublish ? new Date().toISOString() : null,
  };

  if (wantsPublish) {
    patch.slug = nextSlug;
  }

  const { error } = await supabase.from("listings").update(patch).eq("id", idArg);

  if (error) {
    redirect(`/${locale}/supplier/listings?err=${encodeURIComponent(error.message)}&src=action`);
  }

  revalidatePath(`/${locale}/supplier/listings`);
  revalidatePath(`/${locale}/supplier/listings/${idArg}`);

  redirect(`/${locale}/supplier/listings/${idArg}?updated=1#images`);
}

export async function createListingDraft(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));

  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: supplier, error: supplierErr } = await supabase
    .from("suppliers")
    .select("id,display_name,city")
    .eq("owner_id", user.id)
    .single();

  if (supplierErr) {
    throw new Error(supplierErr.message);
  }

  const supplierIncomplete =
    !supplier?.id ||
    !supplier.display_name ||
    supplier.display_name.trim().length === 0 ||
    !supplier.city;

  if (supplierIncomplete) {
    redirect(`/${locale}/supplier/profile?next=/${locale}/supplier/listings/new`);
  }

  const titleEn = getStr(formData, "title_en");
  const titleAr = getStr(formData, "title_ar");
  const descEn = getStr(formData, "description_en");
  const descAr = getStr(formData, "description_ar");
  const dailyRate = getNum(formData, "daily_rate");
  const currency = getStr(formData, "currency") || "SAR";
  let cityId: string | null = null;

  if (supplier.city) {
    const { data: cityMatch } = await supabase
      .from("cities")
      .select("id")
      .ilike("name_en", supplier.city)
      .limit(1)
      .maybeSingle();
    cityId = cityMatch?.id ?? null;
  }

  if (!titleEn && !titleAr) {
    redirect(`/${locale}/supplier/listings/new?error=missing_title`);
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("listings")
    .insert({
      supplier_id: supplier.id,
      title_en: titleEn || null,
      title_ar: titleAr || null,
      description_en: descEn || null,
      description_ar: descAr || null,
      daily_rate: dailyRate,
      currency,
      city_id: cityId,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertErr) {
    redirect(`/${locale}/supplier/listings/new?error=${encodeURIComponent(insertErr.message)}`);
  }

  const newId = inserted?.id;
  if (!newId || !isUuid(newId)) {
    throw new Error("create_listing: insert returned invalid id");
  }

  redirect(`/${locale}/supplier/listings/${newId}?created=1#images`);
}

// Backfill helper (manual SQL):
// update listings set city_id = cities.id
// from suppliers
// join cities on lower(cities.name_en) = lower(suppliers.city)
// where listings.supplier_id = suppliers.id
//   and listings.city_id is null;
