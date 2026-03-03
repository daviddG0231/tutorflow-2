'use client'

import { useState } from 'react'
import { Calendar, AlertTriangle, ArrowUpRight, CheckCircle } from 'lucide-react'
import SubmitWork from './SubmitWork'

interface AssignmentCardProps {
  assignment: {
    id: string
    title: string
    description: string | null
    deadline: string // ISO string from server
    totalMarks: number
  }
  submission: {
    id: string
    grade: number | null
    submittedAt: string
  } | null
}

export default function AssignmentCard({ assignment, submission }: AssignmentCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [submitted, setSubmitted] = useState(!!submission)

  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const isUrgent = !submitted && deadline.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000
  const isPastDeadline = now > deadline

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {!submitted && isUrgent && !isPastDeadline && (
                <>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-600 uppercase">
                    Urgent
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Due soon
                  </span>
                </>
              )}
              {submitted && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-600 uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Submitted
                </span>
              )}
              {submitted && submission?.grade !== null && submission?.grade !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-600">
                  Grade: {submission.grade}/{assignment.totalMarks}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-2">{assignment.title}</p>
            {assignment.description && (
              <p className="text-xs text-gray-500 mt-1">{assignment.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due:{' '}
                {deadline.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>{assignment.totalMarks} Points</span>
            </div>
          </div>
          {!submitted && !isPastDeadline && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shrink-0 ml-4"
            >
              Submit Work <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
          {!submitted && isPastDeadline && (
            <span className="text-xs text-red-500 font-medium shrink-0 ml-4">Deadline passed</span>
          )}
        </div>
      </div>

      {showModal && (
        <SubmitWork
          assignmentId={assignment.id}
          assignmentTitle={assignment.title}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setSubmitted(true)
          }}
        />
      )}
    </>
  )
}
