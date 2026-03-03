export const dynamic = "force-dynamic";
// ============================================================
// api/submissions/[submissionId]/route.ts — Grade a submission
//
// PATCH: Teacher grades a student's submission.
//        Sets grade, feedback, gradedAt. Notifies student.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const gradeSchema = z.object({
  grade: z.number().int().min(0, "Grade must be >= 0"),
  feedback: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can grade submissions" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = gradeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { grade, feedback } = parsed.data;
    const { submissionId } = params;

    // Get submission with assignment and course info
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: { select: { teacherId: true, name: true } },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Verify teacher owns the course
    if (submission.assignment.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    // Validate grade doesn't exceed total marks
    if (grade > submission.assignment.totalMarks) {
      return NextResponse.json(
        { error: `Grade cannot exceed total marks (${submission.assignment.totalMarks})` },
        { status: 400 }
      );
    }

    // Update submission with grade
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        gradedAt: new Date(),
      },
    });

    // Notify the student
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        courseId: submission.assignment.courseId,
        message: `Your assignment '${submission.assignment.title}' has been graded: ${grade}/${submission.assignment.totalMarks}`,
        read: false,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/submissions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
