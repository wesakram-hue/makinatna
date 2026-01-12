"use client";

import { useLayoutEffect } from "react";

type Locale = "en" | "ar";

export default function SetLocaleAttrs({ locale }: { locale: Locale }) {
  useLayoutEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }

    const dir = locale === "ar" ? "rtl" : "ltr";
    if (document.documentElement.dir !== dir) {
      document.documentElement.dir = dir;
    }
  }, [locale]);

  return null;
}
