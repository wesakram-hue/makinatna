import ar from "@/messages/ar.json";
import en from "@/messages/en.json";

export type Locale = "en" | "ar";

const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  ar,
};

export function getMessages(locale: Locale) {
  return dictionaries[locale];
}

export function t(locale: Locale, key: string) {
  const messages = getMessages(locale);
  const value = messages[key];

  if (value === undefined) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Missing key "${key}" for locale "${locale}"`);
    }
    return key;
  }

  return value;
}
