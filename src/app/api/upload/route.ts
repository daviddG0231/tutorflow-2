export const dynamic = "force-dynamic";
export const maxDuration = 30;
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

// Use 'auto' for all uploads — Cloudinary detects the type
function getResourceType(): "auto" {
  return "auto";
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
    const moduleId = (formData.get("moduleId") as string) || null;

    // Validate required fields (file not required for NOTE type)
    if (!courseId || !title || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, title, fileType" },
        { status: 400 }
      );
    }
    if (fileType !== "NOTE" && !file) {
      return NextResponse.json(
        { error: "File is required for non-note content" },
        { status: 400 }
      );
    }

    const validTypes = ["VIDEO", "PDF", "SLIDE", "IMAGE", "DOCUMENT", "NOTE"];
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

    // Handle NOTE type (text content, no file needed)
    if (fileType === "NOTE") {
      const textContent = (formData.get("textContent") as string) || "";
      const content = await prisma.content.create({
        data: {
          courseId,
          ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
          ...(moduleId && moduleId.trim() ? { moduleId: moduleId.trim() } : {}),
          title,
          description,
          textContent,
          fileType: "NOTE",
        },
      });
      await notifyEnrolledStudents(courseId, `New note in ${course.name}: ${title}`);
      return NextResponse.json(content, { status: 201 });
    }

    // Handle VIDEO URL (e.g. YouTube link, no file upload needed)
    const videoUrl = (formData.get("videoUrl") as string) || null;
    if (fileType === "VIDEO" && videoUrl && !file) {
      const content = await prisma.content.create({
        data: {
          courseId,
          ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
          ...(moduleId && moduleId.trim() ? { moduleId: moduleId.trim() } : {}),
          title,
          description,
          fileUrl: videoUrl,
          fileType: "VIDEO",
        },
      });
      await notifyEnrolledStudents(courseId, `New video in ${course.name}: ${title}`);
      return NextResponse.json(content, { status: 201 });
    }

    // Convert File to buffer for Cloudinary upload
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const resourceType = getResourceType();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: `tutorflow/${courseId}`,
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error || !result) {
            const errMsg = error?.message || error?.http_code || JSON.stringify(error);
            reject(new Error(`Cloudinary: ${errMsg}`));
          }
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Create content record in database (optional groupId & moduleId)
    let content;
    try {
      content = await prisma.content.create({
        data: {
          courseId,
          ...(groupId && groupId.trim() ? { groupId: groupId.trim() } : {}),
          ...(moduleId && moduleId.trim() ? { moduleId: moduleId.trim() } : {}),
          title,
          description,
          fileUrl: result.secure_url,
          fileType: fileType as "VIDEO" | "PDF" | "SLIDE" | "IMAGE" | "DOCUMENT",
        },
      });
    } catch (dbErr: unknown) {
      console.error("DB create error:", dbErr);
      const dbMsg = dbErr instanceof Error ? dbErr.message : JSON.stringify(dbErr);
      return NextResponse.json({ error: `DB error: ${dbMsg}` }, { status: 500 });
    }

    // Notify (don't fail the upload if notifications fail)
    try {
      await notifyEnrolledStudents(
        courseId,
        `New ${fileType} uploaded in ${course.name}: ${title}`
      );
    } catch (notifErr) {
      console.error("Notification error (non-fatal):", notifErr);
    }

    return NextResponse.json(content, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/upload error:", error);
    let msg = "Unknown error";
    if (error instanceof Error) {
      msg = error.message;
    } else if (error && typeof error === "object") {
      try { msg = JSON.stringify(error); } catch { msg = String(error); }
    } else {
      msg = String(error);
    }
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}
