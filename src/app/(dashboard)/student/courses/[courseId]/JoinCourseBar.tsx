'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

export default function JoinCourseBar() {
  const [joinCode, setJoinCode] = useState('')

  return (
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
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg w-44 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
      <button className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 hover:bg-sky-600 text-white">
        Join Course
      </button>
    </div>
  )
}
