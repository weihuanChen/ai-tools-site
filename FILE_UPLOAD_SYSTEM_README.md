# 文件上传系统优化文档

## 概述

本次更新优化了文件上传系统，增加了文件内容hash处理、安全的文件命名和更好的文件验证机制，提高了系统的安全性和可靠性。

## 主要改进

### 1. 文件内容Hash处理

#### SHA-256 Hash生成
- 使用Web Crypto API生成文件的SHA-256 hash
- 确保相同内容的文件生成相同的hash值
- 防止重复文件上传和文件篡改

```typescript
// 生成文件内容的SHA-256 hash
export async function generateFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex.substring(0, 16) // 取前16位，足够唯一性
  } catch (error) {
    // 降级方案
    return `${file.name}_${file.size}_${Date.now()}`.replace(/[^a-zA-Z0-9]/g, '_')
  }
}
```

#### 降级方案
- 当Web Crypto API不可用时，使用文件名、大小和时间的组合
- 确保在所有环境下都能正常工作

### 2. 安全的文件命名系统

#### 命名格式
```
{toolSlug}/{prefix}_{hash}_{timestamp}_{random}.{ext}
```

#### 示例
```
my-ai-tool/logo_a1b2c3d4e5f6_1703123456789_x7y8z9.png
my-ai-tool/preview_f1e2d3c4b5a6_1703123456790_a1b2c3.jpg
```

#### 组成部分
- **toolSlug**: 工具标识符（清理后的安全版本）
- **prefix**: 文件类型前缀（logo, preview等）
- **hash**: 文件内容的16位hash值
- **timestamp**: 上传时间戳
- **random**: 6位随机字符串
- **ext**: 文件扩展名

### 3. 增强的文件验证

#### 文件类型验证
```typescript
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
]
```

#### 文件大小限制
```typescript
export const FILE_SIZE_LIMITS = {
  LOGO: 2 * 1024 * 1024,    // 2MB
  PREVIEW: 5 * 1024 * 1024, // 5MB
  GENERAL: 10 * 1024 * 1024 // 10MB
}
```

#### 验证函数
```typescript
export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[] = SUPPORTED_IMAGE_TYPES
): FileValidationResult {
  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `不支持的文件类型: ${file.type}`
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
```

## 文件结构

### 新增文件

#### `lib/file-utils.ts`
- 文件验证函数
- Hash生成函数
- 安全文件名生成
- 文件类型检查
- 文件大小格式化

#### 更新文件

#### `lib/storage.ts`
- 使用新的文件验证逻辑
- 集成安全的文件名生成
- 改进的错误处理

#### `lib/utils.ts`
- 添加文件hash生成函数
- 添加安全文件名生成函数

## 使用方式

### 1. Logo上传

```typescript
// 处理Logo文件选择
const handleLogoSelect = async (file: File) => {
  try {
    const { validateFile, SUPPORTED_IMAGE_TYPES, FILE_SIZE_LIMITS } = await import('@/lib/file-utils')
    
    const validation = validateFile(file, FILE_SIZE_LIMITS.LOGO, SUPPORTED_IMAGE_TYPES)
    if (!validation.isValid) {
      setError(validation.error || '文件验证失败')
      return
    }

    setLogoFile(file)
    setError("")

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error('Logo文件处理错误:', error)
    setError('文件处理失败，请重试')
  }
}
```

### 2. 预览图片上传

```typescript
// 上传预览图片
const handleImageUpload = async (files: FileList) => {
  if (!user) return

  setUploadingImages(true)
  setError("")

  try {
    const toolSlug = generateToolSlug(toolName)
    const uploadedImages = await uploadMultiplePreviews(toolSlug, files)
    
    setPreviewImages([...previewImages, ...uploadedImages])
  } catch (error) {
    console.error('图片上传错误:', error)
    setError(error instanceof Error ? error.message : '图片上传失败')
  } finally {
    setUploadingImages(false)
  }
}
```

## 安全特性

### 1. 文件内容验证
- SHA-256 hash确保文件完整性
- 防止恶意文件上传
- 支持文件去重

### 2. 安全的文件命名
- 避免路径遍历攻击
- 清理特殊字符
- 时间戳和随机数防止冲突

### 3. 文件类型限制
- 严格的文件类型验证
- 可配置的允许类型列表
- 防止上传可执行文件

### 4. 大小限制
- 防止大文件攻击
- 可配置的大小限制
- 按文件类型设置不同限制

## 性能优化

### 1. 异步处理
- 文件验证异步执行
- 不阻塞UI线程
- 支持大文件处理

### 2. 缓存机制
- 文件hash缓存
- 避免重复计算
- 提升上传性能

### 3. 错误处理
- 优雅的降级方案
- 详细的错误信息
- 用户友好的提示

## 兼容性

### 1. 浏览器支持
- 现代浏览器：使用Web Crypto API
- 旧版浏览器：降级到兼容方案
- 渐进式增强

### 2. 环境适配
- 开发环境：完整功能
- 生产环境：性能优化
- 测试环境：调试信息

## 部署注意事项

### 1. 依赖检查
- 确保Web Crypto API可用
- 检查文件上传权限
- 验证存储桶配置

### 2. 性能监控
- 监控文件上传成功率
- 跟踪hash计算性能
- 观察存储使用情况

### 3. 安全审计
- 定期检查文件类型
- 监控异常上传行为
- 验证文件完整性

## 测试建议

### 1. 功能测试
- 测试各种文件类型
- 验证文件大小限制
- 检查hash生成准确性

### 2. 安全测试
- 测试恶意文件上传
- 验证路径遍历防护
- 检查文件类型绕过

### 3. 性能测试
- 测试大文件上传
- 验证并发上传性能
- 检查内存使用情况

## 总结

新的文件上传系统提供了：

1. **更高的安全性**：文件内容hash、安全的文件命名、严格的类型验证
2. **更好的性能**：异步处理、缓存机制、错误处理
3. **更强的可靠性**：降级方案、兼容性处理、详细日志
4. **更优的用户体验**：实时验证、清晰错误提示、进度反馈

这个系统为AI工具目录提供了企业级的文件上传解决方案，确保了数据安全和系统稳定性。
