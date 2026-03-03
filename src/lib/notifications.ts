// ============================================================
// lib/notifications.ts — Notification helper functions
//
// Provides utility to send notifications to enrolled students
// when new content is uploaded or other course events occur.
// ============================================================

import { prisma } from "@/lib/prisma";

/**
 * Create a notification for ALL approved/enrolled students in a course.
 * Used when teachers upload content, create assignments, etc.
 */
export async function notifyEnrolledStudents(courseId: string, message: string, groupId?: string | null) {
  // Find approved enrollments — filtered by group if specified
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      status: "APPROVED",
      ...(groupId ? { groupId } : {}),
    },
    select: { studentId: true },
  });

  if (enrollments.length === 0) return;

  // Batch-create notifications for all enrolled students
  await prisma.notification.createMany({
    data: enrollments.map((e) => ({
      userId: e.studentId,
      courseId,
      message,
      read: false,
    })),
  });
}
