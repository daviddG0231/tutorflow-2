export const dynamic = "force-dynamic";
// ============================================================
// api/submissions/route.ts — Student submits work
//
// POST: Upload file to Cloudinary and create submission record.
//       Auth: STUDENT + enrolled (APPROVED). Checks deadline & duplicates.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit work" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const assignmentId = formData.get("assignmentId") as string | null;

    if (!file || !assignmentId) {
      return NextResponse.json({ error: "file and assignmentId are required" }, { status: 400 });
    }

    // Get assignment with course info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: { select: { id: true, name: true } } },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check student is enrolled (APPROVED) in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        studentId: session.user.id,
        status: "APPROVED",
      },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Check deadline
    if (new Date() > assignment.deadline) {
      return NextResponse.json({ error: "Deadline has passed" }, { status: 400 });
    }

    // Check for duplicate submission
    const existing = await prisma.submission.findFirst({
      where: { assignmentId, studentId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 400 });
    }

    // Upload file to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: `tutorflow/${assignment.courseId}/submissions`,
          public_id: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`,
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Upload failed"));
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        fileUrl: result.secure_url,
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
