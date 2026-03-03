// ============================================================
// api/content/[contentId]/route.ts — Delete content
//
// DELETE: Remove content (teacher who owns the course only)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can delete content" }, { status: 403 });
    }

    const { contentId } = await params;

    // Find the content and verify ownership through course
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { course: { select: { teacherId: true } } },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    if (content.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not your course" }, { status: 403 });
    }

    await prisma.content.delete({ where: { id: contentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/content/[contentId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
