import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

export type Locale = "en" | "ar";

type Messages = Record<string, string>;

const dictionaries: Record<Locale, Messages> = {
  en,
  ar,
};

export function getMessages(locale: Locale) {
  return dictionaries[locale];
}

type InterpolationValues = Record<string, string | number>;

export function t(locale: Locale, key: string, params?: InterpolationValues) {
  const messages = getMessages(locale);
  const value = messages[key];

  if (value === undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Missing key "${key}" for locale "${locale}"`);
    }
    return key;
  }

  if (!params) return value;

  let rendered = value;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    const safeKey = paramKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const singleBrace = new RegExp(`{\\s*${safeKey}\\s*}`, "g");
    const doubleBrace = new RegExp(`{{\\s*${safeKey}\\s*}}`, "g");
    const replacement = String(paramValue);
    rendered = rendered.replace(doubleBrace, replacement).replace(singleBrace, replacement);
  }

  return rendered;
}
