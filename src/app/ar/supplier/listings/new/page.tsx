import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import { requireSupplierPortal } from "@/lib/auth/requireRole";
import { createListingDraft } from "@/app/actions/listings";

type SearchParams = { error?: string };

const locale = "ar";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const error = sp?.error ?? "";

  await requireSupplierPortal(locale);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t(locale, "supplier.newListingTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t(locale, "supplier.newListingDesc")}</p>
        </div>
        <Button asChild>
          <Link href="/ar/supplier/listings">{t(locale, "supplier.myListingsNav")}</Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="p-4">
        <form action={createListingDraft} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm" htmlFor="title_ar">
                {t(locale, "supplier.listingTitleLabel")} (AR)
              </label>
              <Input
                id="title_ar"
                name="title_ar"
                placeholder={t(locale, "supplier.listingTitlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="title_en">
                {t(locale, "supplier.listingTitleLabel")} (EN)
              </label>
              <Input
                id="title_en"
                name="title_en"
                placeholder={t(locale, "supplier.listingTitlePlaceholder")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm" htmlFor="description_ar">
                {t(locale, "supplier.listingDescriptionLabel")} (AR)
              </label>
              <Textarea
                id="description_ar"
                name="description_ar"
                placeholder={t(locale, "supplier.listingDescriptionPlaceholder")}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="description_en">
                {t(locale, "supplier.listingDescriptionLabel")} (EN)
              </label>
              <Textarea
                id="description_en"
                name="description_en"
                placeholder={t(locale, "supplier.listingDescriptionPlaceholder")}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm" htmlFor="daily_rate">
                {t(locale, "supplier.dailyRateLabel")}
              </label>
              <Input
                id="daily_rate"
                name="daily_rate"
                type="number"
                min="0"
                step="1"
                placeholder={t(locale, "supplier.dailyRatePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm" htmlFor="currency">
                {t(locale, "supplier.currencyLabel")}
              </label>
              <Input id="currency" name="currency" defaultValue="SAR" />
            </div>
          </div>

          <Button type="submit">{t(locale, "supplier.saveDraft")}</Button>
        </form>
      </Card>
    </div>
  );
}
