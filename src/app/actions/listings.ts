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

function getInt(fd: FormData, key: string): number | null {
  const n = getNum(fd, key);
  if (n == null) return null;
  const i = Math.floor(n);
  return Number.isFinite(i) ? i : null;
}

function getBool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  if (v === null) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true" || s === "on" || s === "yes";
  }
  return false;
}

export async function setListingStatus(
  localeArg: Locale,
  idArg: string,
  nextStatusArg: Status
) {
  const locale = safeLocale(localeArg);

  if (!isUuid(idArg) || !isStatus(nextStatusArg)) {
    throw new Error("bad_request: invalid id or status");
  }

  const { supabase, user } = await requireSupplierPortal(locale);

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("id,supplier_id,slug,title_en,title_ar,daily_rate,weekly_rate,status")
    .eq("id", idArg)
    .maybeSingle();

  if (listingErr) throw new Error(listingErr.message);

  if (!listing) {
    redirect(`/${locale}/supplier/listings?err=not_found&src=action`);
  }

  const { data: owns, error: ownsErr } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", listing.supplier_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownsErr) throw new Error(ownsErr.message);

  if (!owns) {
    redirect(`/${locale}/supplier/listings?err=not_found&src=action`);
  }

  const wantsPublish = nextStatusArg === "published";

  // Publish gate: title + (daily or weekly rate) + at least 1 image
  if (wantsPublish) {
    const hasTitle =
      ((listing.title_en ?? "").trim().length > 0) ||
      ((listing.title_ar ?? "").trim().length > 0);

    const daily = listing.daily_rate == null ? null : Number(listing.daily_rate);
    const weekly = listing.weekly_rate == null ? null : Number(listing.weekly_rate);

    const hasRate =
      (daily != null && Number.isFinite(daily) && daily > 0) ||
      (weekly != null && Number.isFinite(weekly) && weekly > 0);

    const { count: imageCount, error: imgErr } = await supabase
      .from("listing_images")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listing.id);

    if (imgErr) throw new Error(imgErr.message);

    if (!hasTitle) {
      redirect(`/${locale}/supplier/listings/${listing.id}?err=missing_title#details`);
    }

    if (!hasRate) {
      redirect(`/${locale}/supplier/listings/${listing.id}?err=missing_rate#details`);
    }

    if (!imageCount || imageCount < 1) {
      redirect(`/${locale}/supplier/listings/${listing.id}?err=missing_image#images`);
    }
  }

  let nextSlug: string | null = listing.slug ?? null;

  if (wantsPublish && (!nextSlug || nextSlug.trim().length === 0)) {
    nextSlug = `listing-${String(listing.id).slice(0, 8)}`;
  }

  const patch: {
    status: Status;
    published_at: string | null;
    slug?: string | null;
  } = {
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
  revalidatePath(`/${locale}/listings`);

  if (nextSlug) {
    revalidatePath(`/${locale}/listings/${nextSlug}`);
  }

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

  if (supplierErr) throw new Error(supplierErr.message);

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

  // New fields (safe even if your form does not send them yet)
  const minDays = getInt(formData, "min_days");
  const deliveryAvailable = getBool(formData, "delivery_available");
  const operatorAvailable = getBool(formData, "operator_available");
  const depositAmount = getNum(formData, "deposit_amount");

  let cityId: string | null = null;

  if (supplier.city) {
    const raw = supplier.city.trim();
    const safe = raw.replace(/%/g, "").replace(/,/g, " ");
    const pattern = `%${safe}%`;

    const { data: cityMatch, error: cityErr } = await supabase
      .from("cities")
      .select("id")
      .or(`name_en.ilike.${pattern},name_ar.ilike.${pattern},slug.ilike.${pattern}`)
      .limit(1)
      .maybeSingle();

    if (cityErr) throw new Error(cityErr.message);

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

      // enriched fields
      min_days: minDays != null && minDays > 0 ? minDays : 1,
      delivery_available: deliveryAvailable,
      operator_available: operatorAvailable,
      deposit_amount: depositAmount,
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
