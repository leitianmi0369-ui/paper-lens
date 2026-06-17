import PDFParser from 'pdf2json'

interface TextItem {
  x: number
  y: number
  w: number
  R: { T: string }[]
}

interface Page {
  Texts: TextItem[]
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  let rawText = ''

  // 尝试方法1: pdf2json
  try {
    rawText = await extractWithPdf2Json(buffer)
    if (rawText && rawText.trim().length > 50) {
      return cleanExtractedText(rawText)
    }
    console.log('pdf2json extracted insufficient text, trying alternative...')
  } catch (e) {
    console.log('pdf2json failed, trying alternative...')
  }

  // 尝试方法2: 使用 unpdf (基于 pdfjs-dist)
  try {
    rawText = await extractWithUnpdf(buffer)
    if (rawText && rawText.trim().length > 50) {
      return cleanExtractedText(rawText)
    }
    console.log('unpdf extracted insufficient text')
  } catch (e) {
    console.log('unpdf failed:', e)
  }

  // 如果两种方法都失败，清理并返回
  return cleanExtractedText(rawText)
}

async function extractWithPdf2Json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF parser error:', errData)
      reject(new Error('Failed to parse PDF file'))
    })

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        const pages = pdfData.Pages || []
        let fullText = ''

        for (const page of pages) {
          const pageText = extractPageText(page)
          if (pageText.trim()) {
            fullText += pageText + '\n\n'
          }
        }

        resolve(fullText.trim())
      } catch (error) {
        console.error('PDF text extraction error:', error)
        reject(new Error('Failed to extract text from PDF'))
      }
    })

    // Parse the buffer
    pdfParser.parseBuffer(buffer)
  })
}

async function extractWithUnpdf(buffer: Buffer): Promise<string> {
  // 动态导入避免 SSR 问题
  const { extractText } = await import('unpdf')
  const uint8Array = new Uint8Array(buffer)
  const { text } = await extractText(uint8Array)
  return Array.isArray(text) ? text.join('\n\n') : text
}

function cleanExtractedText(text: string): string {
  if (!text) return ''

  // 移除中文字符之间的空格（PDF解析时经常出现的问题）
  // 例如 "本 期 话 题" -> "本期话题"
  let cleaned = text.replace(/([一-鿿])\s+([一-鿿])/g, '$1$2')

  // 多次执行以处理连续的中文字符空格
  cleaned = cleaned.replace(/([一-鿿])\s+([一-鿿])/g, '$1$2')
  cleaned = cleaned.replace(/([一-鿿])\s+([一-鿿])/g, '$1$2')

  // 移除标点符号前后的空格
  cleaned = cleaned.replace(/\s+([，。、；：！？）】》])/g, '$1')
  cleaned = cleaned.replace(/([（【《])\s+/g, '$1')

  // 清理多余的空白字符
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ')

  // 移除首尾空白
  cleaned = cleaned.trim()

  return cleaned
}

function extractPageText(page: Page): string {
  const texts = page.Texts || []

  if (texts.length === 0) return ''

  // 按Y坐标分组（同一行的文字）
  const lineMap = new Map<number, TextItem[]>()

  for (const text of texts) {
    // Y坐标四舍五入到小数点后1位，合并相近的行
    const y = Math.round(text.y * 10) / 10
    if (!lineMap.has(y)) {
      lineMap.set(y, [])
    }
    lineMap.get(y)!.push(text)
  }

  // 按Y坐标排序（从上到下）
  const sortedY = Array.from(lineMap.keys()).sort((a, b) => a - b)

  // 检测是否是双列布局
  const allX = texts.map(t => t.x)
  const midX = (Math.min(...allX) + Math.max(...allX)) / 2

  // 判断是否双列：检查是否有明显的中间空白区域
  const isDoubleColumn = detectDoubleColumn(texts, midX)

  const lines: string[] = []

  for (const y of sortedY) {
    const lineTexts = lineMap.get(y)!

    if (isDoubleColumn) {
      // 双列布局：分别提取左列和右列
      const leftTexts = lineTexts.filter(t => t.x < midX).sort((a, b) => a.x - b.x)
      const rightTexts = lineTexts.filter(t => t.x >= midX).sort((a, b) => a.x - b.x)

      const leftStr = leftTexts.map(t => decodeURIComponent(t.R[0]?.T || '')).join('')
      const rightStr = rightTexts.map(t => decodeURIComponent(t.R[0]?.T || '')).join('')

      if (leftStr.trim() || rightStr.trim()) {
        // 如果左列有内容就添加
        if (leftStr.trim()) {
          lines.push(leftStr.trim())
        }
        // 如果右列有内容就添加
        if (rightStr.trim()) {
          lines.push(rightStr.trim())
        }
      }
    } else {
      // 单列布局：按X坐标排序
      const sortedTexts = lineTexts.sort((a, b) => a.x - b.x)
      const lineStr = sortedTexts.map(t => decodeURIComponent(t.R[0]?.T || '')).join('')
      if (lineStr.trim()) {
        lines.push(lineStr.trim())
      }
    }
  }

  return lines.join('\n')
}

function detectDoubleColumn(texts: TextItem[], midX: number): boolean {
  // 统计中间区域的文字数量
  const midRange = 5 // 中间区域的宽度（PDF单位）
  const midTexts = texts.filter(t => Math.abs(t.x - midX) < midRange)

  // 如果中间区域文字很少，说明是双列布局
  const ratio = midTexts.length / texts.length
  return ratio < 0.1 && texts.length > 50
}

export function detectLanguage(text: string): 'zh' | 'en' {
  if (!text || text.trim().length === 0) return 'zh' // 默认中文

  // 更全面的中文字符检测（包括扩展区）
  const chineseChars = text.match(/[一-鿿㐀-䶿豈-﫿]/g) || []
  const englishChars = text.match(/[a-zA-Z]/g) || []

  // 如果中文字符很少，检查是否真的是英文论文
  if (chineseChars.length < 10) {
    // 英文论文特征：大量英文单词，很少中文
    return englishChars.length > 100 ? 'en' : 'zh'
  }

  // 计算中文字符占比
  const totalAlphaChars = chineseChars.length + englishChars.length
  const chineseRatio = chineseChars.length / totalAlphaChars

  // 降低阈值：学术论文通常有大量英文参考文献，但主体是中文
  // 只要中文占比超过15%就认为是中文论文
  return chineseRatio > 0.15 ? 'zh' : 'en'
}

export function chunkText(text: string, maxChunkSize: number = 4000): string[] {
  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = ''
    }
    currentChunk += paragraph + '\n\n'
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
