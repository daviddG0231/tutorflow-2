// ============================================================
// api/quizzes/[quizId]/route.ts — Single quiz detail + delete
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: {
        course: { select: { teacherId: true, name: true } },
        grades: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const isOwner = quiz.course.teacherId === session.user.id;
    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: quiz.courseId, studentId: session.user.id, status: "APPROVED" },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      // Filter to only student's own grade
      quiz.grades = quiz.grades.filter((g) => g.studentId === session.user.id);
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("GET /api/quizzes/[quizId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can delete quizzes" }, { status: 403 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.quizId },
      include: { course: { select: { teacherId: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (quiz.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    await prisma.quiz.delete({ where: { id: params.quizId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/quizzes/[quizId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
