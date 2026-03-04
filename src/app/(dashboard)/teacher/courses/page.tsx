import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Users, MapPin, ClipboardList, PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherCoursesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { enrollments: true, assignments: true, contents: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} courses</p>
        </div>
        <Link
          href="/teacher/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first course to get started</p>
          <Link
            href="/teacher/courses/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Your First Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/teacher/courses/${course.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-sky-200 transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition">{course.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-600 font-mono">{course.courseCode}</span>
              </div>
              {course.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{course.location}</span>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{course._count.enrollments} students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>{course._count.assignments} assignments</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
