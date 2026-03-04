import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, MapPin, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        include: {
          teacher: { select: { name: true } },
          _count: { select: { assignments: true, contents: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  const approved = enrollments.filter(e => e.status === 'APPROVED')
  const pending = enrollments.filter(e => e.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">{approved.length} enrolled · {pending.length} pending</p>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Pending Approval</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(e => (
              <div key={e.id} className="bg-amber-50 border border-amber-200 rounded-xl p-5 opacity-75">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{e.course.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                </div>
                <p className="text-sm text-gray-500">Teacher: {e.course.teacher.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length === 0 && pending.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-sm text-gray-500">Join a course using a code from your teacher</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approved.map(e => (
            <Link
              key={e.id}
              href={`/student/courses/${e.course.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-sky-200 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition">{e.course.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Enrolled</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>Teacher: {e.course.teacher.name}</span>
                </div>
                {e.course.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{e.course.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                  <span>{e.course._count.assignments} assignments</span>
                  <span>{e.course._count.contents} content items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
