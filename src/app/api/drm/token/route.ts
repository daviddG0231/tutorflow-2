export const dynamic = "force-dynamic";
// ============================================================
// api/drm/token/route.ts — DRM License Token API
//
// POST /api/drm/token
// Generates a PallyCon DRM license token for a specific content.
//
// Auth: User must be logged in AND either:
//   - Be the teacher who owns the course containing the content
//   - Be an enrolled (APPROVED) student in that course
//
// Body: { contentId: string }
// Returns: { token, siteId, licenseUrl }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePallyConToken } from "@/lib/pallycon";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check — must be logged in
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: "contentId is required" },
        { status: 400 }
      );
    }

    // 3. Find the content and its course
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { course: true },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // 4. Authorization — must be course owner or enrolled student
    const isOwner = content.course.teacherId === session.user.id;
    if (!isOwner) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          courseId: content.courseId,
          studentId: session.user.id,
          status: "APPROVED",
        },
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // 5. Generate PallyCon token
    const token = generatePallyConToken({
      userId: session.user.id,
      contentId: contentId,
    });

    const siteId = process.env.PALLYCON_SITE_ID || "W3EK";

    return NextResponse.json({
      token,
      siteId,
      licenseUrl:
        "https://license-global.pallycon.com/ri/licenseManager.do",
    });
  } catch (error) {
    console.error("POST /api/drm/token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
