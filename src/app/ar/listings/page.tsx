import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";
import { localizeText } from "@/lib/localize";
import BidiText from "@/components/BidiText";

type PublicListingRow = {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  supplier_display_name: string | null;
  city_name_en: string | null;
  city_name_ar: string | null;
  category_name_en: string | null;
  category_name_ar: string | null;
  daily_rate: number | string | null;
  currency: string | null;
  published_at: string | null;
};

const locale = "ar";

export default async function ListingsPage() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("public_listings")
    .select(
      "id,title_en,title_ar,city_name_en,city_name_ar,category_name_en,category_name_ar,supplier_display_name,daily_rate,currency,published_at"
    )
    .order("published_at", { ascending: false })
    .limit(50);

  const listings = (data ?? []) as PublicListingRow[];

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "listings.title")}</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/ar" className="underline">
            {t(locale, "nav.home")}
          </Link>
          <Link href="/ar/rtl-smoke" className="underline">
            {t(locale, "nav.rtlSmoke")}
          </Link>
          <Link href="/en/listings" className="underline">
            {t(locale, "nav.switchToEnglish")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">{t(locale, "listings.empty")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const titleText = localizeText(locale, item.title_en, item.title_ar).trim();
            const title = titleText || t(locale, "listing.untitled");
            const cityText = localizeText(locale, item.city_name_en, item.city_name_ar);
            const categoryText = localizeText(locale, item.category_name_en, item.category_name_ar);
            const supplier = (item.supplier_display_name ?? "").trim() || "—";
            const dailyRate = item.daily_rate == null ? null : Number(item.daily_rate);
            const price =
              dailyRate != null && Number.isFinite(dailyRate)
                ? formatCurrency(locale, dailyRate, item.currency ?? "SAR")
                : null;

            return (
              <div
                key={item.id}
                className="space-y-2 rounded-lg border border-border bg-muted/30 p-4"
              >
                <h2 className="text-lg font-semibold">
                  <BidiText>{title}</BidiText>
                </h2>
                <div className="text-sm text-muted-foreground">
                  {t(locale, "listings.supplier")}: <BidiText>{supplier}</BidiText>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(locale, "listings.city")}: <BidiText>{cityText}</BidiText>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t(locale, "listings.category")}: <BidiText>{categoryText}</BidiText>
                </div>
                {price && (
                  <div className="text-sm font-medium">
                    <span dir="ltr" className="tabular-nums">
                      {price}
                    </span>{" "}
                    - {t(locale, "listings.pricePerDay")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
