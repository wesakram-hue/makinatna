import { cookies } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";

type CookiePair = { name: string; value: string };

type CookieSetter =
  | ((name: string, value: string, options?: Record<string, unknown>) => void)
  | ((cookie: { name: string; value: string } & Record<string, unknown>) => void);

type CookieStore = {
  getAll?: () => CookiePair[];
  set?: CookieSetter;
};

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

function setCookieSafe(
  cookieStore: CookieStore,
  name: string,
  value: string,
  options?: Record<string, unknown>
) {
  const setter = cookieStore.set;
  if (!setter) return;

  try {
    (setter as (n: string, v: string, o?: Record<string, unknown>) => void)(name, value, options);
    return;
  } catch {}

  try {
    (setter as (cookie: { name: string; value: string } & Record<string, unknown>) => void)({
      name,
      value,
      ...(options ?? {}),
    });
  } catch {}
}

export async function createServerClient() {
  const cookieStore = cookies() as unknown as CookieStore;

  let cookieHeader: string | null = null;
  const getAll = (cookieStore as unknown as { getAll?: () => CookiePair[] }).getAll;

  if (typeof getAll === "function") {
    const all = getAll.call(cookieStore) as CookiePair[];
    cookieHeader = all.map((c) => `${c.name}=${c.value}`).join("; ");
  } else {
    cookieHeader = null;
  }

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all =
            cookieStore && typeof cookieStore.getAll === "function" ? cookieStore.getAll() : null;

          if (Array.isArray(all) && all.length) {
            return all.map((c) => ({ name: c.name, value: c.value }));
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
