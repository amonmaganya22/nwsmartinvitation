import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/auth";
import { verifyCsrf } from "./lib/csrf";

const PROTECTED_PAGE_PREFIXES = ["/dashboard", "/scanner"];
const MUTATING_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
// Auth endpoints issue the CSRF cookie themselves and can't be expected to already have it.
const CSRF_EXEMPT_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/forgot-password", "/api/auth/reset-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Page-level auth guard
  if (PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get("nwsi_access")?.value;
    const session = token ? verifyAccessToken(token) : null;
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. CSRF guard on mutating API calls
  if (
    pathname.startsWith("/api/") &&
    MUTATING_METHODS.includes(req.method) &&
    !CSRF_EXEMPT_PATHS.includes(pathname)
  ) {
    const cookieToken = req.cookies.get("nwsi_csrf")?.value;
    const headerToken = req.headers.get("x-csrf-token") ?? undefined;
    if (!verifyCsrf(cookieToken, headerToken)) {
      return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/scanner/:path*", "/api/:path*"]
};
