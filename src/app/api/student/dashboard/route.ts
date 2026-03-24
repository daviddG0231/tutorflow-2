import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Get enrolled courses with teacher info and assignment counts
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId, status: 'APPROVED' },
    include: {
      course: {
        include: {
          teacher: { select: { name: true } },
          assignments: {
            select: {
              id: true,
              title: true,
              deadline: true,
              totalMarks: true,
              submissions: {
                where: { studentId: userId },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  })

  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const courses = enrollments.map((e) => ({
    id: e.course.id,
    name: e.course.name,
    courseCode: e.course.courseCode,
    teacherName: e.course.teacher.name,
    assignmentCount: e.course.assignments.length,
    completedCount: e.course.assignments.filter((a) => a.submissions.length > 0).length,
  }))

  const upcoming = enrollments.flatMap((e) =>
    e.course.assignments
      .filter((a) => new Date(a.deadline) >= now && new Date(a.deadline) <= nextWeek)
      .map((a) => ({
        id: a.id,
        title: a.title,
        deadline: a.deadline.toISOString(),
        courseName: e.course.name,
        totalMarks: a.totalMarks,
      }))
  ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  return NextResponse.json({ courses, upcoming })
}
