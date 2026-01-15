"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

type Locale = "en" | "ar";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function getUuid(fd: FormData, key: string): string {
  const raw = fd.get(key);
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v || v === "undefined" || !isUuid(v)) throw new Error(`bad_uuid:${key}:${v}`);
  return v;
}

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function safeHttpUrl(input: string): string | null {
  try {
    const u = new URL(input);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function requireSupplierAndListing(
  locale: Locale,
  listingId: string,
  userId: string,
  supabase: SupabaseClient
) {
  const { data: listing } = await supabase
    .from("listings")
    .select("id,supplier_id")
    .eq("id", listingId)
    .maybeSingle();

  if (!listing) redirect(`/${locale}/supplier/listings?err=not_found`);

  const { data: owns } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", listing.supplier_id)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!owns) redirect(`/${locale}/supplier/listings?err=not_found`);

  return { listing };
}

export async function addListingImage(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  let listingId = "";
  try {
    listingId = getUuid(formData, "listing_id");
  } catch {
    redirect(`/${locale}/supplier/listings?err=bad_request&src=action`);
  }
  const urlRaw = String(formData.get("url") ?? "").trim();

  const url = safeHttpUrl(urlRaw);
  if (!url) redirect(`/${locale}/supplier/listings/${listingId}?err=bad_url`);

  const alt_en = String(formData.get("alt_en") ?? "").trim() || null;
  const alt_ar = String(formData.get("alt_ar") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const requestedPrimary = formData.get("is_primary") === "1";

  const { supabase, user } = await requireSupplierPortal(locale);
  await requireSupplierAndListing(locale, listingId, user.id, supabase);

  const { data: existingPrimary } = await supabase
    .from("listing_images")
    .select("id")
    .eq("listing_id", listingId)
    .eq("is_primary", true)
    .maybeSingle();

  const willBePrimary = requestedPrimary || !existingPrimary;

  if (willBePrimary) {
    await supabase
      .from("listing_images")
      .update({ is_primary: false })
      .eq("listing_id", listingId)
      .eq("is_primary", true);
  }

  const { error } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    url,
    alt_en,
    alt_ar,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_primary: willBePrimary,
  });

  if (error) redirect(`/${locale}/supplier/listings/${listingId}?err=${encodeURIComponent(error.message)}`);

  revalidatePath(`/${locale}/supplier/listings/${listingId}`);
  redirect(`/${locale}/supplier/listings/${listingId}?img=1#images`);
}

export async function setPrimaryListingImage(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  let listingId = "";
  let imageId = "";
  try {
    listingId = getUuid(formData, "listing_id");
    imageId = getUuid(formData, "image_id");
  } catch {
    redirect(`/${locale}/supplier/listings?err=bad_request&src=action`);
  }

  const { supabase, user } = await requireSupplierPortal(locale);
  await requireSupplierAndListing(locale, listingId, user.id, supabase);

  await supabase
    .from("listing_images")
    .update({ is_primary: false })
    .eq("listing_id", listingId)
    .eq("is_primary", true);

  const { error } = await supabase
    .from("listing_images")
    .update({ is_primary: true })
    .eq("id", imageId)
    .eq("listing_id", listingId);

  if (error) redirect(`/${locale}/supplier/listings/${listingId}?err=${encodeURIComponent(error.message)}`);

  revalidatePath(`/${locale}/supplier/listings/${listingId}`);
  redirect(`/${locale}/supplier/listings/${listingId}?img=1#images`);
}

export async function deleteListingImage(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  let listingId = "";
  let imageId = "";
  try {
    listingId = getUuid(formData, "listing_id");
    imageId = getUuid(formData, "image_id");
  } catch {
    redirect(`/${locale}/supplier/listings?err=bad_request&src=action`);
  }

  const { supabase, user } = await requireSupplierPortal(locale);
  await requireSupplierAndListing(locale, listingId, user.id, supabase);

  const { error } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", imageId)
    .eq("listing_id", listingId);

  if (error) redirect(`/${locale}/supplier/listings/${listingId}?err=${encodeURIComponent(error.message)}`);

  revalidatePath(`/${locale}/supplier/listings/${listingId}`);
  redirect(`/${locale}/supplier/listings/${listingId}?img=1#images`);
}
