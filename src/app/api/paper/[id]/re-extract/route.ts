import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTextFromPdf, detectLanguage } from '@/lib/pdf-parser'

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

    // Get PDF content from base64 stored in filePath
    const buffer = Buffer.from(paper.filePath, 'base64')

    // Re-extract text
    const textContent = await extractTextFromPdf(buffer)
    const language = detectLanguage(textContent)

    // Update database
    await prisma.paper.update({
      where: { id },
      data: {
        textContent,
        language,
        // Clear old AI-generated content
        translated: false,
        translatedContent: null,
        outline: null,
        mindmap: null,
        cases: null,
        theories: null,
      },
    })

    return NextResponse.json({
      success: true,
      textLength: textContent.length,
      language,
      preview: textContent.substring(0, 500),
    })
  } catch (error) {
    console.error('Re-extract error:', error)
    return NextResponse.json(
      { error: 'Failed to re-extract text' },
      { status: 500 }
    )
  }
}
