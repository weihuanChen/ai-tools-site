"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useFormCategories } from "@/hooks/use-form-categories"
import { supabase, STORAGE_BUCKETS } from "@/lib/supabase"
import { uploadToolLogo, uploadMultiplePreviews, generateToolSlug } from "@/lib/storage"
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ImageIcon as LogoIcon,
  XCircle
} from "lucide-react"
import { ToolCategory, PreviewImage } from "@/types/database"
import { TOOL_TAGS, UPLOAD_LIMITS } from "@/lib/constants"

// 预定义的标签选项
const AVAILABLE_TAGS = TOOL_TAGS

export default function SubmitToolPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { categories, loading: categoriesLoading } = useFormCategories()
  const router = useRouter()

  // 表单状态
  const [toolName, setToolName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [features, setFeatures] = useState<string[]>([""])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [shortDescription, setShortDescription] = useState("")

  // UI状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [tagFeedback, setTagFeedback] = useState("")
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [slugMessage, setSlugMessage] = useState("")

  // 防抖定时器
  const [slugCheckTimer, setSlugCheckTimer] = useState<NodeJS.Timeout | null>(null)

  // 检查用户登录状态
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/submit')
    }
  }, [user, authLoading, router])

  // 监听标签选择变化（调试用）
  useEffect(() => {
    console.log('标签选择状态变化:', selectedTags)
  }, [selectedTags])

  // 监听分类数据变化（调试用）
  useEffect(() => {
    console.log('分类数据变化:', categories)
  }, [categories])

  // 监听分类ID选择变化（调试用）
  useEffect(() => {
    console.log('分类ID选择变化:', categoryId)
  }, [categoryId])

  // 自动生成slug
  useEffect(() => {
    if (toolName) {
      const generatedSlug = generateToolSlug(toolName)
      setSlug(generatedSlug)
    }
  }, [toolName])

  // 验证slug格式
  const validateSlug = (slugValue: string): boolean => {
    const slugRegex = /^[a-z0-9-]+$/
    return slugRegex.test(slugValue) && slugValue.length >= 3 && slugValue.length <= 100
  }

  // 检查slug是否可用 - 改进版本
  const checkSlugAvailability = async (slugValue: string): Promise<{ available: boolean; message: string }> => {
    if (!slugValue || !validateSlug(slugValue)) {
      return { available: false, message: "URL标识格式不正确" }
    }
    
    try {
      // 同时检查两个表，使用Promise.all提高效率
      const [toolsResult, submissionsResult] = await Promise.all([
        supabase
          .from('ai_tools')
          .select('id, name')
          .eq('slug', slugValue)
          .eq('status', 'active')
          .maybeSingle(),
        supabase
          .from('tool_submissions')
          .select('id, tool_name, status')
          .eq('slug', slugValue)
          .maybeSingle()
      ])

      // 检查ai_tools表
      if (toolsResult.error) {
        console.error('检查ai_tools表失败:', toolsResult.error)
        return { available: false, message: "检查失败，请重试" }
      }

      if (toolsResult.data) {
        return {
          available: false,
          message: `✗ URL标识已被工具"${toolsResult.data.name}"使用`
        }
      }

      // 检查tool_submissions表
      if (submissionsResult.error) {
        console.error('检查tool_submissions表失败:', submissionsResult.error)
        return { available: false, message: "检查失败，请重试" }
      }

      if (submissionsResult.data) {
        const statusText = submissionsResult.data.status === 'pending' ? '待审核' :
                          submissionsResult.data.status === 'approved' ? '已通过' : '已拒绝'
        return {
          available: false,
          message: `✗ URL标识已被提交记录"${submissionsResult.data.tool_name}"使用（状态：${statusText}）`
        }
      }

      // 如果都没有找到，说明slug可用
      return { available: true, message: "✓ URL标识可用" }

    } catch (error) {
      console.error('检查slug可用性时发生错误:', error)
      return { available: false, message: "检查失败，请重试" }
    }
  }

  // 防抖处理slug检查
  const debouncedSlugCheck = useCallback((value: string) => {
    // 清除之前的定时器
    if (slugCheckTimer) {
      clearTimeout(slugCheckTimer)
    }

    // 设置新的定时器
    const timer = setTimeout(async () => {
      if (!value) {
        setSlugStatus('idle')
        setSlugMessage("")
        return
      }
      
      if (!validateSlug(value)) {
        setSlugStatus('unavailable')
        setSlugMessage("URL标识只能包含小写字母、数字和连字符，长度3-100字符")
        return
      }
      
      setSlugStatus('checking')
      setSlugMessage("检查中...")
      
      try {
        const result = await checkSlugAvailability(value)
        if (result.available) {
          setSlugStatus('available')
          setSlugMessage(result.message)
        } else {
          setSlugStatus('unavailable')
          setSlugMessage(result.message)
        }
      } catch (error) {
        setSlugStatus('unavailable')
        setSlugMessage("检查失败，请重试")
      }
    }, 500) // 500ms防抖延迟

    setSlugCheckTimer(timer)
  }, [slugCheckTimer])

  // 处理slug输入变化
  const handleSlugChange = (value: string) => {
    setSlug(value)
    debouncedSlugCheck(value)
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (slugCheckTimer) {
        clearTimeout(slugCheckTimer)
      }
    }
  }, [slugCheckTimer])


  // 添加功能特性
  const addFeature = () => {
    if (features.length < UPLOAD_LIMITS.MAX_FEATURES) {
      setFeatures([...features, ""])
    }
  }

  // 移除功能特性
  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index))
    }
  }

  // 更新功能特性
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
  }

  // 切换标签选择
  const toggleTag = (tagValue: string) => {
    const tag = AVAILABLE_TAGS.find(t => t.value === tagValue)
    const tagLabel = tag?.label || tagValue
    
    if (selectedTags.includes(tagValue)) {
      const newTags = selectedTags.filter(tag => tag !== tagValue)
      setSelectedTags(newTags)
      setTagFeedback(`已移除标签: ${tagLabel}`)
      console.log('移除标签:', tagValue, '当前标签:', newTags)
    } else if (selectedTags.length < UPLOAD_LIMITS.MAX_TAGS) {
      const newTags = [...selectedTags, tagValue]
      setSelectedTags(newTags)
      setTagFeedback(`已添加标签: ${tagLabel}`)
      console.log('添加标签:', tagValue, '当前标签:', newTags)
    } else {
      setTagFeedback('已达到最大标签数量限制')
      console.log('已达到最大标签数量限制')
    }
    
    // 清除反馈信息
    setTimeout(() => setTagFeedback(""), 2000)
  }

  // 处理Logo文件选择
  const handleLogoSelect = (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('只能上传图片文件')
      return
    }

    // 验证文件大小
    if (file.size > UPLOAD_LIMITS.MAX_LOGO_SIZE) {
      setError(`Logo文件大小不能超过${UPLOAD_LIMITS.MAX_LOGO_SIZE / 1024 / 1024}MB`)
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
  }

  // 移除Logo
  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
  }

  // 上传Logo到tool-logos bucket
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user) return null

    setUploadingLogo(true)
    setError("")

    try {
      const toolSlug = generateToolSlug(toolName)
      const result = await uploadToolLogo(toolSlug, logoFile)
      
      if (!result.success) {
        setError(result.error || 'Logo上传失败')
        return null
      }
      
      return result.url || null
    } catch (error) {
      console.error('Logo上传错误:', error)
      setError(error instanceof Error ? error.message : 'Logo上传失败')
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  // 上传预览图片到tool-previews bucket
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

  // 移除预览图片
  const removePreviewImage = (imageId: string) => {
    setPreviewImages(previewImages.filter(img => img.id !== imageId))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError("")
    setSuccess("")
    setIsSubmitting(true)

    // 验证表单
    if (!toolName.trim()) {
      setError("请输入工具名称")
      setIsSubmitting(false)
      return
    }

    if (!slug.trim()) {
      setError("请输入URL标识")
      setIsSubmitting(false)
      return
    }

    if (!validateSlug(slug)) {
      setError("URL标识格式不正确，只能包含小写字母、数字和连字符，长度3-100字符")
      setIsSubmitting(false)
      return
    }

    if (slugStatus !== 'available') {
      setError("请确保URL标识可用")
      setIsSubmitting(false)
      return
    }

    // 提交前再次检查slug可用性，防止并发提交
    try {
      const finalSlugCheck = await checkSlugAvailability(slug)
      if (!finalSlugCheck.available) {
        setError(`提交失败：${finalSlugCheck.message}`)
        setIsSubmitting(false)
        return
      }
    } catch (error) {
      setError("提交前检查URL标识失败，请重试")
      setIsSubmitting(false)
      return
    }

    if (!description.trim()) {
      setError("请输入工具描述")
      setIsSubmitting(false)
      return
    }

    if (!shortDescription.trim()) {
      setError("请输入工具简要描述")
      setIsSubmitting(false)
      return
    }

    if (!categoryId) {
      setError("请选择工具分类")
      setIsSubmitting(false)
      return
    }

    // 验证分类ID是否为有效数字
    const categoryIdNum = parseInt(categoryId)
    if (isNaN(categoryIdNum)) {
      setError("分类ID格式错误")
      setIsSubmitting(false)
      return
    }

    console.log('提交时的分类ID:', categoryIdNum, '类型:', typeof categoryIdNum)

    if (!websiteUrl.trim()) {
      setError("请输入工具官网链接")
      setIsSubmitting(false)
      return
    }

    // 验证功能特性
    const validFeatures = features.filter(f => f.trim()).slice(0, UPLOAD_LIMITS.MAX_FEATURES)
    if (validFeatures.length === 0) {
      setError("请至少添加一个功能特性")
      setIsSubmitting(false)
      return
    }

    try {
      // 上传Logo（如果有）
      let logoUrl = null
      if (logoFile) {
        logoUrl = await uploadLogo()
        if (!logoUrl) {
          setIsSubmitting(false)
          return
        }
      }

              const { data, error: submitError } = await supabase
        .from('tool_submissions')
        .insert({
          user_id: user.id,
          tool_name: toolName.trim(),
          slug: slug.trim(),
          description: description.trim(),
          short_description: shortDescription.trim(),
          category_id: categoryIdNum, // 使用验证后的数字ID
          website_url: websiteUrl.trim(),
          icon_path: logoUrl, // 使用icon_path字段存储logo URL
          features: validFeatures,
          tags: selectedTags,
          preview_images: previewImages,
          status: 'pending'
        })
        .select()
        .single()

      if (submitError) {
        throw submitError
      }

      setSuccess("工具提交成功！我们会尽快审核您的提交。")
      
      // 清空表单
      setToolName("")
      setSlug("")
      setDescription("")
      setShortDescription("")
      setCategoryId("")
      setWebsiteUrl("")
      setFeatures([""])
      setSelectedTags([])
      setLogoFile(null)
      setLogoPreview("")
      setPreviewImages([])
      setSlugStatus('idle')
      setSlugMessage("")

    } catch (error) {
      console.error('提交错误:', error)
      setError(error instanceof Error ? error.message : '提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 如果用户未登录，显示加载状态
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* 头部 */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">提交AI工具</h1>
          <p className="text-gray-600">分享您发现的优质AI工具，帮助更多人发现好工具</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>工具信息</CardTitle>
            <CardDescription>请填写工具的详细信息，我们会尽快审核您的提交</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="toolName">工具名称 *</Label>
                  <Input
                    id="toolName"
                    placeholder="请输入工具名称"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">工具分类 *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* URL标识 */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL标识 *</Label>
                <div className="space-y-2">
                  <Input
                    id="slug"
                    placeholder="例如：my-ai-tool"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`${
                      slugStatus === 'available' ? 'border-green-500 focus:border-green-500' :
                      slugStatus === 'unavailable' ? 'border-red-500 focus:border-red-500' :
                      slugStatus === 'checking' ? 'border-yellow-500 focus:border-yellow-500' :
                      ''
                    }`}
                    required
                  />
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      用于生成工具详情页URL，例如：/tool/{slug}
                    </p>
                    {slugStatus === 'checking' && (
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                    )}
                    {slugStatus === 'available' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {slugStatus === 'unavailable' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {slugMessage && (
                    <p className={`text-sm ${
                      slugStatus === 'available' ? 'text-green-600' :
                      slugStatus === 'unavailable' ? 'text-red-600' :
                      slugStatus === 'checking' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {slugMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    只能包含小写字母、数字和连字符，长度3-100字符，将自动从工具名称生成
                  </p>
                </div>
              </div>

              {/* 官网链接 */}
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">官网链接 *</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  required
                />
              </div>

              {/* 工具描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">工具描述 *</Label>
                <Textarea
                  id="description"
                  placeholder="请详细描述工具的功能、特点和使用场景..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* 工具简要描述 */}
              <div className="space-y-2">
                <Label htmlFor="shortDescription">工具简要描述 *</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="请用一句话概括工具的主要功能和用途，例如：'AI绘画工具，一键生成精美图片'。"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  maxLength={200}
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    简要描述用于工具卡片显示，建议简洁明了
                  </p>
                  <span className={`text-xs ${
                    shortDescription.length > 180 ? 'text-orange-600' : 
                    shortDescription.length > 160 ? 'text-yellow-600' : 
                    'text-gray-500'
                  }`}>
                    {shortDescription.length}/200
                  </span>
                </div>
              </div>

              {/* Logo上传 */}
              <div className="space-y-4">
                <Label>工具Logo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleLogoSelect(e.target.files[0])}
                    className="hidden"
                    id="logoUpload"
                    disabled={uploadingLogo}
                  />
                  <label htmlFor="logoUpload" className="cursor-pointer">
                    <LogoIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingLogo ? '上传中...' : '点击上传工具Logo'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      支持 JPG、PNG、SVG、WebP 格式，文件大小不超过 {UPLOAD_LIMITS.MAX_LOGO_SIZE / 1024 / 1024}MB
                    </p>
                  </label>
                </div>

                {/* Logo预览 */}
                {logoPreview && (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo预览"
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Logo预览</p>
                      <p className="text-xs text-gray-500">点击右上角X移除</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 功能特性 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>功能特性 *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeature}
                    disabled={features.length >= UPLOAD_LIMITS.MAX_FEATURES}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加特性
                  </Button>
                </div>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`功能特性 ${index + 1}`}
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        required={index === 0}
                      />
                      {features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">最多可添加{UPLOAD_LIMITS.MAX_FEATURES}个功能特性</p>
              </div>

              {/* 标签选择 */}
              <div className="space-y-4">
                <Label>标签选择</Label>
                
                {/* 已选择的标签 */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">已选择的标签 ({selectedTags.length}/{UPLOAD_LIMITS.MAX_TAGS})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagValue) => {
                        const tag = AVAILABLE_TAGS.find(t => t.value === tagValue)
                        return tag ? (
                          <Badge
                            key={tag.value}
                            variant="default"
                            className={`${tag.color} cursor-pointer hover:opacity-80 transition-opacity`}
                            onClick={() => toggleTag(tag.value)}
                          >
                            {tag.label}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                                  {/* 可选择的标签 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {selectedTags.length > 0 ? '其他可选标签' : '选择标签'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.filter(tag => !selectedTags.includes(tag.value)).map((tag) => (
                        <Badge
                          key={tag.value}
                          variant="outline"
                          className={`cursor-pointer hover:bg-gray-50 transition-colors border-2 ${tag.color.replace('bg-', 'border-').replace('text-', 'text-')} hover:scale-105`}
                          onClick={() => toggleTag(tag.value)}
                        >
                          {tag.label}
                          <Plus className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">最多可选择{UPLOAD_LIMITS.MAX_TAGS}个标签</p>
                  <div className="flex items-center gap-2">
                    {selectedTags.length >= UPLOAD_LIMITS.MAX_TAGS && (
                      <p className="text-sm text-orange-600 font-medium">
                        已达到最大标签数量
                      </p>
                    )}
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('当前选择的标签:', selectedTags)}
                      >
                        调试标签
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* 标签操作反馈 */}
                {tagFeedback && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 text-sm">{tagFeedback}</span>
                  </div>
                )}
              </div>

              {/* 预览图片上传 */}
              <div className="space-y-4">
                <Label>预览截图</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="imageUpload"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploadingImages ? '上传中...' : '点击上传预览截图'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      支持 JPG、PNG 格式，单个文件不超过 {UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  </label>
                </div>

                {/* 已上传的图片预览 */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePreviewImage(image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 错误和成功消息 */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 text-sm">{success}</span>
                </div>
              )}

              {/* 提交按钮 */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || uploadingImages || uploadingLogo}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交工具"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 提交说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">提交说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>请确保工具信息准确完整，包含必要的功能描述和官网链接</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>URL标识用于生成工具详情页链接，建议使用简洁易记的英文标识</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>工具Logo有助于用户识别和记忆您的工具</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>功能特性应突出工具的核心功能和优势</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>预览截图有助于用户了解工具界面和功能</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>我们会在1-3个工作日内完成审核，审核结果会通过邮件通知</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
