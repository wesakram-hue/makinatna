import { cookies, headers } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";

type CookiePair = { name: string; value: string };

function parseCookieHeader(cookieHeader: string | null): CookiePair[] {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((kv) => {
      const idx = kv.indexOf("=");
      if (idx === -1) return { name: kv, value: "" };
      return { name: kv.slice(0, idx).trim(), value: kv.slice(idx + 1).trim() };
    });
}

function setCookieSafe(cookieStore: any, name: string, value: string, options?: any) {
  try {
    cookieStore.set(name, value, options);
    return;
  } catch {}
  try {
    cookieStore.set({ name, value, ...options });
  } catch {}
}

export async function createServerClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie");

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all =
            cookieStore && typeof cookieStore.getAll === "function" ? cookieStore.getAll() : null;

          if (Array.isArray(all) && all.length) {
            return all.map((c: any) => ({ name: c.name, value: c.value }));
          }

          return parseCookieHeader(cookieHeader);
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              setCookieSafe(cookieStore, name, value, options);
            });
          } catch {
            // ignore (Server Components are read-only)
          }
        },
      },
    }
  );
}
