// ============================================================
// api/assignments/route.ts — Assignment CRUD
//
// POST: Create assignment (teacher only, must own course)
// GET:  List assignments for a course (teacher or enrolled student)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyEnrolledStudents } from "@/lib/notifications";

// Zod schema for creating an assignment
const createAssignmentSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  groupId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
  deadline: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid deadline"),
  totalMarks: z.number().int().positive("Total marks must be positive"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can create assignments" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { courseId, groupId, title, description, attachmentUrl, deadline, totalMarks } = parsed.data;

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    // Create the assignment (optional groupId = for this group only)
    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
        title,
        description,
        attachmentUrl,
        deadline: new Date(deadline),
        totalMarks,
      },
    });

    // Notify enrolled students (only group members if group-specific)
    const deadlineStr = new Date(deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const assignmentGroupId = groupId && groupId.trim() ? groupId.trim() : null;
    await notifyEnrolledStudents(
      courseId,
      `New assignment in ${course.name}: ${title} — Due: ${deadlineStr}`,
      assignmentGroupId
    );

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
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

    // Check access: teacher who owns OR approved student
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { enrollments: { where: { status: "APPROVED" } } } },
      },
    });
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

    // For students: also find assignments they already submitted to (from previous group)
    let submittedAssignmentIds: string[] = [];
    if (!isOwner) {
      const existingSubmissions = await prisma.submission.findMany({
        where: { studentId: session.user.id, assignment: { courseId } },
        select: { assignmentId: true },
      });
      submittedAssignmentIds = existingSubmissions.map((s) => s.assignmentId);
    }

    // Teacher: all. Student: course-wide + their group + any they already submitted to
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
        ...(isOwner
          ? {}
          : {
              OR: [
                { groupId: null }, // course-wide assignments
                ...(enrollment?.groupId ? [{ groupId: enrollment.groupId }] : []),
                ...(submittedAssignmentIds.length > 0
                  ? [{ id: { in: submittedAssignmentIds } }]
                  : []),
              ],
            }),
      },
      orderBy: { deadline: "asc" },
      include: {
        _count: { select: { submissions: true } },
        // Include student's own submission if they're a student
        ...(isOwner
          ? {}
          : {
              submissions: {
                where: { studentId: session.user.id },
                select: {
                  id: true,
                  fileUrl: true,
                  submittedAt: true,
                  grade: true,
                  feedback: true,
                  gradedAt: true,
                },
              },
            }),
      },
    });

    // Add student count per assignment (group-aware)
    const result = await Promise.all(
      assignments.map(async (a) => {
        const studentCount = await prisma.enrollment.count({
          where: {
            courseId,
            status: "APPROVED",
            ...(a.groupId ? { groupId: a.groupId } : {}),
          },
        });
        return { ...a, totalStudents: studentCount };
      })
    );

    return NextResponse.json({ assignments: result });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
