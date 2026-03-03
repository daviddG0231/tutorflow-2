'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Plus,
  RefreshCw,
  Lightbulb,
  Circle,
  Loader2,
} from 'lucide-react';

const modules = [
  { name: 'Cell Structure & Organization', resources: 4 },
  { name: 'Movement In & Out of Cells', resources: 3 },
  { name: 'Biological Molecules', resources: 2 },
  { name: 'Enzymes', resources: 5 },
  { name: 'Plant Nutrition', resources: 1 },
];

const studentGroups = [
  { label: 'Year 11 - Biology Alpha', checked: true },
  { label: 'Year 11 - Biology Beta', checked: true },
  { label: 'IGCSE Fast-Track Summer', checked: false },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePublish() {
    if (!name.trim()) {
      setError('Course title is required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to create course.');
        return;
      }
      const course = await res.json();
      router.push(`/teacher/courses/${course.id}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Create New IGCSE Course
            </h1>
            <p className="text-sm text-gray-500">
              Design your curriculum, upload resources, and enrol student
              cohorts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Course
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Course Structure */}
        <aside className="w-[300px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 flex flex-col gap-4">
          <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Course Structure
          </h2>

          {/* Active item */}
          <div className="border-2 border-sky-500 rounded-lg p-3 bg-sky-50/50">
            <div className="flex items-center gap-2">
              <Circle className="w-2.5 h-2.5 fill-sky-500 text-sky-500" />
              <span className="text-sm font-medium text-gray-900">
                Course Settings &amp; Meta
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 ml-[18px]">
              0 Resources
            </p>
          </div>

          {/* Modules divider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Modules
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Module list */}
          <div className="flex flex-col gap-1">
            {modules.map((mod, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
              >
                <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-medium text-gray-500">
                      {i + 1}.
                    </span>{' '}
                    {mod.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mod.resources} Resources
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add module */}
          <button className="flex items-center gap-2 text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors px-2">
            <Plus className="w-4 h-4" />
            Add New Module
          </button>

          {/* Teacher tip */}
          <div className="mt-auto border border-sky-200 bg-sky-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                Teacher Tip
              </span>
            </div>
            <p className="text-xs text-sky-700 leading-relaxed">
              Name your modules by IGCSE syllabus section numbers (e.g. &quot;1.
              Cell Structure&quot;) so students can cross-reference with the official
              syllabus guide.
            </p>
          </div>
        </aside>

        {/* Center - Form */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Global Course Settings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Global Course Settings
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Basic information that identifies the course and controls
                  enrollment.
                </p>
              </div>

              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. IGCSE Biology Extended 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
                />
              </div>

              {/* IGCSE Subject & Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  IGCSE Subject &amp; Code
                </label>
                <select
                  defaultValue="bio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow"
                >
                  <option value="bio">Biology (0610)</option>
                  <option value="chem">Chemistry (0620)</option>
                  <option value="phys">Physics (0625)</option>
                  <option value="math">Mathematics (0580)</option>
                  <option value="eng">English Language (0500)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A comprehensive IGCSE course covering all core and supplement topics..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow resize-none"
                />
              </div>

              {/* Course Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Type
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      defaultChecked
                      className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Standard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      className="w-4 h-4 text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">Intensive</span>
                  </label>
                </div>
              </div>

              {/* Enrollment Access */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enrollment Access
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">
                      Public Discovery
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-700">
                      Requires Code
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Enrollment Code */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Enrollment Code
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-mono font-bold text-gray-400 tracking-wider">
                    Auto-generated
                  </span>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  An enrollment code will be auto-generated when you publish the course.
                </p>
              </div>

              {/* Student Groups */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Student Groups
                </h3>
                <div className="flex flex-col gap-2.5">
                  {studentGroups.map((g, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={g.checked}
                        className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                      />
                      <span className="text-sm text-gray-700">{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={`w-2.5 h-2.5 rounded-full ${
                dot === 1 ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">Draft</span>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
            Discard Changes
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save as Template
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
}
