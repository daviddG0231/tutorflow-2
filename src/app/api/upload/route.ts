// ============================================================
// api/upload/route.ts — File upload via Cloudinary
//
// POST: Accepts multipart form data, uploads to Cloudinary,
// creates a Content record, and notifies enrolled students.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { notifyEnrolledStudents } from "@/lib/notifications";

// Map file types to Cloudinary resource_type
function getResourceType(fileType: string): "video" | "image" | "raw" {
  switch (fileType) {
    case "VIDEO":
      return "video";
    case "IMAGE":
      return "image";
    default:
      return "raw"; // PDF, SLIDE, DOCUMENT
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can upload content" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const courseId = formData.get("courseId") as string | null;
    const title = formData.get("title") as string | null;
    const description = (formData.get("description") as string) || undefined;
    const fileType = formData.get("fileType") as string | null;
    const groupId = (formData.get("groupId") as string) || null;

    // Validate required fields
    if (!file || !courseId || !title || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: file, courseId, title, fileType" },
        { status: 400 }
      );
    }

    const validTypes = ["VIDEO", "PDF", "SLIDE", "IMAGE", "DOCUMENT"];
    if (!validTypes.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    // Convert File to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const resourceType = getResourceType(fileType);
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `tutorflow/${courseId}`,
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Create content record in database (optional groupId = for this group only)
    const content = await prisma.content.create({
      data: {
        courseId,
        ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
        title,
        description,
        fileUrl: result.secure_url,
        fileType: fileType as "VIDEO" | "PDF" | "SLIDE" | "IMAGE" | "DOCUMENT",
      },
    });

    // Notify all enrolled students
    await notifyEnrolledStudents(
      courseId,
      `New ${fileType} uploaded in ${course.name}: ${title}`
    );

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
