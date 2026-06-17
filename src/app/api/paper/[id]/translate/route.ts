import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { openai } from '@/lib/openai'
import { PROMPTS } from '@/lib/prompts'
import { chunkText } from '@/lib/pdf-parser'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const paper = await prisma.paper.findUnique({
      where: { id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    if (paper.language !== 'en') {
      return NextResponse.json(
        { error: 'This paper is not in English' },
        { status: 400 }
      )
    }

    if (paper.translated && paper.translatedContent) {
      return NextResponse.json({
        success: true,
        translatedContent: paper.translatedContent,
      })
    }

    // Chunk text for translation
    const chunks = chunkText(paper.textContent)
    let translatedContent = ''

    for (const chunk of chunks) {
      const response = await openai.chat.completions.create({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: PROMPTS.translate },
          { role: 'user', content: chunk },
        ],
        temperature: 0.3,
      })

      translatedContent += (response.choices[0].message.content || '') + '\n\n'
    }

    // Update paper with translation
    await prisma.paper.update({
      where: { id },
      data: {
        translated: true,
        translatedContent: translatedContent.trim(),
      },
    })

    return NextResponse.json({
      success: true,
      translatedContent: translatedContent.trim(),
    })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate paper' },
      { status: 500 }
    )
  }
}
