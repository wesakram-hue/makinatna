import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  if (p.includes("/supplier/listings")) {
    console.log("[middleware] listings hit", {
      method: req.method,
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      referer: req.headers.get("referer"),
    });
  }

  if (req.method === "GET" && p.includes("/supplier/listings/undefined")) {
    const locale = p.startsWith("/ar/") ? "ar" : "en";

    console.log("[MW] caught undefined listing id", {
      href: req.nextUrl.href,
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      referer: req.headers.get("referer"),
      method: req.method,
    });

    return NextResponse.redirect(new URL(`/${locale}/supplier/listings?err=bad_id&src=middleware`, req.url));
  }

  const pathname = req.nextUrl.pathname;

  const match = pathname.match(/^\/(en|ar)\/supplier\/listings\/([^\/?#]+)(?:\/|$)/);

  if (!match) {
    let res = NextResponse.next({
      request: { headers: req.headers },
    });

    const isProd = process.env.NODE_ENV === "production";

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, { ...options, secure: isProd });
            });
          },
        },
      }
    );

    await supabase.auth.getUser();

    return res;
  }

  const locale = match[1] as "en" | "ar";
  const seg = match[2];

  if (seg === "new") {
    let res = NextResponse.next({
      request: { headers: req.headers },
    });

    const isProd = process.env.NODE_ENV === "production";

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, { ...options, secure: isProd });
            });
          },
        },
      }
    );

    await supabase.auth.getUser();

    return res;
  }

  const isBad = seg === "undefined" || seg === "null" || !isUuid(seg);

  if (isBad) {
    console.log("[middleware] bad listing id segment", {
      pathname,
      seg,
      referer: req.headers.get("referer"),
      ua: req.headers.get("user-agent"),
    });

    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/supplier/listings`;
    url.searchParams.set("err", "bad_id");
    url.searchParams.set("src", "mw");
    return NextResponse.redirect(url);
  }

  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  const isProd = process.env.NODE_ENV === "production";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, { ...options, secure: isProd });
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ["/en/:path*", "/ar/:path*"],
};
