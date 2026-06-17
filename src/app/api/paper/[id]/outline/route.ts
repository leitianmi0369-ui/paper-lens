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

    // Return cached outline if exists and not forcing regeneration
    if (paper.outline && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        outline: JSON.parse(paper.outline),
        cached: true,
      })
    }

    // Use translated content for English papers, original for Chinese
    const content =
      paper.language === 'en' && paper.translatedContent
        ? paper.translatedContent
        : paper.textContent

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '论文内容为空，无法生成大纲' },
        { status: 400 }
      )
    }

    // Truncate content if too long (API limit)
    const maxContentLength = 15000
    const truncatedContent = content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '\n\n[内容已截断...]'
      : content

    // Generate outline
    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: PROMPTS.outline },
        { role: 'user', content: truncatedContent },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const outlineText = response.choices[0].message.content || '{}'
    const outline = JSON.parse(outlineText)

    // Save outline to database
    await prisma.paper.update({
      where: { id },
      data: { outline: outlineText },
    })

    return NextResponse.json({
      success: true,
      outline,
      cached: false,
    })
  } catch (error) {
    console.error('Outline generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    )
  }
}
