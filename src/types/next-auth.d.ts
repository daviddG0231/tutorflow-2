// ============================================================
// types/next-auth.d.ts — Extend NextAuth types
//
// NextAuth doesn't know about our custom fields (id, role)
// by default. This file tells TypeScript they exist.
// ============================================================

import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      image?: string;
    };
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
