import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batchId')

    const where = batchId ? { batchId } : {}

    const papers = await prisma.paper.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        language: true,
        translated: true,
        createdAt: true,
        batchId: true,
      },
    })

    return NextResponse.json({
      success: true,
      papers,
    })
  } catch (error) {
    console.error('Get papers error:', error)
    return NextResponse.json(
      { error: 'Failed to get papers' },
      { status: 500 }
    )
  }
}
