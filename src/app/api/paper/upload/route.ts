import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractTextFromPdf, detectLanguage } from '@/lib/pdf-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const batchName = formData.get('batchName') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    console.log(`Received ${files.length} files for upload`)

    // Always create batch when multiple files are uploaded
    let batch = null
    if (files.length > 1) {
      const name = batchName || `批量上传-${new Date().toLocaleString('zh-CN')}`
      batch = await prisma.batch.create({
        data: { name },
      })
      console.log(`Created batch: ${batch.id} - ${name}`)
    }

    const results = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: 不是PDF文件`)
        continue
      }

      try {
        // Get file buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Extract text
        let textContent = ''
        try {
          textContent = await extractTextFromPdf(buffer)
          console.log(`Extracted ${textContent.length} chars from ${file.name}`)
        } catch (extractError) {
          console.error(`Text extraction failed for ${file.name}:`, extractError)
          errors.push(`${file.name}: 文本提取失败`)
        }

        // Detect language
        const language = detectLanguage(textContent)
        console.log(`Detected language for ${file.name}: ${language}`)

        // Store file as base64 in database (for Vercel compatibility)
        const fileBase64 = buffer.toString('base64')

        // Save to database
        const paper = await prisma.paper.create({
          data: {
            title: file.name.replace('.pdf', ''),
            fileName: file.name,
            filePath: fileBase64, // Store base64 instead of file path
            language,
            textContent,
            batchId: batch?.id,
          },
        })

        results.push(paper)
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError)
        errors.push(`${file.name}: 处理失败`)
      }
    }

    return NextResponse.json({
      success: true,
      papers: results,
      batch: batch,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
