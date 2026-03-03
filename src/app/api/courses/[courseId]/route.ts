export const dynamic = "force-dynamic";
// ============================================================
// api/courses/[courseId]/route.ts — Single course operations
//
// GET: Course details with enrolled students
// PATCH: Update course (name, description, location)
// DELETE: Delete course (owner only)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateCourseSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

// ─── GET: Course details with students ─────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            group: { select: { id: true, name: true } },
          },
          orderBy: { enrolledAt: "desc" },
        },
        _count: { select: { assignments: true, quizzes: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isOwner = course.teacherId === session.user.id;
    const isEnrolled = course.enrollments.some(
      (e) => e.student.id === session.user.id && e.status === "APPROVED"
    );

    if (!isOwner && !isEnrolled) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      id: course.id,
      name: course.name,
      description: course.description,
      location: course.location,
      courseCode: course.courseCode,
      createdAt: course.createdAt,
      teacher: course.teacher,
      enrollments: isOwner
        ? course.enrollments.map((e) => ({
            id: e.id,
            status: e.status,
            enrolledAt: e.enrolledAt,
            student: e.student,
            group: e.group,
          }))
        : [], // Students don't need the full enrollment list
      _count: course._count,
    });
  } catch (error) {
    console.error("GET /api/courses/[courseId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH: Update course ──────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/courses/[courseId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Delete course ─────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    if (course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.course.delete({ where: { id: courseId } });
    return NextResponse.json({ message: "Course deleted" });
  } catch (error) {
    console.error("DELETE /api/courses/[courseId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
