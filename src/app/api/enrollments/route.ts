// ============================================================
// api/enrollments/route.ts — List student's enrollments
//
// GET: Returns all enrollments for the logged-in student
//      with course info and teacher name
// ============================================================

import { NextResponse } from "next/server";

// Force dynamic rendering for routes using session/headers
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can view enrollments" }, { status: 403 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const approvedCount = enrollments.filter((e) => e.status === "APPROVED").length;
    const pendingCount = enrollments.filter((e) => e.status === "PENDING").length;

    return NextResponse.json({
      enrollments: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        course: {
          id: e.course.id,
          name: e.course.name,
          location: e.course.location,
          teacherName: e.course.teacher.name,
        },
      })),
      stats: {
        enrolledCourses: approvedCount,
        pendingEnrollments: pendingCount,
      },
    });
  } catch (error) {
    console.error("GET /api/enrollments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
