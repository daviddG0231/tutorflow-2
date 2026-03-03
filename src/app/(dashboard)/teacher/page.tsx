'use client'

import {
  Users,
  CalendarCheck,
  ClipboardCheck,
  BookPlus,
  FilePlus2,
  FileSearch,
  ChevronRight,
  Clock,
  AlertTriangle,
} from 'lucide-react'

// ── Mock Data ────────────────────────────────────────────────────────────────

const TEACHER = { name: 'Mr. Harrison' }
const PENDING_COUNT = 8

const STATS = [
  { label: 'Students', value: 124, bg: 'bg-sky-50', text: 'text-sky-600', icon: Users },
  { label: 'Attendance', value: '94%', bg: 'bg-gray-900', text: 'text-white', icon: CalendarCheck },
  { label: 'Grading', value: 17, bg: 'bg-green-50', text: 'text-green-600', icon: ClipboardCheck },
]

const QUICK_ACTIONS = [
  { title: 'New Course', desc: 'Set up a new IGCSE course with modules and materials.', icon: BookPlus, href: '/teacher/courses/new' },
  { title: 'Create Assignment', desc: 'Design a new assignment with rubrics and deadlines.', icon: FilePlus2, href: '#' },
  { title: 'Review Submissions', desc: 'Grade and provide feedback on student work.', icon: FileSearch, href: '#' },
]

const COHORTS = [
  { code: 'BIO-0610', title: 'IGCSE Biology', subject: 'Biology', students: 32, modules: 8, progress: 72, color: 'bg-emerald-500' },
  { code: 'CHM-0620', title: 'IGCSE Chemistry', subject: 'Chemistry', students: 28, modules: 10, progress: 58, color: 'bg-sky-500' },
  { code: 'PHY-0625', title: 'IGCSE Physics', subject: 'Physics', students: 34, modules: 9, progress: 45, color: 'bg-violet-500' },
  { code: 'MTH-0580', title: 'IGCSE Mathematics', subject: 'Mathematics', students: 30, modules: 12, progress: 63, color: 'bg-orange-500' },
]

const PARTICIPATION = [
  { day: 'Mon', pct: 85 },
  { day: 'Tue', pct: 72 },
  { day: 'Wed', pct: 90 },
  { day: 'Thu', pct: 65 },
  { day: 'Fri', pct: 78 },
  { day: 'Sat', pct: 40 },
  { day: 'Sun', pct: 25 },
]

const SCHEDULE = [
  { time: '08:30 AM', course: 'IGCSE Biology', room: 'Room 204', color: 'border-emerald-500' },
  { time: '10:00 AM', course: 'IGCSE Chemistry', room: 'Lab 3B', color: 'border-sky-500' },
  { time: '01:00 PM', course: 'IGCSE Physics', room: 'Room 112', color: 'border-violet-500' },
  { time: '03:30 PM', course: 'IGCSE Mathematics', room: 'Room 305', color: 'border-orange-500' },
]

const SUBMISSIONS = [
  { name: 'Amira Khan', avatar: 'AK', assignment: 'Cell Division Lab Report', color: 'bg-pink-500' },
  { name: 'James Osei', avatar: 'JO', assignment: 'Organic Chemistry Worksheet', color: 'bg-sky-500' },
  { name: 'Priya Sharma', avatar: 'PS', assignment: 'Kinematics Problem Set', color: 'bg-amber-500' },
  { name: 'Leo Chen', avatar: 'LC', assignment: 'Probability Assignment', color: 'bg-violet-500' },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  return (
    <div className="flex gap-6">
      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header + Stats */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {TEACHER.name}. You have{' '}
              <span className="font-semibold text-orange-500">{PENDING_COUNT} assignments</span>{' '}
              pending review today.
            </p>
          </div>
          <div className="flex gap-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className={`${s.bg} ${s.text} rounded-xl px-4 py-3 flex items-center gap-3 min-w-[130px]`}
              >
                <s.icon className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-lg font-bold leading-tight">{s.value}</p>
                  <p className="text-[11px] opacity-80">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <a
                key={a.title}
                href={a.href}
                className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center mb-3">
                  <a.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition">{a.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{a.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Active Cohorts */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Cohorts</h2>
          <div className="grid grid-cols-2 gap-4">
            {COHORTS.map((c) => (
              <div key={c.code} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${c.color} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>
                    {c.code}
                  </span>
                  <span className="text-xs text-gray-400">IGCSE {c.subject}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{c.title}</h3>
                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.students} students</span>
                  <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" />{c.modules} modules</span>
                </div>
                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Syllabus Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`${c.color} h-full rounded-full transition-all`} style={{ width: `${c.progress}%` }} />
                  </div>
                </div>
                <button className="text-sky-500 text-xs font-semibold hover:text-sky-700 transition flex items-center gap-1">
                  Manage Course <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Participation */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Weekly Participation Summary</h2>
          <div className="flex items-end gap-3 h-40">
            {PARTICIPATION.map((p) => (
              <div key={p.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[11px] font-medium text-gray-600">{p.pct}%</span>
                <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-md transition-all"
                    style={{ height: `${(p.pct / 100) * 120}px` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{p.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Right Sidebar ────────────────────────────────── */}
      <aside className="w-[280px] shrink-0 space-y-5">
        {/* Today's Schedule */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" /> Today&apos;s Schedule
          </h3>
          <div className="space-y-2.5">
            {SCHEDULE.map((s, i) => (
              <div key={i} className={`border-l-[3px] ${s.color} pl-3 py-1.5`}>
                <p className="text-[11px] text-gray-400 font-medium">{s.time}</p>
                <p className="text-sm font-medium text-gray-900">{s.course}</p>
                <p className="text-[11px] text-gray-400">{s.room}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Feed */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Submission Feed</h3>
            <span className="text-[11px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
              12 Pending
            </span>
          </div>
          <div className="space-y-3">
            {SUBMISSIONS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`${s.color} text-white w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0`}>
                  {s.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{s.assignment}</p>
                </div>
                <button className="text-[10px] font-bold bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition shrink-0">
                  Grade
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Staff Notice</h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                End-of-term grade submissions are due by <span className="font-semibold">March 15, 2026</span>. Please ensure all pending assignments are graded before the deadline.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
