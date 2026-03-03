export const dynamic = "force-dynamic";
// ============================================================
// api/quizzes/[quizId]/grades/route.ts — Batch grade update
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchGradeSchema = z.object({
  grades: z.array(
    z.object({
      studentId: z.string().min(1),
      marks: z.number().int().min(0),
    })
  ).min(1, "At least one grade required"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can grade quizzes" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = batchGradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: { select: { teacherId: true, name: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    if (quiz.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    // Validate marks <= totalMarks
    for (const g of parsed.data.grades) {
      if (g.marks > quiz.totalMarks) {
        return NextResponse.json(
          { error: `Marks for student ${g.studentId} exceed total marks (${quiz.totalMarks})` },
          { status: 400 }
        );
      }
    }

    // Batch upsert all grades (supports late-joining students)
    const updates = parsed.data.grades.map((g) =>
      prisma.quizGrade.upsert({
        where: {
          quizId_studentId: {
            quizId: quizId,
            studentId: g.studentId,
          },
        },
        update: { marks: g.marks, gradedAt: new Date() },
        create: {
          quizId: quizId,
          studentId: g.studentId,
          marks: g.marks,
          gradedAt: new Date(),
        },
      })
    );

    await prisma.$transaction(updates);

    // Notify each student who got graded with marks > 0
    const notifications = parsed.data.grades
      .filter((g) => g.marks > 0)
      .map((g) =>
        prisma.notification.create({
          data: {
            userId: g.studentId,
            courseId: quiz.courseId,
            message: `Quiz '${quiz.name}' graded: ${g.marks}/${quiz.totalMarks}`,
            read: false,
          },
        })
      );

    if (notifications.length > 0) {
      await prisma.$transaction(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/quizzes/[quizId]/grades error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
