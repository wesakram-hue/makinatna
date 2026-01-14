"use client";

import { useEffect } from "react";

export default function AuthHashBridge({ locale }: { locale: "en" | "ar" }) {
  useEffect(() => {
    // 1) PKCE-style recovery comes as ?code=...
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get("code");

    if (code) {
      const next = `/${locale}/update-password`;
      const to = `/auth/exchange?code=${encodeURIComponent(code)}&locale=${locale}&next=${encodeURIComponent(
        next
      )}`;

      // Use a hard navigation so the Route Handler can set cookies
      window.location.replace(to);
      return;
    }

    // 2) Implicit-style recovery comes as #access_token=...&type=recovery
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const hp = new URLSearchParams(hash.slice(1));
    const access_token = hp.get("access_token");
    const refresh_token = hp.get("refresh_token");
    const hashType = hp.get("type");

    if (!access_token || !refresh_token) return;

    (async () => {
      const res = await fetch("/api/auth/hash", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ access_token, refresh_token }),
      });

      if (!res.ok) return;

      // clear hash
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      // route based on recovery vs normal
      if (hashType === "recovery") {
        window.location.replace(`/${locale}/update-password`);
      } else {
        window.location.replace(`/${locale}/supplier`);
      }
    })();
  }, [locale]);

  return null;
}
