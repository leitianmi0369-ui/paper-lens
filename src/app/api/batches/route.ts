import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        papers: {
          select: {
            id: true,
            title: true,
            language: true,
            translated: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      batches,
    })
  } catch (error) {
    console.error('Get batches error:', error)
    return NextResponse.json(
      { error: 'Failed to get batches' },
      { status: 500 }
    )
  }
}
