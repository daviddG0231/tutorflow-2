import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ClipboardList,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import CreateAssignmentModal from './CreateAssignmentModal'

export const dynamic = 'force-dynamic'

export default async function TeacherAssignmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'TEACHER') redirect('/login')

  const assignments = await prisma.assignment.findMany({
    where: {
      course: { teacherId: session.user.id },
    },
    include: {
      course: { select: { name: true } },
      submissions: {
        select: {
          id: true,
          grade: true,
        },
      },
    },
    orderBy: { deadline: 'asc' },
  })

  // Process and sort assignments
  const processed = assignments.map((a) => {
    const total = a.submissions.length
    const graded = a.submissions.filter((s) => s.grade !== null).length
    const ungraded = total - graded
    const firstUngraded = a.submissions.find((s) => s.grade === null)

    return {
      id: a.id,
      title: a.title,
      courseName: a.course.name,
      deadline: a.deadline,
      totalMarks: a.totalMarks,
      submissionsCount: total,
      gradedCount: graded,
      ungradedCount: ungraded,
      firstUngradedId: firstUngraded?.id ?? null,
    }
  })

  // Sort: ungraded first, then by deadline
  processed.sort((a, b) => {
    if (a.ungradedCount > 0 && b.ungradedCount === 0) return -1
    if (a.ungradedCount === 0 && b.ungradedCount > 0) return 1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and grade assignments across all your courses
          </p>
        </div>
        <CreateAssignmentModal />
      </div>

      {/* Assignments List */}
      {processed.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No assignments yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first assignment to get started.
          </p>
          <div className="mt-6">
            <CreateAssignmentModal />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {processed.map((a) => {
            const isPastDue = new Date(a.deadline) < new Date()

            return (
              <div
                key={a.id}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {a.title}
                      </h3>
                      {/* Status Badge */}
                      {a.submissionsCount === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <Clock className="h-3 w-3" />
                          No Submissions
                        </span>
                      ) : a.ungradedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                          <AlertCircle className="h-3 w-3" />
                          {a.ungradedCount} to Grade
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          All Graded
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {a.courseName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className={isPastDue ? 'text-red-500' : ''}>
                          {new Date(a.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>
                        {a.totalMarks} marks
                      </span>
                      <span>
                        {a.submissionsCount} submission{a.submissionsCount !== 1 ? 's' : ''}{' '}
                        ({a.gradedCount} graded)
                      </span>
                    </div>
                  </div>

                  {/* Right: Action */}
                  <div className="flex-shrink-0">
                    {a.ungradedCount > 0 && a.firstUngradedId ? (
                      <Link
                        href={`/teacher/assignments/${a.id}/grade/${a.firstUngradedId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                      >
                        Grade
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-400 cursor-default"
                      >
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
