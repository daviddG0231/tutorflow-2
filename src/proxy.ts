// ============================================================
// proxy.ts — Route Protection (Next.js 16+ Proxy API)
//
// This runs BEFORE every request. It checks:
// 1. Is the user logged in?
// 2. Do they have the right role for this page?
//
// Protected routes:
// - /teacher/* → only TEACHER role
// - /student/* → only STUDENT role
// - /login, /register → redirect to dashboard if already logged in
// ============================================================

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // Get the JWT token (null if not logged in)
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // ─── Already logged in? Redirect away from auth pages ────
  if (token && (pathname === "/login" || pathname === "/register")) {
    const dashboardUrl = token.role === "TEACHER" ? "/teacher" : "/student";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // ─── Teacher routes — require TEACHER role ───────────────
  if (pathname.startsWith("/teacher")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/student", req.url));
    }
  }

  // ─── Student routes — require STUDENT role ───────────────
  if (pathname.startsWith("/student")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
  }

  return NextResponse.next();
}

// Only run proxy on these paths (skip API, static files, etc.)
export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/login", "/register"],
};