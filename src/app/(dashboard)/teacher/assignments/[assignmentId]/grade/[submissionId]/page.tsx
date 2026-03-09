export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import {
  Clock,
  Download,
  FileText,
  MoreVertical,
} from 'lucide-react';
import GradingPanel from './GradingPanel';

const MARK_SCHEME = [
  {
    key: 'A',
    title: 'A: Scientific Knowledge (40%)',
    description:
      'Demonstrates thorough understanding of gravitational theory, correctly applies Newton\'s Law of Universal Gravitation, and explains orbital mechanics with accurate use of scientific terminology.',
  },
  { key: 'B', title: 'B: Calculation & Data (40%)', description: 'Accurate calculations with correct units, proper use of significant figures, and clear presentation of data.' },
  { key: 'C', title: 'C: Analysis & Quality (20%)', description: 'Clear logical analysis, well-structured arguments, and quality of written communication.' },
];

const RESOURCES = [
  { name: "Kepler's Laws Reference", type: 'PDF' },
  { name: 'Mark Scheme Guide', type: 'PDF' },
  { name: 'Orbit Simulator', type: 'Link' },
];

export default async function AssignmentGradingPage({
  params,
}: {
  params: { assignmentId: string; submissionId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access grading.</p>
      </div>
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.submissionId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      assignment: {
        include: {
          course: { select: { id: true, name: true, teacherId: true } },
        },
      },
    },
  });

  if (!submission || submission.assignment.id !== params.assignmentId) {
    notFound();
  }

  if (submission.assignment.course.teacherId !== session.user.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">You do not have access to grade this submission.</p>
      </div>
    );
  }

  const { assignment, student } = submission;
  const courseName = assignment.course.name;
  const submittedDate = submission.submittedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const submittedTime = submission.submittedAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const deadlineStr = assignment.deadline.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const isLate = submission.submittedAt > assignment.deadline;
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          {/* Student info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Student:</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{student.name}</span>
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
          <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">{courseName}</p>
          <h1 className="text-lg font-semibold text-gray-900 mt-0.5">{assignment.title}</h1>
          <div className={`flex items-center gap-1 mt-1 ${isLate ? 'text-red-500' : 'text-gray-500'} text-sm font-medium`}>
            <Clock className="w-4 h-4" />
            Due: {deadlineStr}
            {isLate && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Late</span>}
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
              {submission.fileUrl.split('/').pop() || 'Submission'}
            </div>
            <span className="text-gray-400 text-xs">Submitted: {submittedDate} • {submittedTime}</span>
          </div>

          {/* PDF content area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-10 space-y-6 text-gray-800 leading-relaxed">
              <h2 className="text-2xl font-bold text-center">{assignment.title}</h2>
              <p className="text-sm text-gray-500">Student Name: {student.name}</p>
              <hr className="border-gray-200" />
              {submission.fileUrl.startsWith('http') ? (
                <div className="text-center py-8">
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Open Submission File
                  </a>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Submission file: {submission.fileUrl}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Grading Panel ── */}
        <GradingPanel
          submissionId={submission.id}
          totalMarks={assignment.totalMarks}
          initialGrade={submission.grade}
          initialFeedback={submission.feedback || ''}
          isGraded={!!submission.gradedAt}
          markScheme={MARK_SCHEME}
          resources={RESOURCES}
        />
      </div>
    </div>
  );
}
