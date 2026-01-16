"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeNext(raw: string | null, fallback: string) {
  if (!raw) return fallback;

  // Only allow internal relative paths like "/en/..." or "/ar/..."
  // Block "//", "http:", "https:", and other weirdness.
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;

  return raw;
}

export default function CallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const next = safeNext(sp.get("next"), "/en");
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
          credentials: "same-origin",
        })
          .then(() => router.replace(resetNext))
          .catch(() => router.replace(resetNext));
        return;
      }
    }

    router.replace(next);
  }, [router, sp]);

  return null;
}
