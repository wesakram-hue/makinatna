"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

type Locale = "en" | "ar";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
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

  const { error } = await supabase.from("listings").insert({
    owner_id: user.id,
    title_en: titleEn || null,
    title_ar: titleAr || null,
    description_en: descEn || null,
    description_ar: descAr || null,
    daily_rate: dailyRate,
    currency,
    published_at: null,
  });

  if (error) {
    redirect(`/${locale}/supplier/listings/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/supplier/listings?created=1`);
}
