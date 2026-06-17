'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadZone } from '@/components/UploadZone'
import { toast } from 'react-hot-toast'

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('single')

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      if (batchName.trim()) {
        formData.append('batchName', batchName.trim())
      }

      const response = await fetch('/api/paper/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()

      // 显示上传结果
      const successMsg = `成功上传 ${data.papers.length} 篇论文`
      const errorMsg = data.errors?.length ? `\n${data.errors.join('\n')}` : ''

      if (data.errors?.length > 0) {
        toast.error(`${successMsg}\n部分文件有问题：${errorMsg}`)
      } else {
        toast.success(successMsg)
      }

      // Redirect to batch or first paper
      if (data.batch) {
        router.push(`/batch/${data.batch.id}`)
      } else if (data.papers.length > 0) {
        router.push(`/paper/${data.papers[0].id}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">上传论文</h1>

      {/* Upload Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={uploadMode === 'single' ? 'default' : 'outline'}
          onClick={() => setUploadMode('single')}
        >
          <FileText className="mr-2 h-4 w-4" />
          单篇上传
        </Button>
        <Button
          variant={uploadMode === 'batch' ? 'default' : 'outline'}
          onClick={() => setUploadMode('batch')}
        >
          <Upload className="mr-2 h-4 w-4" />
          批量上传
        </Button>
      </div>

      {/* Batch Name Input - only show in batch mode */}
      {uploadMode === 'batch' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            批量名称（可选，不填会自动生成）
          </label>
          <Input
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="例如：新媒体研究论文集"
            className="max-w-md"
          />
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone
        onUpload={handleUpload}
        multiple={uploadMode === 'batch'}
        isUploading={isUploading}
      />

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 支持上传中英文PDF论文</li>
          <li>• 英文论文可自动翻译为中文</li>
          <li>• 上传后可生成大纲、思维导图和案例理论整理</li>
          <li>• 批量上传的论文可整理成统一的知识框架</li>
        </ul>
      </div>
    </div>
  )
}
