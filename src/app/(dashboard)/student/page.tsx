'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  Users,
  ClipboardList,
  LogIn,
  Loader2,
  GraduationCap,
  Clock,
} from 'lucide-react'

interface CourseCard {
  id: string
  name: string
  courseCode: string
  teacherName: string
  assignmentCount: number
  completedCount: number
}

interface UpcomingAssignment {
  id: string
  title: string
  deadline: string
  courseName: string
  totalMarks: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<CourseCard[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status !== 'authenticated') return

    async function fetchData() {
      try {
        const res = await fetch('/api/student/dashboard')
        if (res.ok) {
          const data = await res.json()
          setCourses(data.courses ?? [])
          setUpcoming(data.upcoming ?? [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [status, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      const res = await fetch('/api/courses/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseCode: joinCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setJoinError(data.error || 'Failed to join course')
      } else {
        setJoinCode('')
        // Refresh data
        const refresh = await fetch('/api/student/dashboard')
        if (refresh.ok) {
          const d = await refresh.json()
          setCourses(d.courses ?? [])
          setUpcoming(d.upcoming ?? [])
        }
      }
    } catch {
      setJoinError('Something went wrong')
    } finally {
      setJoining(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    )
  }

  const userName = (session?.user as any)?.name || 'Student'

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning overview.</p>
      </div>

      {/* Join a Course */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <LogIn className="w-5 h-5 text-sky-500" />
          Join a Course
        </h2>
        <form onSubmit={handleJoin} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter course code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={joining || !joinCode.trim()}
            className="px-5 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {joining && <Loader2 className="w-4 h-4 animate-spin" />}
            Join
          </button>
        </form>
        {joinError && (
          <p className="text-sm text-red-500 mt-2">{joinError}</p>
        )}
      </div>

      {/* Upcoming Assignments */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Upcoming Assignments
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {upcoming.map((a) => {
              const dueDate = new Date(a.deadline)
              const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.courseName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className={`text-xs ${daysLeft <= 2 ? 'text-red-500' : 'text-gray-400'}`}>
                      {daysLeft <= 0 ? 'Due today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* My Courses */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-sky-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No courses yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Join your first course to get started. Ask your teacher for the course code!
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-sky-500" />
            My Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => {
              const progress =
                course.assignmentCount > 0
                  ? Math.round((course.completedCount / course.assignmentCount) * 100)
                  : 0
              return (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-sky-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {course.courseCode}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{course.teacherName}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {course.assignmentCount} assignments
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-medium text-gray-600">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
