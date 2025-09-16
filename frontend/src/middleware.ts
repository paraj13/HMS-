// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/meals") ||
    pathname.startsWith("/voice-chat")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL("/signin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, allow access
  return NextResponse.next();
}

// Paths this middleware applies to
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", // protect all routes except API/static
  ],
};
