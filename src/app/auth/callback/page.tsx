"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/en";
    const code = sp.get("code");

    // If Supabase is using PKCE, you'll get ?code=...
    if (code) {
      window.location.href =
        `/auth/exchange?code=${encodeURIComponent(code)}` +
        `&next=${encodeURIComponent(next)}`;
      return;
    }

    const hash = window.location.hash || "";
    if (hash.startsWith("#")) {
      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const type = params.get("type"); // "recovery" for password resets

      // If this is a password recovery link, go straight to reset-password UI
      const resetNext =
        type === "recovery"
          ? next.startsWith("/ar")
            ? "/ar/reset-password"
            : "/en/reset-password"
          : next;

      if (access_token && refresh_token) {
        fetch("/auth/set-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        })
          .then(() => router.replace(resetNext))
          .catch(() => router.replace(resetNext));
        return;
      }
    }

    // Nothing to process, just go where we intended
    router.replace(next);
  }, [router, sp]);

  return null;
}
