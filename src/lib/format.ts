import type { Locale } from "@/lib/i18n";

export type Numerals = "latn" | "arab";

function localeTag(locale: Locale, numerals: Numerals): string {
  if (locale === "ar") {
    return numerals === "arab" ? "ar-SA-u-nu-arab" : "ar-SA-u-nu-latn";
  }
  return "en-GB";
}

export function formatNumber(
  locale: Locale,
  value: number,
  opts?: Intl.NumberFormatOptions & { numerals?: Numerals }
): string {
  const { numerals = "latn", ...nfOpts } = opts ?? {};
  return new Intl.NumberFormat(localeTag(locale, numerals), nfOpts).format(value);
}

export function formatCurrency(
  locale: Locale,
  value: number,
  currency?: string,
  opts?: Intl.NumberFormatOptions & { numerals?: Numerals }
): string {
  const { numerals = "latn", ...nfOpts } = opts ?? {};
  const currencyCode = currency ?? "SAR";

  return new Intl.NumberFormat(
    localeTag(locale, numerals),
    {
      style: "currency",
      currency: currencyCode,
      ...nfOpts,
    }
  ).format(value);
}
