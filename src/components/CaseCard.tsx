'use client'

import { BookOpen, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Case {
  name: string
  source: string
  content: string
  usage: string
}

interface Theory {
  name: string
  author: string
  concept: string
  application: string
}

interface CaseCardProps {
  cases: Case[]
  theories: Theory[]
}

export function CaseCard({ cases, theories }: CaseCardProps) {
  if (!cases.length && !theories.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        暂无案例和理论数据
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cases */}
      {cases.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            引用案例 ({cases.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {cases.map((item, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-sm text-gray-500">{item.source}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                  <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                    作用：{item.usage}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Theories */}
      {theories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            引用理论 ({theories.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {theories.map((item, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <p className="text-sm text-gray-500">{item.author}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-2">{item.concept}</p>
                  <p className="text-xs text-green-600 bg-green-50 rounded px-2 py-1 inline-block">
                    应用：{item.application}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
