import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EnrollmentActions from './EnrollmentActions'
import {
  Users,
  ClipboardList,
  BarChart3,
  Copy,
  Plus,
  ChevronRight,
  BookOpen,
  Calendar,
  Mail,
  AlertTriangle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: { student: true },
        orderBy: { enrolledAt: 'desc' },
      },
      assignments: {
        include: { submissions: true },
        orderBy: { deadline: 'asc' },
      },
    },
  })

  if (!course || course.teacherId !== (session.user as any).id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Course not found</h2>
        <p className="text-gray-500">This course doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link
          href="/teacher/courses"
          className="mt-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
        >
          Back to My Courses
        </Link>
      </div>
    )
  }

  const approvedEnrollments = course.enrollments.filter((e) => e.status === 'APPROVED')
  const totalStudents = approvedEnrollments.length
  const assignmentCount = course.assignments.length

  // Average grade across all graded submissions
  const allGrades = course.assignments
    .flatMap((a) => a.submissions)
    .filter((s) => s.grade !== null)
    .map((s) => s.grade as number)
  const averageGrade =
    allGrades.length > 0
      ? Math.round(allGrades.reduce((sum, g) => sum + g, 0) / allGrades.length)
      : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          {course.description && (
            <p className="text-gray-500 mt-1 max-w-2xl">{course.description}</p>
          )}
        </div>
        <Link
          href={`/teacher/courses/${courseId}/assignments/new`}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </Link>
      </div>

      {/* Join Code */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Course Join Code</p>
            <p className="text-3xl font-mono font-bold text-sky-600 tracking-wider">
              {course.courseCode}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Copy join code"
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Share this code with students so they can join your course.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Enrolled Students',
            value: totalStudents,
            icon: Users,
            color: 'sky',
          },
          {
            label: 'Assignments',
            value: assignmentCount,
            icon: ClipboardList,
            color: 'orange',
          },
          {
            label: 'Average Grade',
            value: averageGrade !== null ? `${averageGrade}%` : '—',
            icon: BarChart3,
            color: 'green',
          },
        ].map((stat) => {
          const Icon = stat.icon
          const bgMap: Record<string, string> = {
            sky: 'bg-sky-50',
            orange: 'bg-orange-50',
            green: 'bg-green-50',
          }
          const textMap: Record<string, string> = {
            sky: 'text-sky-500',
            orange: 'text-orange-500',
            green: 'text-green-500',
          }
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-11 h-11 ${bgMap[stat.color]} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${textMap[stat.color]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Student Roster */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Student Roster
          </h2>
          <span className="text-sm text-gray-400">{course.enrollments.length} total</span>
        </div>
        {course.enrollments.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No students enrolled yet. Share the join code above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Enrolled</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {course.enrollments.map((enrollment) => {
                  const statusStyles: Record<string, string> = {
                    APPROVED: 'bg-green-50 text-green-700',
                    PENDING: 'bg-yellow-50 text-yellow-700',
                    REJECTED: 'bg-red-50 text-red-700',
                  }
                  return (
                    <tr key={enrollment.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-gray-900">{enrollment.student.name}</td>
                      <td className="px-5 py-3 text-gray-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {enrollment.student.email}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[enrollment.status]}`}
                        >
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <EnrollmentActions enrollmentId={enrollment.id} status={enrollment.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            Assignments
          </h2>
          <Link
            href={`/teacher/courses/${courseId}/assignments/new`}
            className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Link>
        </div>
        {course.assignments.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No assignments yet. Create your first assignment to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {course.assignments.map((assignment) => {
              const submissionCount = assignment.submissions.length
              const isPast = new Date(assignment.deadline) < new Date()
              return (
                <div key={assignment.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(assignment.deadline).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {isPast && <span className="text-red-400 ml-1">(Past due)</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                      </span>
                      <span>Total: {assignment.totalMarks} marks</span>
                    </div>
                  </div>
                  <Link
                    href={`/teacher/assignments/${assignment.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-sky-500 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                  >
                    Grade
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
