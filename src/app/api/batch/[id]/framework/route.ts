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

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        papers: true,
      },
    })

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    if (batch.papers.length === 0) {
      return NextResponse.json(
        { error: 'No papers in this batch' },
        { status: 400 }
      )
    }

    // Return cached framework if exists
    if (batch.framework) {
      return NextResponse.json({
        success: true,
        framework: JSON.parse(batch.framework),
      })
    }

    // Prepare papers content
    const papersContent = batch.papers
      .map((paper: any) => {
        const content =
          paper.language === 'en' && paper.translatedContent
            ? paper.translatedContent
            : paper.textContent
        return `论文标题：${paper.title}\n\n内容：\n${content}\n\n---\n\n`
      })
      .join('')

    // Generate framework
    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: PROMPTS.batchFramework },
        { role: 'user', content: papersContent },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const frameworkText = response.choices[0].message.content || '{}'
    const framework = JSON.parse(frameworkText)

    // Save framework to database
    await prisma.batch.update({
      where: { id },
      data: { framework: frameworkText },
    })

    return NextResponse.json({
      success: true,
      framework,
    })
  } catch (error) {
    console.error('Framework generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate framework' },
      { status: 500 }
    )
  }
}
