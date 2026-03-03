export const dynamic = "force-dynamic";
// ============================================================
// api/enrollments/[enrollmentId]/route.ts — Approve/reject enrollment
//
// PATCH: Teacher approves or rejects a student's enrollment request
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateEnrollmentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]).optional(),
  groupId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can manage enrollments" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateEnrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!parsed.data.status && parsed.data.groupId === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    // Find enrollment and verify the teacher owns the course
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { teacherId: true } } },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    if (enrollment.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: { status?: "APPROVED" | "REJECTED"; groupId?: string | null } = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.groupId !== undefined) updateData.groupId = parsed.data.groupId;

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/enrollments/[enrollmentId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
