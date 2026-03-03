'use client'

import { useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Play,
  Plus,
  Download,
  MessageCircle,
  Clock,
  Users,
  BookOpen,
  Circle,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
} from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────

const courseUnits = [
  {
    id: 'u1',
    title: 'Unit 1: Characteristics & Classification',
    topics: [
      { id: '1.1', title: '1.1 Characteristics of Living Organisms', done: true },
      { id: '1.2', title: '1.2 Binomial System', active: true },
      { id: '1.3', title: '1.3 Classification Keys', isNew: true },
      { id: '1.4', title: '1.4 Vertebrates & Invertebrates' },
    ],
  },
  {
    id: 'u2',
    title: 'Unit 2: Organisation of the Organism',
    topics: [
      { id: '2.1', title: '2.1 Cell Structure' },
      { id: '2.2', title: '2.2 Specialised Cells' },
      { id: '2.3', title: '2.3 Levels of Organisation' },
    ],
  },
  {
    id: 'u3',
    title: 'Unit 3: Movement In & Out of Cells',
    topics: [
      { id: '3.1', title: '3.1 Diffusion' },
      { id: '3.2', title: '3.2 Osmosis' },
      { id: '3.3', title: '3.3 Active Transport' },
    ],
  },
]

const deadlines = [
  { date: 'Mar 5', title: 'Cell Division Worksheet', color: 'border-red-400' },
  { date: 'Mar 8', title: 'Classification Poster', color: 'border-orange-400' },
  { date: 'Mar 14', title: 'Unit 1 Assessment', color: 'border-sky-400' },
]

const groupMembers = [
  { name: 'Sarah K.', initials: 'SK', color: 'bg-pink-400' },
  { name: 'James M.', initials: 'JM', color: 'bg-sky-400' },
  { name: 'Aisha R.', initials: 'AR', color: 'bg-emerald-400' },
  { name: 'David L.', initials: 'DL', color: 'bg-violet-400' },
]

// ── Page ────────────────────────────────────────────────────

export default function StudentCourseView() {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['u1'])
  const [joinCode, setJoinCode] = useState('')

  const toggleUnit = (id: string) =>
    setExpandedUnits((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium tracking-wide">
        <span className="hover:text-sky-500 cursor-pointer">MY COURSES</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">IGCSE BIOLOGY 0610</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cell Biology &amp; Organisms</h1>
          <p className="text-sm text-gray-500 mt-0.5">IGCSE Biology 0610 • Cambridge International</p>
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
      <div className="flex items-center gap-4 p-4 bg-sky-50 border border-sky-200 rounded-xl">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500 text-white shrink-0">
          <Plus className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Join a New Subject</p>
          <p className="text-xs text-gray-500">Enter the enrollment code from your teacher</p>
        </div>
        <input
          type="text"
          placeholder="e.g. BIO-2026-A1"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 hover:bg-sky-600 text-white">
          Join Course
        </button>
      </div>

      {/* 3-Column Layout */}
      <div className="flex gap-5">
        {/* ── Left: Course Content Tree ── */}
        <div className="w-[250px] shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-500" /> Course Content
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {courseUnits.map((unit) => {
                const open = expandedUnits.includes(unit.id)
                return (
                  <div key={unit.id}>
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {open ? (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span className="leading-tight">{unit.title}</span>
                    </button>
                    {open && (
                      <div className="pb-2">
                        {unit.topics.map((t) => (
                          <button
                            key={t.id}
                            className={`flex items-center gap-2 w-full pl-9 pr-4 py-2 text-xs text-left transition-colors ${
                              t.active
                                ? 'bg-sky-50 text-sky-600 font-semibold border-r-2 border-sky-500'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {(t.active || t.isNew) && (
                              <Circle className="w-2 h-2 fill-sky-500 text-sky-500 shrink-0" />
                            )}
                            {t.done && (
                              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                            )}
                            {!t.active && !t.isNew && !t.done && <span className="w-2 shrink-0" />}
                            {t.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Center: Active Module ── */}
        <div className="flex-1 space-y-5">
          {/* Module Heading */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">Unit 1.2: Binomial System</h2>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-sky-100 text-sky-600">
              Active Module
            </span>
          </div>

          {/* Content Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Video Tutorial */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-500 mb-3">
                <Play className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Video Tutorial</p>
              <p className="text-xs text-gray-400 mt-1">18 mins • HD</p>
            </div>
            {/* Handout */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-50 text-orange-500 mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Handout</p>
              <p className="text-xs text-gray-400 mt-1">12 Pages • PDF</p>
            </div>
            {/* Live Recording */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-50 text-violet-500 mb-3">
                <Play className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Live Recording</p>
              <p className="text-xs text-gray-400 mt-1">45 mins • Recorded</p>
            </div>
          </div>

          {/* Pending Assignments */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Assignments</h3>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600 uppercase">
                      Urgent
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Due soon
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    Classification of Living Organisms — Worksheet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete the worksheet covering dichotomous keys and the five-kingdom system.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due: Mar 5, 2026
                    </span>
                    <span>30 Points</span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shrink-0 ml-4">
                  Submit Work <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Past Papers Archive */}
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
                    strokeDasharray="68, 100"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
                  68%
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated Grade</p>
                <p className="text-lg font-bold text-sky-600">A*</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-between">
              <span>Assignments</span>
              <span className="font-semibold text-gray-700">12 / 15</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {deadlines.map((d, i) => (
                <div key={i} className={`flex items-center gap-3 pl-3 border-l-2 ${d.color}`}>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400">{d.date}</p>
                    <p className="text-xs font-medium text-gray-700">{d.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Members */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Biology Group A</h3>
            <div className="space-y-2.5">
              {groupMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {m.initials}
                  </div>
                  <span className="text-xs text-gray-600">{m.name}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 text-xs text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> View all members
            </button>
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
