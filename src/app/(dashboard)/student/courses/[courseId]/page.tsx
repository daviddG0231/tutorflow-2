import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
  ChevronRight,
  FileText,
  Play,
  Download,
  MessageCircle,
  Clock,
} from 'lucide-react'
import CourseContentTree from './CourseContentTree'
import JoinCourseBar from './JoinCourseBar'
import AssignmentCard from './AssignmentCard'

export const dynamic = 'force-dynamic'

export default async function StudentCourseView({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const studentId = session.user.id

  // Fetch course with relations
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      contents: { orderBy: { createdAt: 'asc' } },
      assignments: {
        orderBy: { deadline: 'asc' },
        include: {
          submissions: {
            where: { studentId },
          },
        },
      },
    },
  })

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
          <p className="text-sm text-gray-500 mt-2">This course does not exist or has been removed.</p>
        </div>
      </div>
    )
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId, courseId },
    },
  })

  if (!enrollment || enrollment.status !== 'APPROVED') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Not Enrolled</h1>
          <p className="text-sm text-gray-500 mt-2">
            {enrollment?.status === 'PENDING'
              ? 'Your enrollment is pending approval.'
              : 'You are not enrolled in this course.'}
          </p>
        </div>
      </div>
    )
  }

  // Calculate progress
  const totalAssignments = course.assignments.length
  const submittedCount = course.assignments.filter(
    (a) => a.submissions.length > 0
  ).length
  const progressPercent =
    totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0

  // Upcoming deadlines (next 3 assignments with future deadlines)
  const now = new Date()
  const upcomingDeadlines = course.assignments
    .filter((a) => a.deadline > now)
    .slice(0, 3)
    .map((a, i) => ({
      date: a.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title: a.title,
      color: i === 0 ? 'border-red-400' : i === 1 ? 'border-orange-400' : 'border-sky-400',
    }))

  // Group content by fileType for the tree
  const contentUnits = groupContentIntoUnits(course.contents)

  // Average grade
  const gradedSubmissions = course.assignments
    .flatMap((a) => a.submissions)
    .filter((s) => s.grade !== null)
  const avgGrade =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum, s) => sum + (s.grade ?? 0), 0) /
            gradedSubmissions.length
        )
      : null

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium tracking-wide">
        <span className="hover:text-sky-500 cursor-pointer">MY COURSES</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">{course.name.toUpperCase()}</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {course.courseCode}
            {course.description ? ` • ${course.description}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-700">
            <FileText className="w-4 h-4" /> Syllabus PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 hover:bg-sky-600 text-white">
            <MessageCircle className="w-4 h-4" /> Ask Tutor
          </button>
        </div>
      </div>

      {/* Join New Subject Bar */}
      <JoinCourseBar />

      {/* 3-Column Layout */}
      <div className="flex gap-5">
        {/* ── Left: Course Content Tree ── */}
        <div className="w-[250px] shrink-0">
          <CourseContentTree units={contentUnits} />
        </div>

        {/* ── Center: Active Module ── */}
        <div className="flex-1 space-y-5">
          {/* Module Heading */}
          {course.contents.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {course.contents[0].title}
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-sky-100 text-sky-600">
                  Active Module
                </span>
              </div>

              {/* Content Cards */}
              <div className="grid grid-cols-3 gap-4">
                {course.contents.slice(0, 3).map((content) => {
                  const iconConfig = getContentIcon(content.fileType)
                  return (
                    <div
                      key={content.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconConfig.bg} ${iconConfig.text} mb-3`}
                      >
                        {iconConfig.icon}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{content.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{content.fileType}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Assignments */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignments</h3>
            {course.assignments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-sm text-gray-400">No assignments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {course.assignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={{
                      id: assignment.id,
                      title: assignment.title,
                      description: assignment.description,
                      deadline: assignment.deadline.toISOString(),
                      totalMarks: assignment.totalMarks,
                    }}
                    submission={
                      assignment.submissions[0]
                        ? {
                            id: assignment.submissions[0].id,
                            grade: assignment.submissions[0].grade,
                            submittedAt: assignment.submissions[0].submittedAt.toISOString(),
                          }
                        : null
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past Papers Archive (static placeholder) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Past Papers Archive</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Question Paper</p>
                  <p className="text-xs text-gray-400">May/June 2025 • Paper 2</p>
                </div>
                <Download className="w-4 h-4 text-gray-300" />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Mark Scheme</p>
                  <p className="text-xs text-gray-400">May/June 2025 • Paper 2</p>
                </div>
                <Download className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Widgets ── */}
        <div className="w-[280px] shrink-0 space-y-5">
          {/* Course Progress */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Course Progress</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercent}, 100`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                  {progressPercent}%
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average Grade</p>
                <p className="text-lg font-bold text-sky-600">
                  {avgGrade !== null ? `${avgGrade}%` : '—'}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>Assignments</span>
              <span className="font-semibold text-gray-700">
                {submittedCount} / {totalAssignments}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full"
                style={{ width: `${totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0}%` }}
              />
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 && (
                <p className="text-xs text-gray-400">No upcoming deadlines.</p>
              )}
              {upcomingDeadlines.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 pl-3 border-l-2 ${d.color}`}>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400">{d.date}</p>
                    <p className="text-xs font-medium text-gray-700">{d.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Struggling CTA */}
          <div className="bg-sky-50 rounded-xl border border-sky-100 p-5 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 text-sky-500 mx-auto mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Struggling with a Topic?</p>
            <p className="text-xs text-gray-500 mt-1">Book a 1-on-1 session with your tutor</p>
            <button className="mt-3 px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 hover:bg-sky-600 text-white w-full">
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function getContentIcon(fileType: string) {
  switch (fileType) {
    case 'VIDEO':
      return { icon: <Play className="w-5 h-5" />, bg: 'bg-sky-50', text: 'text-sky-500' }
    case 'PDF':
    case 'DOCUMENT':
      return { icon: <FileText className="w-5 h-5" />, bg: 'bg-orange-50', text: 'text-orange-500' }
    case 'SLIDE':
      return { icon: <FileText className="w-5 h-5" />, bg: 'bg-violet-50', text: 'text-violet-500' }
    default:
      return { icon: <FileText className="w-5 h-5" />, bg: 'bg-gray-50', text: 'text-gray-500' }
  }
}

function groupContentIntoUnits(
  contents: { id: string; title: string; fileType: string; fileUrl: string | null; textContent: string | null; groupId: string | null }[]
) {
  // Group by groupId, or put ungrouped items in a "General" bucket
  const groups = new Map<string, { id: string; title: string; items: { id: string; title: string; fileType: string; fileUrl?: string | null; textContent?: string | null }[] }>()

  for (const c of contents) {
    const key = c.groupId ?? '__general'
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        title: key === '__general' ? 'Course Materials' : `Group ${groups.size + 1}`,
        items: [],
      })
    }
    groups.get(key)!.items.push({ id: c.id, title: c.title, fileType: c.fileType, fileUrl: c.fileUrl, textContent: c.textContent })
  }

  return Array.from(groups.values())
}
