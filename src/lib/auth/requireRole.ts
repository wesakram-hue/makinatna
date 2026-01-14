import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { createServerClient } from "@/lib/supabase/server";

export type AppRole = "buyer" | "supplier" | "admin";

export async function requireUser(locale: Locale, nextPath: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect(`/${locale}/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user: data.user };
}

export async function requireRole(
  locale: Locale,
  nextPath: string,
  allowed: AppRole[]
) {
  const { supabase, user } = await requireUser(locale, nextPath);

  // read profile role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // If profile missing, treat as not authorised (or you can auto-create server-side if you prefer).
  const role = (profile?.role ?? "buyer") as AppRole;

  const ok = allowed.includes(role);
  if (!ok) {
    // You can redirect to home or an "unauthorised" page
    redirect(`/${locale}`);
  }

  return { supabase, user, role, profileError: error ?? null };
}
