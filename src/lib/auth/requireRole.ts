import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";

export type Role = "buyer" | "supplier" | "admin";

export async function requireUser(locale: Locale, nextPath: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    redirect(`/${locale}/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

export async function requireRole(locale: Locale, nextPath: string, allowed: Role[]) {
  const { supabase, user } = await requireUser(locale, nextPath);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "buyer") as Role;

  if (allowed.includes(role)) {
    return { supabase, user, role };
  }

  // Key rule: logged-in buyer trying supplier area -> onboarding
  if (nextPath.startsWith(`/${locale}/supplier`)) {
    redirect(`/${locale}/supplier/start`);
  }

  redirect(`/${locale}`);
}

export async function requireSupplierPortal(locale: Locale) {
  const { supabase, user } = await requireUser(locale, `/${locale}/supplier`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "buyer") as Role;

  if (role === "admin") {
    return { supabase, user, role };
  }

  if (role !== "supplier") {
    redirect(`/${locale}/supplier/start`);
  }

  const { data: supplierRow } = await supabase
    .from("suppliers")
    .select("id,display_name")
    .eq("owner_id", user.id)
    .maybeSingle();

  const hasSupplier =
    !!supplierRow?.id && typeof supplierRow.display_name === "string" && supplierRow.display_name.trim().length > 0;

  if (!hasSupplier) {
    redirect(`/${locale}/supplier/start`);
  }

  return { supabase, user, role };
}
