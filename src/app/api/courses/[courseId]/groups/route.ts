import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
});

const updateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.courseGroup.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { enrollments: true } } },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("GET /api/courses/[courseId]/groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can manage groups" }, { status: 403 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const group = await prisma.courseGroup.create({
      data: { courseId, name: parsed.data.name },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A group with this name already exists" }, { status: 409 });
    }
    console.error("POST /api/courses/[courseId]/groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can manage groups" }, { status: 403 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    const body = await req.json();
    const groupId = body.groupId as string | undefined;
    const parsed = updateGroupSchema.safeParse({ name: body.name });
    if (!groupId || !parsed.success) {
      return NextResponse.json(
        { error: "groupId is required and " + (parsed.error?.issues[0]?.message ?? "name is required") },
        { status: 400 }
      );
    }

    const group = await prisma.courseGroup.findFirst({
      where: { id: groupId, courseId },
    });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const updated = await prisma.courseGroup.update({
      where: { id: groupId },
      data: { name: parsed.data.name.trim() },
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A group with this name already exists" }, { status: 409 });
    }
    console.error("PATCH /api/courses/[courseId]/groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Only teachers can manage groups" }, { status: 403 });
    }

    const groupId = req.nextUrl.searchParams.get("groupId");
    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: session.user.id },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found or not yours" }, { status: 404 });
    }

    await prisma.courseGroup.delete({ where: { id: groupId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/courses/[courseId]/groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
