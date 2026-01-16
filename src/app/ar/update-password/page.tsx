export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { t } from "@/lib/i18n";
import { updatePassword } from "@/lib/auth/actions";
import { createServerClient } from "@/lib/supabase/server";

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ code?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const code = sp.code;
  const error = sp.error ? decodeURIComponent(sp.error) : "";

  if (code) {
    redirect(
      `/auth/exchange?code=${encodeURIComponent(code)}&next=${encodeURIComponent(
        "/ar/update-password"
      )}`
    );
  }

  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <main className="p-6 space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "auth.setPassword")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link className="underline" href="/ar">
            {t(locale, "nav.home")}
          </Link>
          <Link className="underline" href="/en/update-password">
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded border border-border bg-muted/30 p-4 text-sm">
        حالة الجلسة:{" "}
        {user ? (
          <>
            تم تسجيل الدخول:{" "}
            <span dir="ltr" className="font-medium">
              {user.email}
            </span>
          </>
        ) : (
          <span className="text-destructive">لا توجد جلسة بعد</span>
        )}
      </div>

      <form action={updatePassword} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">
            {t(locale, "auth.newPassword")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="confirm">
            {t(locale, "auth.confirmPassword")}
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {t(locale, "auth.updatePassword")}
        </button>
      </form>
    </main>
  );
}
