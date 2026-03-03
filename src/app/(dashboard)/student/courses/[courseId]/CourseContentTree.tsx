'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen, Circle } from 'lucide-react'

type ContentItem = {
  id: string
  title: string
  fileType: string
}

type GroupedUnit = {
  id: string
  title: string
  items: ContentItem[]
}

export default function CourseContentTree({ units }: { units: GroupedUnit[] }) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>(
    units.length > 0 ? [units[0].id] : []
  )

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
                  {unit.items.map((t) => (
                    <button
                      key={t.id}
                      className="flex items-center gap-2 w-full pl-9 pr-4 py-2 text-xs text-left transition-colors text-gray-600 hover:bg-gray-50"
                    >
                      <Circle className="w-2 h-2 fill-sky-500 text-sky-500 shrink-0" />
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
  )
}
