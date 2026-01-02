import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // 1. Get Session
  // Note: We use the Edge-compatible way to check session if possible, 
  // but since we are using next-auth v5 beta, strict auth() calls might need wrapping.
  // For middleware, we often check the session cookie presence for speed, 
  // or use the auth() helper if edge compatible.

  // Checking for session token cookie is a fast way to detect "logged in" state
  // without calling database (which middleware on Edge often can't do easily).
  const sessionToken = request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isPublicPage = request.nextUrl.pathname.startsWith("/welcome") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/api/public") ||
    request.nextUrl.pathname.startsWith("/api/auth");

  // PROTECTED ROUTES regex
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/teacher") ||
    request.nextUrl.pathname.startsWith("/student") ||
    request.nextUrl.pathname.startsWith("/homeroom") ||
    request.nextUrl.pathname.startsWith("/principal") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/profile");

  // 2. Redirect Logic

  // If user is trying to access a protected route and has NO session cookie
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is ALREADY logged in and tries to access Login page, redirect to Dashboard
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configure paths to match
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - api/public (public apis)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - welcome
     */
    "/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|welcome|forgot-password|reset-student).*)",
  ],
};
