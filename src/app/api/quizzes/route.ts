export const dynamic = "force-dynamic";
// ============================================================
// api/quizzes/route.ts — Quiz/Exam CRUD
//
// POST: Create quiz (teacher only, must own course)
// GET:  List quizzes for a course (teacher or enrolled student)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyEnrolledStudents } from "@/lib/notifications";

const createQuizSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  groupId: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required"),
  totalMarks: z.number().int().positive("Total marks must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create quizzes" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { courseId, groupId, name, totalMarks } = parsed.data;

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    // Enrolled students: all if no group, else only students in that group
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: "APPROVED",
        ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
      },
      select: { studentId: true },
    });

    // Create quiz (optional groupId) + grade rows for those students
    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
        name,
        totalMarks,
        grades: {
          create: enrollments.map((e) => ({
            studentId: e.studentId,
            marks: 0,
          })),
        },
      },
      include: { grades: true },
    });

    // Notify enrolled students
    await notifyEnrolledStudents(
      courseId,
      `New quiz in ${course.name}: ${name} — Total marks: ${totalMarks}`
    );

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = req.nextUrl.searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check access
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isOwner = course.teacherId === session.user.id;
    let enrollment: { groupId: string | null } | null = null;
    if (!isOwner) {
      enrollment = await prisma.enrollment.findFirst({
        where: { courseId, studentId: session.user.id, status: "APPROVED" },
        select: { groupId: true },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // For students: also include quizzes they already have grades for (from previous group)
    let gradedQuizIds: string[] = [];
    if (!isOwner) {
      const existingGrades = await prisma.quizGrade.findMany({
        where: { studentId: session.user.id, quiz: { courseId } },
        select: { quizId: true },
      });
      gradedQuizIds = existingGrades.map((g) => g.quizId);
    }

    // Teacher: all. Student: course-wide + their group + any they already have grades for
    let quizzes = await prisma.quiz.findMany({
      where: {
        courseId,
        ...(isOwner
          ? {}
          : {
              OR: [
                { groupId: null },
                ...(enrollment?.groupId ? [{ groupId: enrollment.groupId }] : []),
                ...(gradedQuizIds.length > 0
                  ? [{ id: { in: gradedQuizIds } }]
                  : []),
              ],
            }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        grades: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          ...(isOwner ? {} : { where: { studentId: session.user.id } }),
        },
      },
    });

    // Auto-create missing grade rows for late-joining students (respect group for group-scoped quizzes)
    if (isOwner && quizzes.length > 0) {
      let needsRefetch = false;
      for (const quiz of quizzes) {
        const enrollments = await prisma.enrollment.findMany({
          where: {
            courseId,
            status: "APPROVED",
            ...(quiz.groupId ? { groupId: quiz.groupId } : {}),
          },
          select: { studentId: true },
        });
        const existingStudentIds = new Set(quiz.grades.map((g) => g.studentId));
        const missing = enrollments.filter((e) => !existingStudentIds.has(e.studentId));

        if (missing.length > 0) {
          await prisma.quizGrade.createMany({
            data: missing.map((e) => ({
              quizId: quiz.id,
              studentId: e.studentId,
              marks: 0,
            })),
            skipDuplicates: true,
          });
          needsRefetch = true;
        }
      }

      if (needsRefetch) {
        quizzes = await prisma.quiz.findMany({
          where: { courseId },
          orderBy: { createdAt: "desc" },
          include: {
            grades: {
              include: {
                student: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("GET /api/quizzes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
