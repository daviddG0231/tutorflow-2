export const dynamic = "force-dynamic";
// ============================================================
// api/courses/join/route.ts — Student joins a course
//
// POST: Student submits a courseCode to create a PENDING enrollment
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const joinCourseSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can join courses" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = joinCourseSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Find course by code
    const course = await prisma.course.findUnique({
      where: { courseCode: parsed.data.courseCode },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found. Check the code and try again." }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });
    if (existing) {
      const statusMsg = existing.status === "PENDING"
        ? "You already have a pending request for this course"
        : existing.status === "APPROVED"
        ? "You are already enrolled in this course"
        : "Your enrollment was previously rejected";
      return NextResponse.json({ error: statusMsg }, { status: 409 });
    }

    // Create pending enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId: course.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/join error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
