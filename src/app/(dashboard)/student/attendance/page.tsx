import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CalendarCheck, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const studentId = session.user.id

  // Get enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: 'APPROVED' },
    include: { course: { select: { id: true, name: true } } },
  })

  // Get all attendance records
  const attendance = await prisma.attendance.findMany({
    where: { studentId },
    include: { course: { select: { name: true } } },
    orderBy: { date: 'desc' },
  })

  // Group by course
  const courseAttendance = enrollments.map((e) => {
    const records = attendance.filter((a) => a.courseId === e.courseId)
    const present = records.filter((r) => r.status === 'PRESENT').length
    const total = records.length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0
    return {
      courseId: e.courseId,
      courseName: e.course.name,
      present,
      absent: total - present,
      total,
      rate,
      records: records.slice(0, 10),
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-sky-500" />
          My Attendance
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your attendance across all courses</p>
      </div>

      {courseAttendance.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900">No attendance records yet</h3>
          <p className="text-sm text-gray-500 mt-1">Your attendance will appear here once your teacher records it</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseAttendance.map((c) => (
              <div key={c.courseId} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-sky-500" />
                  <h3 className="font-semibold text-gray-900 text-sm">{c.courseName}</h3>
                </div>

                {/* Rate circle */}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-4 ${
                    c.rate >= 80 ? 'border-green-400 text-green-600' :
                    c.rate >= 60 ? 'border-yellow-400 text-yellow-600' :
                    'border-red-400 text-red-600'
                  }`}>
                    {c.rate}%
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Present: {c.present}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Absent: {c.absent}
                    </div>
                    <div className="text-gray-400">Total sessions: {c.total}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.rate >= 80 ? 'bg-green-500' : c.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Records</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {attendance.slice(0, 20).map((record) => (
                <div key={record.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.course.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(record.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    record.status === 'PRESENT'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {record.status === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                  </span>
                </div>
              ))}
              {attendance.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No records to display</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
