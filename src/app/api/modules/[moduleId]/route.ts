export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: Rename or reorder a module
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: { select: { teacherId: true } } },
    });
    if (!mod || mod.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const data: { name?: string; order?: number } = {};
    if (body.name?.trim()) data.name = body.name.trim();
    if (typeof body.order === "number") data.order = body.order;

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/modules/[moduleId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete an empty module
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        course: { select: { teacherId: true } },
        contents: { select: { id: true }, take: 1 },
      },
    });
    if (!mod || mod.course.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (mod.contents.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a module that has content. Remove content first." },
        { status: 400 }
      );
    }

    await prisma.module.delete({ where: { id: moduleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/modules/[moduleId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
