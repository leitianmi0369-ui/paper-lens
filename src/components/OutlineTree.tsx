'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface OutlineSection {
  title: string
  children?: {
    title: string
    points?: string[]
  }[]
}

interface OutlineTreeProps {
  outline: {
    title: string
    sections: OutlineSection[]
  } | null
}

function SectionItem({ section, level = 0 }: { section: OutlineSection; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2)

  return (
    <div className={`${level > 0 ? 'ml-4' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left py-2 hover:bg-gray-50 rounded-lg px-2"
      >
        {section.children && section.children.length > 0 ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        <span className={`font-medium ${level === 0 ? 'text-lg' : 'text-base'} text-gray-800`}>
          {section.title}
        </span>
      </button>

      {isOpen && section.children && (
        <div className="ml-6">
          {section.children.map((child, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-medium text-gray-700 py-1">{child.title}</p>
              {child.points && child.points.length > 0 && (
                <ul className="ml-4 space-y-1">
                  {child.points.map((point, pidx) => (
                    <li key={pidx} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1.5">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OutlineTree({ outline }: OutlineTreeProps) {
  if (!outline) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        暂无大纲数据
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b">
        {outline.title}
      </h2>
      {outline.sections.map((section, idx) => (
        <SectionItem key={idx} section={section} level={0} />
      ))}
    </div>
  )
}
