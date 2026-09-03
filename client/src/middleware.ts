import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const middleware = (request: NextRequest) => {
  const token = request.cookies.get("ferromax-token")?.value;
  const userCookie = request.cookies.get("ferromax-user")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/account/login") ||
    pathname.startsWith("/account/register") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  const isProtectedRoute =
    pathname.startsWith("/account/dashboard") ||
    pathname.startsWith("/account/profile") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/checkout");

  const isAdminRoute = pathname.startsWith("/admin");

  if (!token && (isProtectedRoute || isAdminRoute)) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/account/dashboard", request.url));
  }

  if (isAdminRoute && userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const role = (user?.role || "").toLowerCase();
      const isAdmin = role === "admin" || role === "superadmin";

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/account/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/account/login", request.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};
