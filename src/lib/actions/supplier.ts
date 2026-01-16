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

  const { data: upserted, error } = await supabase
    .from("suppliers")
    .upsert(
      { owner_id: user.id, display_name, city: city || null },
      { onConflict: "owner_id" }
    )
    .select("id, display_name, city")
    .single();

  if (error) {
    redirect(
      `/${locale}/supplier/profile?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
    );
  }

  if (!upserted?.id && role !== "admin") {
    redirect(`/${locale}/supplier/start?next=${encodeURIComponent(next)}`);
  }

  redirect(`${next}?profile_saved=1`);
}
