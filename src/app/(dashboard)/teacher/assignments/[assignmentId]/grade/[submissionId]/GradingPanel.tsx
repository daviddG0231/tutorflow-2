'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
  Link,
  Loader2,
} from 'lucide-react';

const GRADE_BOUNDARIES = ['A*', 'A', 'B', 'C', 'D', 'E', 'U'] as const;

const RESOURCE_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  Link: Link,
};

interface GradingPanelProps {
  submissionId: string;
  totalMarks: number;
  initialGrade: number | null;
  initialFeedback: string;
  isGraded: boolean;
  markScheme: { key: string; title: string; description: string }[];
  resources: { name: string; type: string }[];
}

export default function GradingPanel({
  submissionId,
  totalMarks,
  initialGrade,
  initialFeedback,
  isGraded,
  markScheme,
  resources,
}: GradingPanelProps) {
  const router = useRouter();
  const [grade, setGrade] = useState(initialGrade ?? Math.round(totalMarks * 0.84));
  const [selectedBoundary, setSelectedBoundary] = useState('A');
  const [feedback, setFeedback] = useState(initialFeedback);
  const [expandedScheme, setExpandedScheme] = useState<Record<string, boolean>>(
    Object.fromEntries(markScheme.map((s, i) => [s.key, i === 0]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isGraded);
  const [error, setError] = useState('');

  const pct = totalMarks > 0 ? Math.round((grade / totalMarks) * 100) : 0;
  const gradeLabel = pct >= 90 ? 'Distinction' : pct >= 50 ? 'Pass' : 'Fail';

  async function handlePublishGrade() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, feedback: feedback.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save grade.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-[40%] overflow-y-auto bg-gray-50 p-5 space-y-5">
      {/* Assignment Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Assignment Status</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Current Status</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${saved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {saved ? 'Graded' : 'Pending Review'}
          </span>
        </div>
      </div>

      {/* Assessment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-700">Assessment</h3>

        {/* Grade */}
        <div>
          <span className="text-xs text-gray-500">Grade Awarded</span>
          <p className="text-3xl font-bold text-sky-500 mt-1">{grade}<span className="text-lg text-gray-400">/{totalMarks}</span></p>
        </div>

        {/* Slider */}
        <div>
          <input
            type="range"
            min={0}
            max={totalMarks}
            value={grade}
            onChange={(e) => { setGrade(Number(e.target.value)); setSaved(false); }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-sky-500 bg-gray-200"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Fail</span>
            <span>Pass</span>
            <span>Distinction</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center font-medium">{gradeLabel} ({pct}%)</p>
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
            onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
            placeholder="Write a constructive comment..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 resize-none"
          />
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePublishGrade}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved ? 'Update Grade' : 'Publish Grade'}
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
        {markScheme.map((s) => (
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
        {resources.map((r, i) => {
          const Icon = RESOURCE_ICONS[r.type] || FileText;
          return (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Icon className="w-4 h-4 text-sky-500" />
                {r.name}
                <span className="text-xs text-gray-400">{r.type}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600"><Download className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
