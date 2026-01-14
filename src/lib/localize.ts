import type { Locale } from "@/lib/i18n";

export function cleanText(value?: string | null): string {
  if (value == null) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length ? normalized : "";
}

export function localizeText(locale: Locale, en?: string | null, ar?: string | null): string {
  const e = cleanText(en);
  const a = cleanText(ar);

  if (locale === "ar") {
    return a || e;
  }

  return e || a;
}

export function isFallback(locale: Locale, en?: string | null, ar?: string | null): boolean {
  const e = cleanText(en);
  const a = cleanText(ar);

  if (locale === "ar") {
    return !a && !!e;
  }

  return !e && !!a;
}
