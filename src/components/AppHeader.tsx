import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { t, type Locale } from "@/lib/i18n";
import { signOut } from "@/lib/auth/actions";

type Props = {
  locale: Locale;
};

export default async function AppHeader({ locale }: Props) {
  const otherLocale = locale === "en" ? "ar" : "en";
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? "buyer";
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className="font-semibold">
            {t(locale, "app.name")}
          </Link>
          <Link href={`/${locale}/listings`} className="underline">
            {t(locale, "nav.listings")}
          </Link>
          <Link href={`/${locale}/supplier`} className="underline">
            {t(locale, "nav.supplierPortal")}
          </Link>
          <Link href={`/${otherLocale}`} className="underline">
            {locale === "en" ? t(locale, "nav.switchToArabic") : t(locale, "nav.switchToEnglish")}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span>
                {t(locale, "auth.signedInAs")} {user.email} ({role})
              </span>
              <form action={signOut}>
                <input type="hidden" name="locale" value={locale} />
                <button className="underline" type="submit">
                  {t(locale, "auth.signOut")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href={`/${locale}/sign-in`} className="underline">
                {t(locale, "nav.signIn")}
              </Link>
              <Link href={`/${locale}/register`} className="underline">
                {t(locale, "nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
