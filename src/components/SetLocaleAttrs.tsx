"use client";

import { useEffect } from "react";

type Locale = "en" | "ar";

export default function SetLocaleAttrs({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
