'use client'

import { useEffect, useRef, useState } from 'react'
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MindMapViewProps {
  markdown: string
}

// 清理AI生成的markdown，提取有效的思维导图内容
function cleanMindmapMarkdown(raw: string): string {
  // 移除代码块标记
  let cleaned = raw.replace(/```markdown\s*/g, '').replace(/```\s*/g, '')

  // 移除开头的说明文字（找到第一个 # 开头的行）
  const lines = cleaned.split('\n')
  let startIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('#')) {
      startIndex = i
      break
    }
  }

  // 移除末尾的说明文字
  const relevantLines = lines.slice(startIndex)
  let endIndex = relevantLines.length
  for (let i = relevantLines.length - 1; i >= 0; i--) {
    const line = relevantLines[i].trim()
    if (line.startsWith('#') || line.startsWith('-') || line.startsWith('*') || line === '') {
      endIndex = i + 1
      break
    }
  }

  return relevantLines.slice(0, endIndex).join('\n').trim()
}

export function MindMapView({ markdown }: MindMapViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [mm, setMm] = useState<Markmap | null>(null)

  useEffect(() => {
    if (!svgRef.current || !markdown) return

    try {
      // Clear previous content
      svgRef.current.innerHTML = ''

      // Clean the markdown
      const cleanedMarkdown = cleanMindmapMarkdown(markdown)

      if (!cleanedMarkdown || !cleanedMarkdown.includes('#')) {
        setError('思维导图内容格式不正确')
        return
      }

      // Transform markdown to markmap data
      const transformer = new Transformer()
      const { root } = transformer.transform(cleanedMarkdown)

      // Create markmap with better options
      const markmap = Markmap.create(svgRef.current, {
        autoFit: true,
        duration: 300,
        maxWidth: 400,
        initialExpandLevel: 3,
        spacingVertical: 10,
        spacingHorizontal: 80,
      })

      // Set data
      markmap.setData(root)

      // Fit to view after render
      setTimeout(() => {
        markmap.fit()
      }, 300)

      setMm(markmap)
      setError(null)

      // Cleanup
      return () => {
        markmap.destroy()
      }
    } catch (err) {
      console.error('Markmap error:', err)
      setError('思维导图渲染失败')
    }
  }, [markdown])

  const handleZoomIn = () => {
    if (mm) {
      // Zoom in by 30%
      const svg = svgRef.current
      if (svg) {
        const viewBox = svg.viewBox.baseVal
        const newWidth = viewBox.width * 0.7
        const newHeight = viewBox.height * 0.7
        const dx = (viewBox.width - newWidth) / 2
        const dy = (viewBox.height - newHeight) / 2
        svg.setAttribute('viewBox', `${viewBox.x + dx} ${viewBox.y + dy} ${newWidth} ${newHeight}`)
      }
    }
  }

  const handleZoomOut = () => {
    if (mm) {
      // Zoom out by 30%
      const svg = svgRef.current
      if (svg) {
        const viewBox = svg.viewBox.baseVal
        const newWidth = viewBox.width * 1.3
        const newHeight = viewBox.height * 1.3
        const dx = (viewBox.width - newWidth) / 2
        const dy = (viewBox.height - newHeight) / 2
        svg.setAttribute('viewBox', `${viewBox.x + dx} ${viewBox.y + dy} ${newWidth} ${newHeight}`)
      }
    }
  }

  const handleFit = () => {
    if (mm) {
      mm.fit()
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] text-red-500 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium">{error}</p>
          <p className="text-sm text-gray-400 mt-2">请尝试重新生成思维导图</p>
        </div>
      </div>
    )
  }

  if (!markdown) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-400 bg-gray-50 rounded-lg">
        暂无思维导图数据
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-lg border" style={{ height: '700px' }}>
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          title="放大"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          title="缩小"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleFit}
          title="适应屏幕"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 思维导图 */}
      <div ref={containerRef} className="w-full h-full overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minHeight: '680px' }}
        />
      </div>
    </div>
  )
}
