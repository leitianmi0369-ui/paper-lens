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
    const { messages } = await request.json()

    const paper = await prisma.paper.findUnique({
      where: { id },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    // Use translated content for English papers, original for Chinese
    const content =
      paper.language === 'en' && paper.translatedContent
        ? paper.translatedContent
        : paper.textContent

    // Build messages with paper context
    const systemMessage = PROMPTS.chat(content)
    const chatMessages = [
      { role: 'system' as const, content: systemMessage },
      ...messages,
    ]

    // Get AI response
    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: chatMessages,
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0].message.content || ''

    // Save messages to database
    const userMessage = messages[messages.length - 1]
    await prisma.chatMessage.createMany({
      data: [
        {
          paperId: id,
          role: 'user',
          content: userMessage.content,
        },
        {
          paperId: id,
          role: 'assistant',
          content: assistantMessage,
        },
      ],
    })

    return NextResponse.json({
      success: true,
      content: assistantMessage,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    )
  }
}
