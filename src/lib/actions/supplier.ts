"use server";

import { redirect } from "next/navigation";
import { requireSupplierPortal } from "@/lib/auth/requireRole";

type Locale = "en" | "ar";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateSupplierProfile(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const next = getStr(formData, "next") || `/${locale}/supplier`;

  const { supabase, user, role } = await requireSupplierPortal(locale);

  const display_name = getStr(formData, "display_name");
  const city = getStr(formData, "city");

  if (!display_name) {
    redirect(`/${locale}/supplier/profile?error=missing_name&next=${encodeURIComponent(next)}`);
  }

  const { data: supplierRow } = await supabase
    .from("suppliers")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (role !== "admin" && !supplierRow?.id) {
    redirect(`/${locale}/supplier/start?next=${encodeURIComponent(next)}`);
  }

  const { error } = await supabase
    .from("suppliers")
    .update({ display_name, city: city || null })
    .eq("owner_id", user.id);

  if (error) {
    redirect(
      `/${locale}/supplier/profile?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    );
  }

  redirect(`${next}?profile_saved=1`);
}
