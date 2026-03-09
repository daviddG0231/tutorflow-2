'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Users, Check, X, Loader2, ChevronDown } from 'lucide-react'

interface Course {
  id: string
  name: string
  studentCount: number
}

interface Student {
  id: string
  name: string
  email: string
}

interface AttendanceRecord {
  studentId: string
  status: 'PRESENT' | 'ABSENT'
}

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [recentRecords, setRecentRecords] = useState<Record<string, AttendanceRecord[]>>({})


  // Load courses
  useEffect(() => {
    fetch('/api/courses?role=teacher')
      .then((r) => r.json())
      .then((data) => {
        const list = (data.courses || data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          studentCount: c._count?.enrollments ?? c.studentCount ?? 0,
        }))
        setCourses(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Load students + existing attendance when course or date changes
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([])
      setAttendance({})
      setRecentRecords({})
      return
    }
    setLoadingStudents(true)

    // Fetch enrolled students
    const fetchStudents = fetch(`/api/courses/${selectedCourse}/students`)
      .then((r) => r.json())
      .then((data) => {
        const list: Student[] = (data.students || data || []).map((s: any) => ({
          id: s.id ?? s.studentId ?? s.student?.id,
          name: s.name ?? s.student?.name ?? 'Unknown',
          email: s.email ?? s.student?.email ?? '',
        }))
        setStudents(list)
        // Default all to PRESENT
        const defaults: Record<string, 'PRESENT' | 'ABSENT'> = {}
        list.forEach((s) => (defaults[s.id] = 'PRESENT'))
        return defaults
      })

    // Fetch existing attendance for this course
    const fetchAttendance = fetch(`/api/attendance?courseId=${selectedCourse}`)
      .then((r) => r.json())

    Promise.all([fetchStudents, fetchAttendance])
      .then(([defaults, attData]) => {
        setRecentRecords(attData.records || {})

        // If attendance exists for selected date, load it
        const dateRecords = attData.records?.[date]
        if (dateRecords) {
          const loaded: Record<string, 'PRESENT' | 'ABSENT'> = { ...defaults }
          dateRecords.forEach((r: any) => {
            loaded[r.studentId ?? r.student?.id] = r.status
          })
          setAttendance(loaded)
        } else {
          setAttendance(defaults)
        }
        setLoadingStudents(false)
      })
      .catch(() => setLoadingStudents(false))
  }, [selectedCourse, date])

  const toggleStatus = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }))
  }

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, 'PRESENT' | 'ABSENT'> = {}
    students.forEach((s) => (updated[s.id] = status))
    setAttendance(updated)
  }

  const handleSave = async () => {
    if (!selectedCourse || students.length === 0) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          date,
          records: Object.entries(attendance).map(([studentId, status]) => ({
            studentId,
            status,
          })),
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Attendance saved successfully!' })
      } else {
        const err = await res.json()
        setMessage({ type: 'error', text: err.error || 'Failed to save' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'PRESENT').length
  const absentCount = Object.values(attendance).filter((s) => s === 'ABSENT').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-sky-500" />
          Attendance
        </h1>
        <p className="text-gray-500 text-sm mt-1">Take and manage attendance for your courses</p>
      </div>

      {/* Course & Date Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm appearance-none bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Student List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </span>
              {students.length > 0 && (
                <span className="text-xs text-gray-400">
                  {presentCount} present · {absentCount} absent
                </span>
              )}
            </div>
            {students.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => markAll('PRESENT')}
                  className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors font-medium"
                >
                  All Present
                </button>
                <button
                  onClick={() => markAll('ABSENT')}
                  className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
                >
                  All Absent
                </button>
              </div>
            )}
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No enrolled students in this course
            </div>
          ) : (
            <div>
              {students.map((student, i) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < students.length - 1 ? 'border-b border-gray-50' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      attendance[student.id] === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {attendance[student.id] === 'PRESENT' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Present
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" /> Absent
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          {students.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              {message && (
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {message.text}
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Attendance
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recent Attendance Records */}
      {selectedCourse && Object.keys(recentRecords).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Recent Records</span>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.entries(recentRecords)
              .slice(0, 10)
              .map(([d, records]) => {
                const present = records.filter((r: any) => r.status === 'PRESENT').length
                const total = records.length
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                      d === date ? 'bg-sky-50' : ''
                    }`}
                  >
                    <span className="text-gray-700 font-medium">{d}</span>
                    <span className="text-gray-400 text-xs">
                      {present}/{total} present
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
