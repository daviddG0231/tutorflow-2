// ============================================================
// lib/auth.ts — NextAuth configuration
//
// This is the brain of our authentication system.
// It handles:
// - Login with email/password (credentials provider)
// - JWT token creation and session management
// - Role-based access (TEACHER vs STUDENT)
//
// HOW IT WORKS:
// 1. User submits email + password
// 2. We check the DB for the user and verify the password
// 3. If valid, NextAuth creates a JWT with user info
// 4. Every request includes this JWT so we know who's logged in
// ============================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // ─── Session Strategy ────────────────────────────────────
  // JWT = token-based (no server-side sessions needed)
  // The token lives in the browser cookie
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // ─── Custom Pages ────────────────────────────────────────
  // Override default NextAuth pages with our own
  pages: {
    signIn: "/login",
  },

  // ─── Providers ───────────────────────────────────────────
  // Credentials = email + password login
  // You could add Google, GitHub etc. later
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // This function runs when a user tries to log in
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        // Verify password (compare plain text with hash)
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Return user data (this gets encoded in the JWT)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // ─── Callbacks ───────────────────────────────────────────
  // These customize what data goes into the JWT and session
  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user }) {
      // On first login, add user data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Called whenever session is checked (e.g., useSession())
    async session({ session, token }) {
      // Make user ID and role available in the session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
