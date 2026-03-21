export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: "APPROVED" },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { student: { name: "asc" } },
    });

    const students = enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("GET /api/courses/[courseId]/students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
