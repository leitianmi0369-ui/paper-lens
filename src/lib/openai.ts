import OpenAI from 'openai'

// 通义千问 API（兼容 OpenAI 格式）
export const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

// 使用通义千问 qwen-plus 模型（性价比高）
const MODEL = 'qwen-plus'

export async function streamChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
) {
  const stream = await openai.chat.completions.create({
    model: MODEL,
    messages,
    stream: true,
    temperature: 0.7,
  })
  return stream
}

export async function chat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
  })
  return response.choices[0].message.content
}
