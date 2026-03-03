// ============================================================
// api/content/route.ts — Content list for a course
//
// GET: List content for a course (teacher who owns OR enrolled student)
// ============================================================

import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for routes using session/headers
export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Teacher: all content. Student: course-wide (groupId null) + content for their group only
    const contents = await prisma.content.findMany({
      where: {
        courseId,
        ...(isOwner
          ? {}
          : {
              OR: enrollment?.groupId
                ? [{ groupId: null }, { groupId: enrollment?.groupId }]
                : [{ groupId: null }],
            }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contents, count: contents.length });
  } catch (error) {
    console.error("GET /api/content error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
