"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function safeNext(locale: Locale, v: unknown): string {
  const fallback = `/${locale}/listings`;
  if (typeof v !== "string") return fallback;

  // Basic open-redirect hardening:
  // - must start with "/"
  // - must not start with "//"
  // - should stay within the same locale segment
  if (!v.startsWith("/") || v.startsWith("//")) return fallback;
  if (!v.startsWith(`/${locale}/`)) return fallback;

  return v;
}

export async function signInWithPassword(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const nextUrl = safeNext(locale, formData.get("next"));

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/${locale}/sign-in?error=1&next=${encodeURIComponent(nextUrl)}`);
  }

  redirect(nextUrl);
}

export async function signOut(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}

export async function signIn(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const nextRaw = formData.get("next");
  const hasNextParam = typeof nextRaw === "string" && nextRaw.length > 0;
  const next = hasNextParam ? safeNext(locale, nextRaw) : null;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const nextSafe = next && next.length > 0 ? next : `/${locale}/supplier`;
    redirect(
      `/${locale}/sign-in?next=${encodeURIComponent(nextSafe)}&error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  // Confirm session is now available on this request
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    // Extremely defensive fallback: if cookies/session didn't stick, force a clear retry
    const nextSafe = next && next.length > 0 ? next : `/${locale}/supplier`;
    redirect(
      `/${locale}/sign-in?next=${encodeURIComponent(nextSafe)}&error=${encodeURIComponent(
        "Session not established. Please try again."
      )}`
    );
  }

  // Read role (if missing profile row, treat as buyer)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "buyer") as "buyer" | "supplier" | "admin";

  const wantsSupplierArea =
    !!next && (next === `/${locale}/supplier` || next.startsWith(`/${locale}/supplier/`));

  if (wantsSupplierArea && role !== "supplier" && role !== "admin") {
    redirect(`/${locale}/supplier/start`);
  }

  if (!next) {
    const defaultNext = role === "supplier" || role === "admin" ? `/${locale}/supplier` : `/${locale}/listings`;
    redirect(defaultNext);
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const wantsSupplierRaw = formData.get("register_as_supplier");
  const wantsSupplier =
    wantsSupplierRaw === "on" || wantsSupplierRaw === "true" || wantsSupplierRaw === "1";

  const nextRaw = formData.get("next");
  const nextBase =
    typeof nextRaw === "string" && nextRaw ? safeNext(locale, nextRaw) : `/${locale}/listings`;
  const destination = wantsSupplier ? `/${locale}/supplier/start` : nextBase;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&asSupplier=${wantsSupplier ? "1" : "0"}&error=${encodeURIComponent("Email is required.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&asSupplier=${wantsSupplier ? "1" : "0"}&error=${encodeURIComponent(
        "Password must be at least 8 characters."
      )}`
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/exchange?next=${encodeURIComponent(destination)}`,
    },
  });

  if (error) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&asSupplier=${wantsSupplier ? "1" : "0"}&error=${encodeURIComponent(error.message)}`
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user) {
    redirect(destination);
  }

  redirect(`/${locale}/sign-in?check=1&next=${encodeURIComponent(destination)}`);
}

export async function registerUser(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const nextRaw = formData.get("next");
  const wantsSupplier =
    formData.get("as_supplier") === "1" || formData.get("as_supplier") === "on";

  const nextBase =
    typeof nextRaw === "string" && nextRaw ? safeNext(locale, nextRaw) : `/${locale}/listings`;
  const destination = wantsSupplier ? `/${locale}/supplier` : nextBase;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&error=${encodeURIComponent("Email is required.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&error=${encodeURIComponent("Password must be at least 8 characters.")}`
    );
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(
      `/${locale}/register?next=${encodeURIComponent(
        destination
      )}&error=${encodeURIComponent(error.message)}`
    );
  }

  const userId = data.user?.id;
  if (userId) {
    const admin = createAdminClient();
    await admin.from("profiles").upsert({
      id: userId,
      role: wantsSupplier ? "supplier" : "buyer",
    });
  }

  redirect(`/${locale}/register?sent=1&next=${encodeURIComponent(destination)}`);
}

export async function sendResetPasswordEmail(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const email = String(formData.get("email") || "").trim();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!email) {
    redirect(
      `/${locale}/reset-password?error=${encodeURIComponent("Missing email address")}`
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/exchange?next=/${locale}/update-password`,
  });

  if (error) {
    redirect(
      `/${locale}/reset-password?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/${locale}/reset-password?sent=1`);
}

export async function updatePassword(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (password.length < 8) {
    redirect(
      `/${locale}/update-password?error=${encodeURIComponent(
        "Password must be at least 8 characters."
      )}`
    );
  }

  if (password !== confirm) {
    redirect(
      `/${locale}/update-password?error=${encodeURIComponent("Passwords do not match.")}`
    );
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/${locale}/update-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/supplier`);
}

export async function becomeSupplier(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const displayName = String(formData.get("display_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  const supabase = await createServerClient();

  const { error } = await supabase.rpc("become_supplier", {
    display_name: displayName,
    city,
  });

  if (error) {
    redirect(`/${locale}/supplier/start?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/supplier`);
}
