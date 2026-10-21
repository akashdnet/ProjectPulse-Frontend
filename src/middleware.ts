import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface DecodedJwt {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Safely decodes JWT payload in Edge runtime without external dependencies
 */
function decodeJwt(token: string): DecodedJwt | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/submit");

  // If user has token, decode and validate expiration
  const decoded = token ? decodeJwt(token) : null;
  const isTokenExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;
  const isValidAuth = !!decoded && !isTokenExpired;
  const role = (decoded?.role || "").toUpperCase();

  // 1. Unauthenticated user trying to access protected routes
  if (isProtectedRoute && !isValidAuth) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // If token exists but was expired, clean it up
    if (token) {
      response.cookies.delete("accessToken");
    }
    return response;
  }

  // 2. Authenticated user trying to access auth pages (/login, /signup)
  if (isAuthRoute && isValidAuth) {
    if (role === "STUDENT") {
      return NextResponse.redirect(new URL("/submit", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Role-Based Route Protection
  if (isValidAuth) {
    // Student trying to access mentor dashboard -> redirect to /submit
    if (role === "STUDENT" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/submit", request.url));
    }

    // Mentor trying to access student submit page -> redirect to /dashboard
    if (role === "MENTOR" && pathname.startsWith("/submit")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/submit/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
  ],
};
