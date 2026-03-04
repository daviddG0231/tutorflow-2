export const dynamic = "force-dynamic";
// ============================================================
// api/content/[contentId]/route.ts — Delete content
//
// DELETE: Remove content from DB + Cloudinary (teacher only)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

function extractPublicId(url: string): string | null {
  // Cloudinary URLs: https://res.cloudinary.com/<cloud>/[image|video|raw]/upload/v123/folder/file
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

function getResourceType(fileType: string): "video" | "image" | "raw" {
  switch (fileType) {
    case "VIDEO": return "video";
    case "IMAGE": return "image";
    default: return "raw";
  }
}

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

    // Delete from Cloudinary if it's a Cloudinary URL
    if (content.fileUrl && content.fileUrl.includes("cloudinary")) {
      const publicId = extractPublicId(content.fileUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: getResourceType(content.fileType),
          });
        } catch (err) {
          console.error("Cloudinary delete error (non-fatal):", err);
          // Continue with DB deletion even if Cloudinary fails
        }
      }
    }

    await prisma.content.delete({ where: { id: contentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/content/[contentId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
