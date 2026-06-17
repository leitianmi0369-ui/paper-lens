import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/openai'
import { PROMPTS } from '@/lib/prompts'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const forceRegenerate = body.force === true

    const paper = await prisma.paper.findUnique({
      where: { id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    if (paper.mindmap && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        mindmap: paper.mindmap,
        cached: true,
      })
    }

    const content =
      paper.language === 'en' && paper.translatedContent
        ? paper.translatedContent
        : paper.textContent

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '论文内容为空，无法生成思维导图' },
        { status: 400 }
      )
    }

    const maxContentLength = 12000
    const truncatedContent = content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '\n\n[内容已截断...]'
      : content

    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: PROMPTS.mindmap },
        { role: 'user', content: truncatedContent },
      ],
      temperature: 0.3,
    })

    const mindmap = response.choices[0].message.content || ''

    await prisma.paper.update({
      where: { id },
      data: { mindmap },
    })

    return NextResponse.json({
      success: true,
      mindmap,
      cached: false,
    })
  } catch (error) {
    console.error('Mindmap generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mindmap' },
      { status: 500 }
    )
  }
}
