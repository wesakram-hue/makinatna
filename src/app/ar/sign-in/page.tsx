export const dynamic = "force-dynamic";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { signIn } from "@/lib/auth/actions";

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; error?: string; check?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const next = sp.next ?? "/ar/listings";
  const error = sp.error ?? "";
  const check = sp.check === "1";

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "auth.signInTitle")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link className="underline" href="/ar">
            {t(locale, "nav.home")}
          </Link>
          <Link className="underline" href={`/en/sign-in`}>
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {check ? (
        <div className="rounded border border-border bg-muted/30 p-4 text-sm">
          {t(locale, "auth.checkEmail")}
        </div>
      ) : null}

      <form action={signIn} className="space-y-4 max-w-xl">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="email">
            {t(locale, "auth.email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">
            {t(locale, "auth.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {t(locale, "auth.signIn")}
        </button>

        <Link href={`/${locale}/reset-password`} className="text-sm underline">
          {t(locale, "auth.forgotPassword")}
        </Link>

        <div className="text-sm">
          {t(locale, "auth.noAccount")}{" "}
          <Link href={`/ar/register?next=${encodeURIComponent(next)}`} className="underline">
            {t(locale, "auth.signUp")}
          </Link>
        </div>
      </form>
    </main>
  );
}
