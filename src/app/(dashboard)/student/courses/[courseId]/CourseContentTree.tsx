'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react'
import InlineContentViewer from '@/components/inline-content-viewer'

type ContentItem = {
  id: string
  title: string
  fileType: string
  fileUrl?: string | null
  textContent?: string | null
}

type GroupedUnit = {
  id: string
  title: string
  items: ContentItem[]
}

const FILE_TYPE_EMOJI: Record<string, string> = {
  VIDEO: '🎥',
  PDF: '📝',
  SLIDE: '📊',
  IMAGE: '🖼️',
  DOCUMENT: '📄',
  NOTE: '📝',
}

export default function CourseContentTree({ units }: { units: GroupedUnit[] }) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(
    units.length > 0 ? [units[0].id] : []
  )
  const [expandedContent, setExpandedContent] = useState<string | null>(null)

  const toggleUnit = (id: string) =>
    setExpandedUnits((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-500" /> Course Content
        </h2>
      </div>
      <div className="divide-y divide-gray-50">
        {units.length === 0 && (
          <p className="px-4 py-3 text-xs text-gray-400">No content yet.</p>
        )}
        {units.map((unit) => {
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
                  {unit.items.map((t) => {
                    const isExpanded = expandedContent === t.id
                    const emoji = FILE_TYPE_EMOJI[t.fileType] || '📄'
                    return (
                      <div key={t.id}>
                        <button
                          onClick={() => setExpandedContent(isExpanded ? null : t.id)}
                          className={`flex items-center gap-2 w-full pl-9 pr-4 py-2 text-xs text-left transition-colors ${
                            isExpanded ? 'bg-sky-50 text-sky-600' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 shrink-0" />
                          )}
                          <span>{emoji}</span>
                          <span className="font-medium">{t.title}</span>
                        </button>
                        {isExpanded && (
                          <div className="pl-9 pr-4 pb-3 pt-1">
                            <InlineContentViewer
                              fileUrl={t.fileUrl || null}
                              fileType={t.fileType}
                              textContent={t.textContent}
                              title={t.title}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
