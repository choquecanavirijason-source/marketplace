import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const proxy = (request: NextRequest) => {
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
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  let isAdmin = false;
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const role = (user?.role || user?.roleName || user?.type || "").toLowerCase();
      const userRoles = Array.isArray(user?.roles)
        ? user.roles.map((r: any) => String(r).toLowerCase())
        : [];
      isAdmin =
        role === "admin" ||
        role === "superadmin" ||
        role === "support" ||
        role === "staff" ||
        userRoles.includes("admin") ||
        userRoles.includes("superadmin");
    } catch {
      isAdmin = false;
    }
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/account/dashboard", request.url)
    );
  }

  if (isAdminRoute && userCookie && !isAdmin) {
    return NextResponse.redirect(new URL("/account/dashboard", request.url));
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

export default proxy;
