// ============================================================
// api/auth/[...nextauth]/route.ts — NextAuth API handler
//
// This catches all auth-related requests:
// - POST /api/auth/signin  → login
// - POST /api/auth/signout → logout
// - GET  /api/auth/session → get current session
//
// The [...nextauth] is a "catch-all" route in Next.js
// ============================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Export for both GET and POST requests
export { handler as GET, handler as POST };
