// ============================================================
// api/assignments/[assignmentId]/route.ts — Single assignment
//
// GET:    Get assignment details (teacher sees all submissions, student sees own)
// DELETE: Delete assignment (teacher only, must own course)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId } = params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: { select: { id: true, name: true, teacherId: true } },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check access
    const isOwner = assignment.course.teacherId === session.user.id;
    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: assignment.courseId, studentId: session.user.id, status: "APPROVED" },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      // Student only sees their own submission
      assignment.submissions = assignment.submissions.filter(
        (s) => s.studentId === session.user.id
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("GET /api/assignments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can delete assignments" }, { status: 403 });
    }

    const { assignmentId } = params;

    // Find assignment and verify ownership
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: { select: { teacherId: true } } },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
    if (assignment.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    await prisma.assignment.delete({ where: { id: assignmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/assignments/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
