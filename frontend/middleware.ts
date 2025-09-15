import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  console.log("Middleware called for:", req.nextUrl.pathname);
  const token = req.cookies.get("token")?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}


// Only run middleware on protected routes
export const config = {
  matcher: "/:path*",
};
