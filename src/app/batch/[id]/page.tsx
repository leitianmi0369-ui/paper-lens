'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Languages,
  Loader2,
  GitBranch,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface Paper {
  id: string
  title: string
  fileName: string
  language: string
  translated: boolean
  createdAt: string
}

interface Batch {
  id: string
  name: string
  framework: string | null
  papers: Paper[]
}

export default function BatchDetailPage() {
  const params = useParams()
  const batchId = params.id as string

  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchBatch()
  }, [batchId])

  const fetchBatch = async () => {
    try {
      const response = await fetch(`/api/batch/${batchId}`)
      if (!response.ok) throw new Error('Failed to fetch batch')
      const data = await response.json()
      setBatch(data.batch)
    } catch (error) {
      console.error('Fetch batch error:', error)
      toast.error('加载批量分析失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFramework = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch(`/api/batch/${batchId}/framework`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Framework generation failed')
      const data = await response.json()

      setBatch((prev) =>
        prev
          ? {
              ...prev,
              framework: JSON.stringify(data.framework),
            }
          : null
      )

      toast.success('统一框架生成完成')
    } catch (error) {
      console.error('Framework generation error:', error)
      toast.error('生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">批量分析未找到</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{batch.name}</h1>
        <p className="text-gray-500">
          包含 {batch.papers.length} 篇论文
        </p>
      </div>

      {/* Papers List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">论文列表</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batch.papers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">
                  {paper.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant={paper.language === 'zh' ? 'default' : 'secondary'}>
                    {paper.language === 'zh' ? '中文' : '英文'}
                  </Badge>
                  {paper.translated && (
                    <Badge variant="outline" className="text-green-600">
                      <Languages className="mr-1 h-3 w-3" />
                      已翻译
                    </Badge>
                  )}
                </div>
                <Link href={`/paper/${paper.id}`}>
                  <Button variant="outline" className="w-full">
                    查看详情
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Framework Section */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-500" />
          统一知识框架
        </h2>

        {!batch.framework ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              将多篇论文整理为统一的知识框架，找出共性和差异
            </p>
            <Button
              onClick={handleGenerateFramework}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GitBranch className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? '生成中...' : '生成统一框架'}
            </Button>
          </div>
        ) : (
          <FrameworkDisplay framework={JSON.parse(batch.framework)} />
        )}
      </div>
    </div>
  )
}

function FrameworkDisplay({ framework }: { framework: any }) {
  return (
    <div className="space-y-6">
      {/* Common Theme */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">共同主题</h3>
        <p className="text-blue-800">{framework.commonTheme}</p>
      </div>

      {/* Papers Summary */}
      <div>
        <h3 className="font-medium text-gray-800 mb-3">论文核心观点</h3>
        <div className="space-y-3">
          {framework.papers?.map((paper: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-1">{paper.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{paper.coreArgument}</p>
              <div className="flex flex-wrap gap-2">
                {paper.keyConcepts?.map((concept: string, cidx: number) => (
                  <Badge key={cidx} variant="outline">{concept}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connections */}
      {framework.connections?.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-3">论文关联</h3>
          <ul className="space-y-2">
            {framework.connections.map((conn: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-gray-700">{conn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Differences */}
      {framework.differences?.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-3">论文差异</h3>
          <ul className="space-y-2">
            {framework.differences.map((diff: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span className="text-gray-700">{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Framework */}
      {framework.framework && (
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-medium text-purple-900 mb-2">整体知识框架</h3>
          <p className="text-purple-800">{framework.framework}</p>
        </div>
      )}

      {/* Study Advice */}
      {framework.studyAdvice && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">学习建议</h3>
          <p className="text-green-800">{framework.studyAdvice}</p>
        </div>
      )}
    </div>
  )
}
