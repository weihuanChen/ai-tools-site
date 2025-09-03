import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 生成UUID的兼容性函数
export function generateUUID(): string {
  // 优先使用 crypto.randomUUID (现代浏览器)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // 降级到兼容性更好的方法
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 生成文件内容的hash值
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

// 生成安全的文件名
export async function generateSecureFileName(
  file: File,
  toolSlug: string,
  prefix: string = 'file'
): Promise<string> {
  try {
    const fileHash = await generateFileHash(file)
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop() || 'bin'

    // 格式：{toolSlug}/{prefix}_{hash}_{timestamp}_{random}.{ext}
    return `${toolSlug}/${prefix}_${fileHash}_${timestamp}_${randomSuffix}.${fileExtension}`
  } catch (error) {
    console.error('生成安全文件名失败:', error)
    // 降级方案
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const fileExtension = file.name.split('.').pop() || 'bin'
    return `${toolSlug}/${prefix}_${timestamp}_${randomSuffix}.${fileExtension}`
  }
}

// 生成短hash（用于文件名）
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
