/**
 * 文件处理工具函数
 * 提供安全的文件上传、hash生成和文件名处理功能
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
}

// 支持的文件类型
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]

// 文件大小限制（字节）
export const FILE_SIZE_LIMITS = {
  LOGO: 2 * 1024 * 1024, // 2MB
  PREVIEW: 5 * 1024 * 1024, // 5MB
  GENERAL: 10 * 1024 * 1024 // 10MB
}

/**
 * 验证文件类型和大小
 */
export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[] = SUPPORTED_IMAGE_TYPES
): FileValidationResult {
  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `不支持的文件类型: ${file.type}。支持的类型: ${allowedTypes.join(', ')}`
    }
  }

  // 检查文件大小
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1)
    return {
      isValid: false,
      error: `文件大小不能超过 ${maxSizeMB}MB`
    }
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return {
      isValid: false,
      error: '文件不能为空'
    }
  }

  return { isValid: true }
}

/**
 * 生成文件内容的SHA-256 hash
 */
export async function generateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex.substring(0, 16) // 取前16位，足够唯一性
  } catch (error) {
    console.error('生成文件hash失败:', error)
    // 降级方案：使用文件名、大小和时间的组合
    return `${file.name}_${file.size}_${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '_')
  }
}

/**
 * 生成安全的文件名
 * 格式：{toolSlug}/{prefix}_{hash}_{timestamp}_{random}.{ext}
 */
export async function generateSecureFileName(
  file: File,
  toolSlug: string,
  prefix: string = 'file'
): Promise<string> {
  try {
    const fileHash = await generateFileHash(file)
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    
    // 清理toolSlug，确保安全
    const cleanSlug = toolSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
    
    return `${cleanSlug}/${prefix}_${fileHash}_${timestamp}_${randomSuffix}.${fileExtension}`
  } catch (error) {
    console.error('生成安全文件名失败:', error)
    // 降级方案
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const cleanSlug = toolSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()
    
    return `${cleanSlug}/${prefix}_${timestamp}_${randomSuffix}.${fileExtension}`
  }
}

/**
 * 生成短hash（用于文件名）
 */
export function generateShortHash(input: string): string {
  let hash = 0
  if (input.length === 0) return hash.toString()
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36).substring(0, 8)
}

/**
 * 获取文件信息
 */
export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 检查文件是否为视频
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * 检查文件是否为文档
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/html'
  ]
  return documentTypes.includes(file.type)
}

/**
 * 生成文件预览URL
 */
export function createFilePreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isImageFile(file)) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    } else {
      reject(new Error('不支持的文件类型预览'))
    }
  })
}
