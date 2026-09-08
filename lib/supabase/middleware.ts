import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";

function isStaticRoute(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|js|css|map)$/i.test(
    pathname
  );
}

function pathEq(a: string, b: string) {
  const clean = (s: string) => (s.endsWith("/") ? s.slice(0, -1) : s) || "/";
  return clean(a) === clean(b);
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticRoute(pathname)) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // 1) Build the base response object. Supabase cookies are written onto
  //    response.cookies, NEVER onto request.cookies.
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  let user: { id: string; email?: string } | null = null;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              response.cookies.set({ name, value, ...options });
            } catch {
              /* noop */
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              response.cookies.set({ name, value: "", ...options });
            } catch {
              /* noop */
            }
          },
        },
      }
    );
    const res = await supabase.auth.getUser();
    user = res.data?.user ?? null;
  } catch {
    user = null;
  }

  // 2) Routing guard — single source of truth.
  //    We keep redirect INSIDE middleware to avoid the old pattern where
  //    layout.tsx + every page.tsx also called redirect() which stacked 307s.
  const isAdmin = pathname.startsWith(ADMIN_PREFIX);
  const isLogin = pathEq(pathname, LOGIN_PATH);

  if (isAdmin && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    if (pathname !== LOGIN_PATH) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url, { status: 303 });
  }

  if (isLogin && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const safeNext =
      nextParam &&
      nextParam.startsWith("/") &&
      !nextParam.startsWith("//") &&
      !pathEq(nextParam, LOGIN_PATH)
        ? nextParam
        : "/admin";
    const url = request.nextUrl.clone();
    url.pathname = safeNext;
    url.searchParams.delete("next");
    return NextResponse.redirect(url, { status: 303 });
  }

  return response;
}
