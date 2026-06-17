'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (files: File[]) => void
  multiple?: boolean
  isUploading?: boolean
}

export function UploadZone({ onUpload, multiple = false, isUploading = false }: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles)
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple,
    disabled: isUploading,
  })

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        ) : (
          <div className="p-4 bg-blue-50 rounded-full">
            <Upload className="h-8 w-8 text-blue-500" />
          </div>
        )}
        <div>
          <p className="text-lg font-medium text-gray-700">
            {isDragActive
              ? '放开以上传文件'
              : isUploading
              ? '正在上传...'
              : '拖拽PDF文件到这里，或点击选择文件'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            支持中英文PDF论文，{multiple ? '可批量上传' : '单篇上传'}
          </p>
        </div>
        {!isUploading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileText className="h-4 w-4" />
            <span>仅支持 .pdf 格式</span>
          </div>
        )}
      </div>
    </div>
  )
}
