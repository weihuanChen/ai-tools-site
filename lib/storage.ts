import { supabase, STORAGE_BUCKETS } from './supabase'
import { PreviewImage } from '@/types/database'
import { UPLOAD_LIMITS } from './constants'
import { generateUUID } from './utils'
import { 
  generateSecureFileName, 
  validateFile, 
  SUPPORTED_IMAGE_TYPES, 
  FILE_SIZE_LIMITS 
} from './file-utils'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  filename?: string
}

// 上传工具Logo到tool-logos bucket
export async function uploadToolLogo(
  toolSlug: string,
  file: File
): Promise<UploadResult> {
  try {
    // 使用新的文件验证函数
    const validation = validateFile(file, FILE_SIZE_LIMITS.LOGO, SUPPORTED_IMAGE_TYPES)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // 生成安全的文件名
    const fileName = await generateSecureFileName(file, toolSlug, 'logo')
    
    // 上传到tool-logos bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.TOOL_LOGOS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // 避免覆盖同名文件
      })
      
    if (uploadError) throw uploadError
    
    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.TOOL_LOGOS)
      .getPublicUrl(fileName)
      
    return { success: true, url: publicUrl, filename: fileName }
  } catch (error) {
    console.error('Logo上传错误:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Logo上传失败' 
    }
  }
}

// 上传工具预览图到tool-previews bucket
export async function uploadToolPreview(
  toolSlug: string,
  file: File,
  index: number = 0
): Promise<UploadResult> {
  try {
    // 使用新的文件验证函数
    const validation = validateFile(file, FILE_SIZE_LIMITS.PREVIEW, SUPPORTED_IMAGE_TYPES)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // 生成安全的文件名
    const fileName = await generateSecureFileName(file, toolSlug, 'preview')
    
    // 上传到tool-previews bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.TOOL_PREVIEWS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // 避免覆盖同名文件
      })
      
    if (uploadError) throw uploadError
    
    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.TOOL_PREVIEWS)
      .getPublicUrl(fileName)
      
    return { success: true, url: publicUrl, filename: fileName }
  } catch (error) {
    console.error('预览图上传错误:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '预览图上传失败' 
    }
  }
}

// 批量上传预览图片
export async function uploadMultiplePreviews(
  toolSlug: string,
  files: FileList
): Promise<PreviewImage[]> {
  const uploadedImages: PreviewImage[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const result = await uploadToolPreview(toolSlug, file, i)
    
    if (result.success && result.url && result.filename) {
      const previewImage: PreviewImage = {
        id: generateUUID(),
        url: result.url,
        filename: result.filename, // 使用生成的安全文件名
        alt: file.name,
        description: '',
        sort_order: i,
        size: file.size,
        width: 0,
        height: 0,
        uploaded_at: new Date().toISOString()
      }
      
      uploadedImages.push(previewImage)
    }
  }

  return uploadedImages
}

// 删除存储文件
export async function deleteStorageFile(
  bucketName: string,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('删除文件错误:', error)
    return false
  }
}

// 获取文件公共URL
export function getPublicUrl(bucketName: string, filePath: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)
  
  return publicUrl
}

// 生成工具slug
export function generateToolSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
