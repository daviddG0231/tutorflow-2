export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List modules for a course
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

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: { contents: { orderBy: { createdAt: "desc" } } },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("GET /api/modules error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new module
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, name } = await req.json();
    if (!courseId || !name?.trim()) {
      return NextResponse.json({ error: "courseId and name are required" }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    const maxOrder = await prisma.module.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const module = await prisma.module.create({
      data: {
        courseId,
        name: name.trim(),
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("POST /api/modules error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
