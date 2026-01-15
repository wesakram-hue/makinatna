"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

type Locale = "en" | "ar";
type Status = "draft" | "published" | "archived";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function isStatus(v: unknown): v is Status {
  return v === "draft" || v === "published" || v === "archived";
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
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

export async function setListingStatus(
  localeArg: Locale,
  idArg: string,
  nextStatusArg: Status,
  _formData?: FormData
) {
  const locale = safeLocale(localeArg);

  if (!isUuid(idArg) || !isStatus(nextStatusArg)) {
    redirect(`/${locale}/supplier/listings?err=bad_id&src=action`);
  }

  const { supabase } = await requireSupplierPortal(locale);

  const { error } = await supabase.from("listings").update({ status: nextStatusArg }).eq("id", idArg);

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

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id,display_name,city")
    .eq("owner_id", user.id)
    .maybeSingle();

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
      status: "draft",
    })
    .select("id,created_at")
    .maybeSingle();

  console.log("[createListingDraft] insertData", inserted);

  if (insertErr) {
    redirect(`/${locale}/supplier/listings/new?error=${encodeURIComponent(insertErr.message)}`);
  }

  let newId = inserted?.id;

  if (!newId || !isUuid(newId)) {
    const { data: latest, error: latestErr } = await supabase
      .from("listings")
      .select("id")
      .eq("supplier_id", supplier.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestErr && latest?.id && isUuid(latest.id)) {
      newId = latest.id;
    }
  }

  if (!newId || !isUuid(newId)) {
    redirect(`/${locale}/supplier/listings?err=bad_id&src=create`);
  }

  redirect(`/${locale}/supplier/listings/${newId}?created=1#images`);
}
