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

    if (paper.cases && paper.theories && !forceRegenerate) {
      return NextResponse.json({
        success: true,
        cases: JSON.parse(paper.cases),
        theories: JSON.parse(paper.theories),
        cached: true,
      })
    }

    const content =
      paper.language === 'en' && paper.translatedContent
        ? paper.translatedContent
        : paper.textContent

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '论文内容为空，无法提取案例理论' },
        { status: 400 }
      )
    }

    const maxContentLength = 15000
    const truncatedContent = content.length > maxContentLength
      ? content.substring(0, maxContentLength) + '\n\n[内容已截断...]'
      : content

    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: PROMPTS.casesAndTheories },
        { role: 'user', content: truncatedContent },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{"cases":[],"theories":[]}')

    await prisma.paper.update({
      where: { id },
      data: {
        cases: JSON.stringify(result.cases),
        theories: JSON.stringify(result.theories),
      },
    })

    return NextResponse.json({
      success: true,
      cases: result.cases,
      theories: result.theories,
      cached: false,
    })
  } catch (error) {
    console.error('Cases extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract cases and theories' },
      { status: 500 }
    )
  }
}
