import Link from "next/link";
import { t } from "@/lib/i18n";
import { formatNumber } from "@/lib/format";

const locale = "en";

export default function Page() {
  return (
    <main className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(locale, "smoke.title")}</h1>
        <div className="flex items-center gap-4">
          <Link href="/en" className="underline">
            {t(locale, "smoke.backHome")}
          </Link>
          <Link href="/ar/rtl-smoke" className="underline">
            {t(locale, "nav.switchToArabic")}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t(locale, "smoke.paragraphTitle")}</h2>
          <p className="text-muted-foreground">
            {t(locale, "smoke.paragraphBody")}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t(locale, "smoke.detailsTitle")}</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>{t(locale, "smoke.detailsItem1")}</li>
            <li>{t(locale, "smoke.detailsItem2")}</li>
            <li>{t(locale, "smoke.detailsItem3")}</li>
            <li>{t(locale, "smoke.detailsItem4")}</li>
          </ul>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t(locale, "smoke.formTitle")}</h2>
          <label className="block text-sm font-medium" htmlFor="name">
            {t(locale, "smoke.formLabel")}
          </label>
          <input
            id="name"
            type="text"
            placeholder={t(locale, "smoke.formPlaceholder")}
            className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {t(locale, "smoke.formSubmit")}
          </button>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t(locale, "smoke.statsTitle")}</h2>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">
                {t(locale, "smoke.statsRFQs")}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {formatNumber(locale, 18)}
              </div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">
                {t(locale, "smoke.statsOffers")}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {formatNumber(locale, 27)}
              </div>
            </div>
            <div className="rounded-md bg-muted p-3 text-center">
              <div className="text-xs text-muted-foreground">
                {t(locale, "smoke.statsJobs")}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {formatNumber(locale, 9)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-4">
          <h2 className="font-medium">{t(locale, "smoke.kvTitle")}</h2>
          <div className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">
                {t(locale, "smoke.kvClient")}
              </span>
              <span className="font-medium">
                {t(locale, "smoke.kvClientValue")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">
                {t(locale, "smoke.kvProject")}
              </span>
              <span className="font-medium">
                {t(locale, "smoke.kvProjectValue")}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">
                {t(locale, "smoke.kvStatus")}
              </span>
              <span className="font-medium">
                {t(locale, "smoke.kvStatusValue")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
