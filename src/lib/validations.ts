// ============================================================
// lib/validations.ts — Zod validation schemas
//
// Zod lets us validate data on both client AND server.
// If someone submits a bad form or sends a bad API request,
// Zod catches it with clear error messages.
// ============================================================

import { z } from "zod";

// ─── Auth Validations ──────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["TEACHER", "STUDENT"], {
    message: "Please select a role",
  }),
});

// ─── Course Validations ────────────────────────────────────

export const createCourseSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  description: z.string().optional(),
  location: z.string().optional(),
});

// ─── Content Validations ───────────────────────────────────

export const createContentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().url("Please enter a valid URL"),
  fileType: z.enum(["VIDEO", "PDF", "SLIDE", "IMAGE", "DOCUMENT"], {
    message: "Invalid file type",
  }),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;

// Type inference — extract TS types from Zod schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
