// ============================================================
// api/attendance/dates/route.ts — Get recorded attendance dates
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

    // Check access
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isOwner = course.teacherId === session.user.id;
    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: { courseId, studentId: session.user.id, status: "APPROVED" },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const dates = await prisma.attendance.findMany({
      where: { courseId },
      select: { date: true },
      distinct: ["date"],
      orderBy: { date: "desc" },
    });

    return NextResponse.json({
      dates: dates.map((d) => d.date.toISOString().split("T")[0]),
    });
  } catch (error) {
    console.error("GET /api/attendance/dates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
