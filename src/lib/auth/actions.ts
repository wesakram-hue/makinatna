"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";

function safeLocale(v: unknown): Locale {
  return v === "ar" ? "ar" : "en";
}

function safeNext(locale: Locale, v: unknown): string {
  const fallback = `/${locale}/supplier`;
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
  const next = safeNext(locale, formData.get("next"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/${locale}/sign-in?next=${encodeURIComponent(next)}&error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  // Ensure cookies are persisted in edge cases
  await supabase.auth.getUser();

  redirect(next);
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
