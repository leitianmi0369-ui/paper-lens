'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Languages, Trash2, Loader2, Sparkles, BookOpen, Brain, Lightbulb, Layers, Clock } from 'lucide-react'
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
  batchId: string | null
}

interface Batch {
  id: string
  name: string
  createdAt: string
  papers: Paper[]
}

export default function HomePage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'batch'>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 并行获取论文和批次
      const [papersRes, batchesRes] = await Promise.all([
        fetch('/api/papers'),
        fetch('/api/batches'),
      ])
      const papersData = await papersRes.json()
      const batchesData = await batchesRes.json()
      setPapers(papersData.papers || [])
      setBatches(batchesData.batches || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePaper = async (id: string) => {
    if (!confirm('确定要删除这篇论文吗？')) return
    try {
      await fetch(`/api/paper/${id}`, { method: 'DELETE' })
      setPapers(prev => prev.filter(p => p.id !== id))
      toast.success('论文已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleDeleteBatch = async (id: string) => {
    if (!confirm('确定要删除这个批次及所有论文吗？')) return
    try {
      await fetch(`/api/batch/${id}`, { method: 'DELETE' })
      setBatches(prev => prev.filter(b => b.id !== id))
      setPapers(prev => prev.filter(p => p.batchId !== id))
      toast.success('批次已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const singlePapers = papers.filter(p => !p.batchId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#C54B3C]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F5E6D8] via-[#EDD5C0] to-[#E8C5AA]">
        {/* 精致的北大元素背景 */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 1440 600" fill="none">
            {/* 左侧 - 博雅塔剪影 */}
            <g transform="translate(80, 50)">
              <rect x="30" y="80" width="40" height="280" fill="#8B6F5E" rx="2" />
              <rect x="25" y="70" width="50" height="15" fill="#8B6F5E" rx="1" />
              <rect x="28" y="120" width="44" height="10" fill="#8B6F5E" />
              <rect x="28" y="170" width="44" height="10" fill="#8B6F5E" />
              <rect x="28" y="220" width="44" height="10" fill="#8B6F5E" />
              <rect x="28" y="270" width="44" height="10" fill="#8B6F5E" />
              <path d="M20 80 L50 30 L80 80" fill="#8B6F5E" />
              <rect x="45" y="10" width="10" height="25" fill="#8B6F5E" rx="2" />
              <circle cx="50" cy="5" r="6" fill="#8B6F5E" />
              <rect x="40" y="100" width="20" height="15" fill="#A68B7A" fillOpacity="0.5" rx="2" />
              <rect x="40" y="150" width="20" height="15" fill="#A68B7A" fillOpacity="0.5" rx="2" />
              <rect x="40" y="200" width="20" height="15" fill="#A68B7A" fillOpacity="0.5" rx="2" />
            </g>

            {/* 右侧 - 未名湖与石桥 */}
            <g transform="translate(900, 300)">
              <ellipse cx="200" cy="100" rx="300" ry="80" fill="#8B6F5E" fillOpacity="0.3" />
              <ellipse cx="200" cy="105" rx="250" ry="60" fill="#8B6F5E" fillOpacity="0.2" />
              <path d="M100 80 Q150 50 200 80 Q250 50 300 80" fill="none" stroke="#8B6F5E" strokeWidth="4" />
              <line x1="110" y1="80" x2="110" y2="100" stroke="#8B6F5E" strokeWidth="3" />
              <line x1="200" y1="80" x2="200" y2="100" stroke="#8B6F5E" strokeWidth="3" />
              <line x1="290" y1="80" x2="290" y2="100" stroke="#8B6F5E" strokeWidth="3" />
            </g>

            {/* 垂柳 */}
            <g transform="translate(250, 0)" stroke="#8B6F5E" strokeWidth="1.5" fill="none">
              <path d="M0 400 Q10 350 5 300 Q0 250 10 200" />
              <path d="M10 200 Q-20 180 -40 220" />
              <path d="M10 200 Q30 170 50 210" />
              <path d="M10 200 Q0 160 -10 190" />
              <path d="M5 250 Q-25 230 -45 270" />
              <path d="M5 250 Q35 220 55 260" />
            </g>

            <g transform="translate(1100, 0)" stroke="#8B6F5E" strokeWidth="1.5" fill="none">
              <path d="M0 400 Q-10 350 -5 300 Q0 250 -10 200" />
              <path d="M-10 200 Q-40 180 -60 220" />
              <path d="M-10 200 Q20 170 40 210" />
              <path d="M-10 200 Q0 160 10 190" />
            </g>

            {/* 北大西门轮廓 */}
            <g transform="translate(550, 150)" fill="#8B6F5E">
              <rect x="0" y="50" width="340" height="200" fillOpacity="0.1" />
              <rect x="130" y="80" width="80" height="170" fillOpacity="0.15" />
              <rect x="20" y="100" width="60" height="150" fillOpacity="0.12" />
              <rect x="260" y="100" width="60" height="150" fillOpacity="0.12" />
              <path d="M-10 50 L170 0 L350 50" fillOpacity="0.12" />
              <rect x="10" y="50" width="8" height="200" fillOpacity="0.18" />
              <rect x="322" y="50" width="8" height="200" fillOpacity="0.18" />
              <rect x="120" y="50" width="6" height="200" fillOpacity="0.15" />
              <rect x="214" y="50" width="6" height="200" fillOpacity="0.15" />
              <rect x="120" y="35" width="100" height="20" fillOpacity="0.2" rx="2" />
            </g>

            {/* 底部过渡 */}
            <path d="M0 500 Q200 470 400 490 Q600 460 800 480 Q1000 450 1200 470 Q1400 460 1440 480 L1440 600 L0 600 Z" fill="#8B6F5E" fillOpacity="0.05" />
          </svg>
        </div>

        <div className="container mx-auto px-6 py-16 relative">
          <div className="flex items-start justify-between gap-12">
            {/* 左侧 - 标题区域 */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 bg-[#C54B3C]/10 border border-[#C54B3C]/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-[#C54B3C] rounded-full"></div>
                <span className="text-[#8B5A3C] text-sm">人文社科论文阅读助手</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[#2D2A26] mb-6 leading-tight">
                深入论文肌理
                <br />
                <span className="text-[#C54B3C]">洞察学术真知</span>
              </h1>

              <p className="text-lg text-[#6B5B4E] mb-10 leading-relaxed">
                上传论文，智能解析，
                <br />
                让每一篇论文都清晰可见
              </p>

              <Link href="/upload">
                <Button className="bg-[#C54B3C] text-white hover:bg-[#A63D30] rounded-lg px-8 py-4 text-base font-semibold shadow-lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  开始阅读
                </Button>
              </Link>
            </div>

            {/* 右侧 - 功能介绍卡片 */}
            <div className="hidden lg:grid grid-cols-2 gap-3 max-w-md">
              {[
                { icon: Languages, label: '智能翻译', desc: '英文论文一键中译，保留学术准确性' },
                { icon: BookOpen, label: '大纲生成', desc: '自动提取论文结构，生成层级大纲' },
                { icon: Brain, label: '思维导图', desc: '可视化知识脉络，一图掌握全貌' },
                { icon: Lightbulb, label: '案例理论', desc: '提取引用案例与理论，快速把握重点' },
              ].map((item, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-sm border border-[#E8D5C4] rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm">
                  <div className="w-10 h-10 bg-[#C54B3C]/10 rounded-lg flex items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-[#C54B3C]" />
                  </div>
                  <h3 className="font-semibold text-[#2D2A26] text-sm mb-1">{item.label}</h3>
                  <p className="text-xs text-[#8B7B6B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部波浪过渡 */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0 30 Q360 60 720 30 Q1080 0 1440 30 L1440 60 L0 60 Z" fill="#FFFBF5" />
        </svg>
      </section>

      {/* Papers Section */}
      <section className="py-12 bg-[#FFFBF5]">
        <div className="container mx-auto px-6">
          {/* Section Header with Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#2D2A26]">我的论文库</h2>
              <p className="text-[#8B7B6B] mt-1 text-sm">
                共 {papers.length} 篇论文，{batches.length} 个批次
              </p>
            </div>
            <Link href="/upload">
              <Button variant="outline" className="border-[#C54B3C] text-[#C54B3C] hover:bg-[#C54B3C] hover:text-white rounded-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                上传新论文
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#F5EDE5] rounded-lg p-1 mb-8 w-fit">
            {[
              { key: 'all', label: '全部', count: papers.length },
              { key: 'single', label: '单篇上传', count: singlePapers.length },
              { key: 'batch', label: '批量上传', count: batches.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-[#2D2A26] shadow-sm'
                    : 'text-[#8B7B6B] hover:text-[#2D2A26]'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'all' && (
            <div className="space-y-10">
              {/* Batch Uploads */}
              {batches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="h-4 w-4 text-[#C54B3C]" />
                    <h3 className="font-semibold text-[#2D2A26]">批量上传</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {batches.map(batch => (
                      <BatchCard key={batch.id} batch={batch} onDelete={handleDeleteBatch} />
                    ))}
                  </div>
                </div>
              )}

              {/* Single Uploads */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-[#C54B3C]" />
                  <h3 className="font-semibold text-[#2D2A26]">单篇上传</h3>
                </div>
                {singlePapers.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {singlePapers.map(paper => (
                      <PaperCard key={paper.id} paper={paper} onDelete={handleDeletePaper} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'single' && (
            <>
              {singlePapers.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {singlePapers.map(paper => (
                    <PaperCard key={paper.id} paper={paper} onDelete={handleDeletePaper} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'batch' && (
            <>
              {batches.length === 0 ? (
                <div className="text-center py-16">
                  <Layers className="h-12 w-12 text-[#D4C5B5] mx-auto mb-4" />
                  <p className="text-[#8B7B6B]">暂无批量上传记录</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {batches.map(batch => (
                    <BatchCard key={batch.id} batch={batch} onDelete={handleDeleteBatch} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

function PaperCard({ paper, onDelete }: { paper: Paper; onDelete: (id: string) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow border-[#E8D5C4] bg-white overflow-hidden group">
      <div className="h-1 bg-gradient-to-r from-[#E8A87C] to-[#C54B3C]" />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base line-clamp-2 text-[#2D2A26] pr-2">
            {paper.title}
          </CardTitle>
          <button
            onClick={() => onDelete(paper.id)}
            className="opacity-0 group-hover:opacity-100 text-[#B8A898] hover:text-[#C54B3C] transition-all p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className={`text-xs border-[#E8D5C4] ${
              paper.language === 'zh' ? 'text-[#C54B3C]' : 'text-[#6B8E7B]'
            }`}
          >
            {paper.language === 'zh' ? '中文' : '英文'}
          </Badge>
          {paper.translated && (
            <Badge variant="outline" className="text-xs text-[#6B8E7B] border-[#C5D5C4]">
              已翻译
            </Badge>
          )}
        </div>
        <p className="text-xs text-[#B8A898] mb-3 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(paper.createdAt).toLocaleDateString('zh-CN')}
        </p>
        <Link href={`/paper/${paper.id}`}>
          <Button variant="outline" className="w-full border-[#E8D5C4] text-[#6B5B4E] hover:bg-[#C54B3C] hover:text-white hover:border-[#C54B3C] rounded-lg text-sm">
            查看详情
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function BatchCard({ batch, onDelete }: { batch: Batch; onDelete: (id: string) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow border-[#E8D5C4] bg-white overflow-hidden group">
      <div className="h-1 bg-gradient-to-r from-[#C54B3C] to-[#E8A87C]" />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base text-[#2D2A26]">{batch.name}</CardTitle>
            <p className="text-xs text-[#B8A898] mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(batch.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
          <button
            onClick={() => onDelete(batch.id)}
            className="opacity-0 group-hover:opacity-100 text-[#B8A898] hover:text-[#C54B3C] transition-all p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs text-[#C54B3C] border-[#E8D5C4]">
            <Layers className="h-3 w-3 mr-1" />
            {batch.papers?.length || 0} 篇论文
          </Badge>
        </div>
        <Link href={`/batch/${batch.id}`}>
          <Button variant="outline" className="w-full border-[#E8D5C4] text-[#6B5B4E] hover:bg-[#C54B3C] hover:text-white hover:border-[#C54B3C] rounded-lg text-sm">
            查看批次详情
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-[#E8D5C4]">
      <div className="w-16 h-16 bg-[#FFF5EE] rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="h-8 w-8 text-[#D4C5B5]" />
      </div>
      <h3 className="text-lg font-medium text-[#6B5B4E] mb-2">还没有上传论文</h3>
      <p className="text-sm text-[#B8A898] mb-6">上传你的第一篇论文，开始智能阅读之旅</p>
      <Link href="/upload">
        <Button className="bg-[#C54B3C] hover:bg-[#A63D30] text-white rounded-lg">
          <Sparkles className="mr-2 h-4 w-4" />
          开始上传
        </Button>
      </Link>
    </div>
  )
}
