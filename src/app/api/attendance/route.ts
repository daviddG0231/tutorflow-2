export const dynamic = "force-dynamic";
// ============================================================
// api/attendance/route.ts — Attendance CRUD
//
// POST: Record attendance for a date (teacher only)
// GET:  Get attendance records (teacher or enrolled student)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const recordAttendanceSchema = z.object({
  courseId: z.string().min(1, "courseId is required"),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT"]),
    })
  ).min(1, "At least one record required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can record attendance" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = recordAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { courseId, date, records } = parsed.data;

    // Verify teacher owns this course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    // Normalize date to UTC midnight (avoid local timezone shift)
    const attendanceDate = new Date(date + "T00:00:00.000Z");

    // Upsert attendance records
    const upserts = records.map((r) =>
      prisma.attendance.upsert({
        where: {
          courseId_studentId_date: {
            courseId,
            studentId: r.studentId,
            date: attendanceDate,
          },
        },
        update: { status: r.status },
        create: {
          courseId,
          studentId: r.studentId,
          date: attendanceDate,
          status: r.status,
        },
      })
    );

    await prisma.$transaction(upserts);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    // Fetch records
    const records = await prisma.attendance.findMany({
      where: {
        courseId,
        ...(isOwner ? {} : { studentId: session.user.id }),
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });

    // Group by date
    const byDate: Record<string, typeof records> = {};
    for (const r of records) {
      const key = r.date.toISOString().split("T")[0];
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(r);
    }

    // Per-student summary (for teacher)
    const studentSummary: Record<string, { name: string; email: string; present: number; absent: number }> = {};
    if (isOwner) {
      for (const r of records) {
        if (!studentSummary[r.studentId]) {
          studentSummary[r.studentId] = {
            name: r.student.name,
            email: r.student.email,
            present: 0,
            absent: 0,
          };
        }
        if (r.status === "PRESENT") studentSummary[r.studentId].present++;
        else studentSummary[r.studentId].absent++;
      }
    }

    // Student's own summary
    let mySummary = null;
    if (!isOwner) {
      const present = records.filter((r) => r.status === "PRESENT").length;
      const absent = records.filter((r) => r.status === "ABSENT").length;
      mySummary = { present, absent, total: present + absent };
    }

    return NextResponse.json({
      records: byDate,
      studentSummary: isOwner ? studentSummary : undefined,
      mySummary: !isOwner ? mySummary : undefined,
    });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
