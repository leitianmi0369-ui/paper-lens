'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  FileText,
  Languages,
  List,
  GitBranch,
  BookOpen,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OutlineTree } from '@/components/OutlineTree'
import { MindMapView } from '@/components/MindMapView'
import { CaseCard } from '@/components/CaseCard'
import { ChatPanel } from '@/components/ChatPanel'
import { toast } from 'react-hot-toast'

interface Paper {
  id: string
  title: string
  fileName: string
  filePath: string
  language: string
  translated: boolean
  textContent: string
  translatedContent: string | null
  outline: string | null
  mindmap: string | null
  cases: string | null
  theories: string | null
  chatMessages: {
    id: string
    role: string
    content: string
  }[]
}

export default function PaperDetailPage() {
  const params = useParams()
  const paperId = params.id as string

  const [paper, setPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  useEffect(() => {
    fetchPaper()
  }, [paperId])

  const fetchPaper = async () => {
    try {
      const response = await fetch(`/api/paper/${paperId}`)
      if (!response.ok) throw new Error('Failed to fetch paper')
      const data = await response.json()
      setPaper(data.paper)
    } catch (error) {
      console.error('Fetch paper error:', error)
      toast.error('加载论文失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTranslate = async () => {
    setIsTranslating(true)
    try {
      const response = await fetch(`/api/paper/${paperId}/translate`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Translation failed')
      const data = await response.json()
      setPaper((prev) =>
        prev
          ? {
              ...prev,
              translated: true,
              translatedContent: data.translatedContent,
            }
          : null
      )
      toast.success('翻译完成')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('翻译失败')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleGenerate = async (type: 'outline' | 'mindmap' | 'cases', force = false) => {
    setIsGenerating(type)
    try {
      const response = await fetch(`/api/paper/${paperId}/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `${type} generation failed`)
      }
      const data = await response.json()

      setPaper((prev) => {
        if (!prev) return null
        const updated = { ...prev }
        if (type === 'outline') {
          updated.outline = JSON.stringify(data.outline)
        } else if (type === 'mindmap') {
          updated.mindmap = data.mindmap
        } else if (type === 'cases') {
          updated.cases = JSON.stringify(data.cases)
          updated.theories = JSON.stringify(data.theories)
        }
        return updated
      })

      const action = force ? '重新生成' : '生成'
      toast.success(
        type === 'outline'
          ? `大纲${action}完成`
          : type === 'mindmap'
          ? `思维导图${action}完成`
          : `案例理论${action}完成`
      )
    } catch (error) {
      console.error(`${type} generation error:`, error)
      toast.error(error instanceof Error ? error.message : '生成失败')
    } finally {
      setIsGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">论文未找到</p>
      </div>
    )
  }

  const content =
    paper.language === 'en' && paper.translatedContent
      ? paper.translatedContent
      : paper.textContent

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {paper.fileName}
          </span>
          <span className="flex items-center gap-1">
            <Languages className="h-4 w-4" />
            {paper.language === 'zh' ? '中文' : '英文'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            原文
          </TabsTrigger>
          <TabsTrigger value="outline" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            大纲
          </TabsTrigger>
          <TabsTrigger value="mindmap" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            思维导图
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            案例理论
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI对话
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="bg-white rounded-lg border p-6">
            {paper.language === 'en' && !paper.translated && (
              <div className="mb-4 p-4 bg-yellow-50 rounded-lg flex items-center justify-between">
                <p className="text-yellow-800">
                  这是一篇英文论文，是否翻译为中文？
                </p>
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  {isTranslating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="mr-2 h-4 w-4" />
                  )}
                  {isTranslating ? '翻译中...' : '翻译为中文'}
                </Button>
              </div>
            )}

            {paper.language === 'en' && paper.translated && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  ✓ 已翻译为中文
                </p>
              </div>
            )}

            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700">
                {content}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* Outline Tab */}
        <TabsContent value="outline">
          <div className="bg-white rounded-lg border p-6">
            {!paper.outline ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">尚未生成大纲</p>
                <Button
                  onClick={() => handleGenerate('outline')}
                  disabled={isGenerating === 'outline'}
                >
                  {isGenerating === 'outline' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <List className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating === 'outline' ? '生成中...' : '生成大纲'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate('outline', true)}
                    disabled={isGenerating === 'outline'}
                  >
                    {isGenerating === 'outline' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <List className="mr-2 h-4 w-4" />
                    )}
                    重新生成
                  </Button>
                </div>
                <OutlineTree outline={JSON.parse(paper.outline)} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Mindmap Tab */}
        <TabsContent value="mindmap">
          <div className="bg-white rounded-lg border p-6">
            {!paper.mindmap ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">尚未生成思维导图</p>
                <Button
                  onClick={() => handleGenerate('mindmap')}
                  disabled={isGenerating === 'mindmap'}
                >
                  {isGenerating === 'mindmap' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GitBranch className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating === 'mindmap' ? '生成中...' : '生成思维导图'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate('mindmap', true)}
                    disabled={isGenerating === 'mindmap'}
                  >
                    {isGenerating === 'mindmap' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GitBranch className="mr-2 h-4 w-4" />
                    )}
                    重新生成
                  </Button>
                </div>
                <MindMapView markdown={paper.mindmap} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases">
          <div className="bg-white rounded-lg border p-6">
            {!paper.cases || !paper.theories ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">尚未提取案例和理论</p>
                <Button
                  onClick={() => handleGenerate('cases')}
                  disabled={isGenerating === 'cases'}
                >
                  {isGenerating === 'cases' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating === 'cases' ? '提取中...' : '提取案例理论'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerate('cases', true)}
                    disabled={isGenerating === 'cases'}
                  >
                    {isGenerating === 'cases' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BookOpen className="mr-2 h-4 w-4" />
                    )}
                    重新生成
                  </Button>
                </div>
                <CaseCard
                  cases={JSON.parse(paper.cases)}
                  theories={JSON.parse(paper.theories)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="bg-white rounded-lg border" style={{ height: '600px' }}>
            <ChatPanel
              paperId={paperId}
              initialMessages={paper.chatMessages.map((m) => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
              }))}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
