export const dynamic = "force-dynamic";
// ============================================================
// api/notifications/[notificationId]/route.ts — Mark single notification as read
//
// PATCH: Mark a notification as read (must be the owner)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Not your notification" }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/notifications/[notificationId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
