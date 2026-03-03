// ============================================================
// api/courses/route.ts — Course CRUD (list + create)
//
// POST: Create a new course (TEACHER only, auto-generates courseCode)
// GET: List the teacher's courses with student/assignment counts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCourseSchema } from "@/lib/validations";

// Generate a unique 6-character alphanumeric course code
function generateCourseCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── POST: Create a course ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create courses" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Generate unique course code (retry if collision)
    let courseCode = generateCourseCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.course.findUnique({ where: { courseCode } });
      if (!existing) break;
      courseCode = generateCourseCode();
      attempts++;
    }

    const course = await prisma.course.create({
      data: {
        teacherId: session.user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        location: parsed.data.location,
        courseCode,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET: List teacher's courses ───────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can list courses" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: {
            enrollments: { where: { status: "APPROVED" } },
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also compute aggregate stats
    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalAssignments = courses.reduce((sum, c) => sum + c._count.assignments, 0);
    const pendingEnrollments = await prisma.enrollment.count({
      where: {
        course: { teacherId: session.user.id },
        status: "PENDING",
      },
    });

    return NextResponse.json({
      courses: courses.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        location: c.location,
        courseCode: c.courseCode,
        createdAt: c.createdAt,
        studentCount: c._count.enrollments,
        assignmentCount: c._count.assignments,
      })),
      stats: {
        courseCount: courses.length,
        totalStudents,
        totalAssignments,
        pendingEnrollments,
      },
    });
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
