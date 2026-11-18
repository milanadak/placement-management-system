import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "campusconnect-placement-system-secret-key-2026-btech"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("campusconnect_session")?.value;

  let sessionUser: { id: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionUser = {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      sessionUser = null;
    }
  }

  // 1. Protecting student routes
  if (pathname.startsWith("/student")) {
    if (!sessionUser) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (sessionUser.role !== "STUDENT") {
      // Admin trying to access student pages, redirect to admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // 2. Protecting admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (sessionUser.role !== "ADMIN") {
      // Student trying to access admin pages, forbid
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // 3. Prevent logged-in users from seeing login/register
  if (sessionUser && (pathname === "/login" || pathname === "/register")) {
    if (sessionUser.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
