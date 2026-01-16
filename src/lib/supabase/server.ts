import { cookies } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";

type CookiePair = { name: string; value: string };

export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            const all = cookieStore.getAll?.() ?? [];
            return (all as CookiePair[]).map((c) => ({ name: c.name, value: c.value }));
          } catch {
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore in Server Components (read-only)
          }
        },
      },
    }
  );
}
