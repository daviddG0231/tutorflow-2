'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
]

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp'

interface SubmitWorkProps {
  assignmentId: string
  assignmentTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitWork({
  assignmentId,
  assignmentTitle,
  onClose,
  onSuccess,
}: SubmitWorkProps) {
  const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    setError('')
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setError('Please upload a PDF, DOCX, or image file.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File must be under 20 MB.')
      return
    }
    setFile(f)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('assignmentId', assignmentId)

      const res = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Submission failed')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Submit Work</h2>
            <p className="text-xs text-gray-500 mt-0.5">{assignmentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-14 h-14 text-emerald-500 mb-3" />
              <p className="text-lg font-semibold text-gray-900">Submitted!</p>
              <p className="text-sm text-gray-500 mt-1">Your work has been submitted successfully.</p>
            </div>
          ) : (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-sky-400 bg-sky-50'
                    : file
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50/50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB • Click to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-xs text-gray-400">PDF, DOCX, or images up to 20 MB</p>
                  </div>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any notes for your teacher..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Submit Work
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
