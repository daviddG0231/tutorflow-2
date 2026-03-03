'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  FileText,
  Info,
  Link,
  MoreVertical,
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────
const GRADE_BOUNDARIES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'] as const;

const MARK_SCHEME = [
  {
    key: 'A',
    title: 'A: Scientific Knowledge (40%)',
    description:
      'Demonstrates thorough understanding of gravitational theory, correctly applies Newton\'s Law of Universal Gravitation, and explains orbital mechanics with accurate use of scientific terminology.',
    expanded: true,
  },
  { key: 'B', title: 'B: Calculation & Data (40%)', description: 'Accurate calculations with correct units, proper use of significant figures, and clear presentation of data.', expanded: false },
  { key: 'C', title: 'C: Analysis & Quality (20%)', description: 'Clear logical analysis, well-structured arguments, and quality of written communication.', expanded: false },
];

const RESOURCES = [
  { name: "Kepler's Laws Reference", type: 'PDF', icon: FileText },
  { name: 'Mark Scheme Guide', type: 'PDF', icon: FileText },
  { name: 'Orbit Simulator', type: 'Link', icon: Link },
];

// ── Component ──────────────────────────────────────────────
export default function AssignmentGradingPage() {
  const [viewMode, setViewMode] = useState<'Student' | 'Teacher'>('Teacher');
  const [grade, setGrade] = useState(84);
  const [selectedBoundary, setSelectedBoundary] = useState('A');
  const [feedback, setFeedback] = useState('');
  const [expandedScheme, setExpandedScheme] = useState<Record<string, boolean>>(
    Object.fromEntries(MARK_SCHEME.map((s) => [s.key, s.expanded]))
  );
  const [page, setPage] = useState(1);
  const totalPages = 4;

  const gradeLabel = grade >= 90 ? 'Distinction' : grade >= 50 ? 'Pass' : 'Fail';

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
            {(['Student', 'Teacher'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 transition-colors ${viewMode === m ? 'bg-sky-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Student avatars */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Student:</span>
            <div className="flex -space-x-2">
              {['bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400'].map((c, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                  {['AT', 'MJ', 'SK', 'RL'][i]}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <MoreVertical className="w-4 h-4" />
          All Submissions
        </button>
      </div>

      {/* ─── Breadcrumb / Header ─── */}
      <div className="flex items-start justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Physics 0625 • IGCSE Year 11</p>
          <h1 className="text-lg font-semibold text-gray-900 mt-0.5">Physics: Circular Motion &amp; Gravitation</h1>
          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm font-medium">
            <Clock className="w-4 h-4" />
            Due: Oct 28, 2023
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
          Export All
        </button>
      </div>

      {/* ─── Main Content (PDF + Grading) ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left: PDF Viewer ── */}
        <div className="w-[60%] flex flex-col border-r border-gray-200 bg-gray-100">
          {/* File info */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-gray-200 text-sm">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FileText className="w-4 h-4 text-sky-500" />
              Student_Response_Final.pdf
            </div>
            <span className="text-gray-400 text-xs">Submitted: Oct 24, 2023 • 11:45 AM</span>
          </div>

          {/* Page nav */}
          <div className="flex items-center justify-between px-5 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => setPage(Math.max(1, page - 1))} className="hover:text-gray-900"><ChevronLeft className="w-4 h-4" /></button>
              <span className="font-medium">Page {page}/{totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} className="hover:text-gray-900"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-gray-600"><Eye className="w-4 h-4" /></button>
              <button className="hover:text-gray-600"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          {/* PDF content mock */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-10 space-y-6 text-gray-800 leading-relaxed">
              <h2 className="text-2xl font-bold text-center">Physics Report: Orbital Velocity</h2>
              <p className="text-sm text-gray-500">Student Name: Alex Thompson</p>
              <hr className="border-gray-200" />
              <p>
                Newton&rsquo;s Law of Universal Gravitation states that every particle of matter in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers. This fundamental principle governs the motion of celestial bodies and is essential for understanding orbital mechanics.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-center font-mono text-lg border border-gray-200">
                F = G × (m₁ × m₂) / r²
              </div>
              <p>
                Using this relationship, we can derive the orbital velocity of a satellite. For a stable circular orbit, the gravitational force provides exactly the centripetal force required to maintain circular motion. By equating these forces, the orbital velocity <em>v</em> can be expressed as <strong>v = √(GM/r)</strong>, where <em>M</em> is the mass of the central body and <em>r</em> is the orbital radius. This demonstrates that orbital velocity decreases with increasing distance from the central mass, consistent with Kepler&rsquo;s Third Law of planetary motion.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: Grading Panel ── */}
        <div className="w-[40%] overflow-y-auto bg-gray-50 p-5 space-y-5">
          {/* Assignment Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Assignment Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Current Status</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending Review</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Time Remaining</span>
                <span className="font-medium text-gray-700">1 Day, 4 Hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
            <h3 className="text-sm font-semibold text-gray-700">Assessment</h3>

            {/* Grade */}
            <div>
              <span className="text-xs text-gray-500">Grade Awarded</span>
              <p className="text-3xl font-bold text-sky-500 mt-1">{grade}<span className="text-lg text-gray-400">/100</span></p>
            </div>

            {/* Slider */}
            <div>
              <input
                type="range"
                min={0}
                max={100}
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-sky-500 bg-gray-200"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Fail</span>
                <span>Pass</span>
                <span>Distinction</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center font-medium">{gradeLabel}</p>
            </div>

            {/* Grade Boundary */}
            <div>
              <span className="text-xs text-gray-500 block mb-2">IGCSE Grade Boundary</span>
              <div className="flex gap-1.5">
                {GRADE_BOUNDARIES.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBoundary(b)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedBoundary === b ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <span className="text-xs text-gray-500 block mb-2">Feedback Comments</span>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write a constructive comment..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button className="w-full py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
                Publish Grade
              </button>
              <button className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
            </div>
          </div>

          {/* Plagiarism Check */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Plagiarism Check</p>
              <p className="text-xs text-blue-600 mt-0.5">Turnitin Similarity Score: <strong>12%</strong> (Low Risk)</p>
            </div>
          </div>

          {/* IGCSE Mark Scheme */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">IGCSE Mark Scheme</h3>
            {MARK_SCHEME.map((s) => (
              <div key={s.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedScheme((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {s.title}
                  {expandedScheme[s.key] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expandedScheme[s.key] && (
                  <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed">{s.description}</div>
                )}
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            {RESOURCES.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <r.icon className="w-4 h-4 text-sky-500" />
                  {r.name}
                  <span className="text-xs text-gray-400">{r.type}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Download className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
