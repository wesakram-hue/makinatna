import Link from "next/link";
import { ReactNode } from "react";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  locale: Locale;
  children: ReactNode;
};

export function SupplierLayout({ locale, children }: Props) {
  const otherLocale = locale === "en" ? "ar" : "en";
  const navItems = [
    { key: "dashboard", href: `/${locale}/supplier`, label: t(locale, "supplier.dashboardNav") },
    { key: "myListings", href: `/${locale}/supplier/listings`, label: t(locale, "supplier.myListingsNav") },
    { key: "newListing", href: `/${locale}/supplier/listings/new`, label: t(locale, "supplier.newListingNav") },
    { key: "profile", href: `/${locale}/supplier/profile`, label: t(locale, "supplier.profileNav") },
    { key: "settings", href: `/${locale}/supplier/settings`, label: t(locale, "supplier.settingsNav") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">{t(locale, "supplier.title")}</div>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/${locale}`} className="underline">
              {t(locale, "nav.home")}
            </Link>
            <Link href={`/${locale}/listings`} className="underline">
              {t(locale, "nav.listings")}
            </Link>
            <Link href={`/${otherLocale}/supplier`} className="underline">
              {locale === "en" ? t(locale, "nav.switchToArabic") : t(locale, "nav.switchToEnglish")}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[220px,1fr]">
        <Card className="p-4">
          <nav className="space-y-2 text-sm">
            {navItems.map((item) => (
              <Button key={item.key} asChild variant="ghost" className="w-full justify-start">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </Card>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
