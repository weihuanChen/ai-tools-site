"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Heart,
  Share2,
  Flag,
  Calendar,
  Users,
  Zap,
  Shield,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react"
import { AITool } from "@/types/database"
import { getToolById, getRelatedTools, incrementToolViewCount } from "@/lib/tools"
import { TOOL_TAGS } from "@/lib/constants"

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tool, setTool] = useState<AITool | null>(null)
  const [relatedTools, setRelatedTools] = useState<AITool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [newReview, setNewReview] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [showShareSuccess, setShowShareSuccess] = useState(false)

  // 获取工具详情
  useEffect(() => {
    const fetchTool = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        setError(null)

        const toolId = parseInt(params.id as string)
        if (isNaN(toolId)) {
          setError('无效的工具ID')
          return
        }

        const toolData = await getToolById(toolId)
        if (!toolData) {
          setError('工具不存在或已被删除')
          return
        }

        setTool(toolData)

        // 获取相关工具
        const related = await getRelatedTools(toolData.category_id, toolId, 3)
        setRelatedTools(related)

        // 增加浏览次数
        await incrementToolViewCount(toolId)

      } catch (err) {
        console.error('获取工具详情失败:', err)
        setError('获取工具详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [params.id])

  // 分享功能
  const handleShare = async () => {
    const currentUrl = window.location.href
    
    try {
      // 检查是否支持现代剪贴板API
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(currentUrl)
        setShowShareSuccess(true)
        setTimeout(() => setShowShareSuccess(false), 2000)
      } else {
        // 降级方案：使用传统的复制方法
        fallbackCopyTextToClipboard(currentUrl)
      }
    } catch (error) {
      console.error('复制失败:', error)
      // 如果现代API失败，使用降级方案
      fallbackCopyTextToClipboard(currentUrl)
    }
  }

  // 降级复制方法
  const fallbackCopyTextToClipboard = (text: string) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      if (successful) {
        setShowShareSuccess(true)
        setTimeout(() => setShowShareSuccess(false), 2000)
      } else {
        console.error('传统复制方法失败')
      }
      
      document.body.removeChild(textArea)
    } catch (error) {
      console.error('降级复制方法也失败:', error)
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    )
  }

  // 计算平均评分
  const calculateAverageRating = (ratingCount: number) => {
    if (ratingCount === 0) return 0
    // 这里可以根据实际的评分数据计算，暂时返回一个模拟值
    return 4.5
  }

  // 格式化用户数量
  const formatUserCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}万+`
    } else if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万+`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Flag className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error || '工具不存在'}</p>
          </div>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  const categoryName = (tool as any).tool_categories?.name || '未知分类'
  const categorySlug = (tool as any).tool_categories?.slug || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">
                首页
              </Link>
              <span>/</span>
              <span className="text-gray-900">{tool.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={tool.icon || "/placeholder.svg"}
                alt={tool.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
                    <Badge className="bg-blue-100 text-blue-800">{categoryName}</Badge>
                    {tool.is_new && <Badge className="bg-green-100 text-green-800">新工具</Badge>}
                    {tool.is_featured && <Badge className="bg-purple-100 text-purple-800">推荐</Badge>}
                  </div>
                  <p className="text-gray-600 text-lg mb-3">{tool.short_description}</p>

                  <div className="flex items-center gap-6 text-sm">
                    {tool.rating_count > 0 && (
                      <div className="flex items-center gap-2">
                        {renderStars(calculateAverageRating(tool.rating_count))}
                        <span className="font-medium">{calculateAverageRating(tool.rating_count).toFixed(1)}</span>
                        <span className="text-gray-500">({tool.rating_count} 评价)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{formatUserCount(tool.view_count)} 浏览</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>更新于 {new Date(tool.updated_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={isFavorited ? "text-red-600 border-red-200" : ""}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                    {isFavorited ? "已收藏" : "收藏"}
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    {showShareSuccess ? '已复制' : '分享'}
                  </Button>
                  {tool.website_url && (
                    <Button asChild>
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        访问工具
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {tool.tags && Array.isArray(tool.tags) && tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag: string, index: number) => {
                    const tagConfig = TOOL_TAGS.find(t => t.value === tag)
                    return (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tagConfig?.label || tag}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="features">功能特性</TabsTrigger>
                <TabsTrigger value="screenshots">截图展示</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>工具介绍</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {tool.description}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* 用户评价 */}
                <Card>
                  <CardHeader>
                    <CardTitle>用户评价</CardTitle>
                    <CardDescription>来自真实用户的使用反馈</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Write Review */}
                    <div className="border-b pb-6">
                      <h4 className="font-semibold mb-4">写下您的评价</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">评分</label>
                          {renderStars(userRating, true, setUserRating)}
                        </div>
                        <Textarea
                          placeholder="分享您的使用体验..."
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          rows={4}
                        />
                        <Button>提交评价</Button>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      <p className="text-gray-500 text-center py-8">暂无用户评价</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>主要功能</CardTitle>
                    <CardDescription>该工具提供的核心功能和特性</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tool.features && Array.isArray(tool.features) && tool.features.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">暂无功能信息</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="screenshots" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>产品截图</CardTitle>
                    <CardDescription>工具界面和功能展示</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tool.preview_images && tool.preview_images.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tool.preview_images.map((image, index) => (
                          <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.url || "/placeholder.svg?height=300&width=500"}
                              alt={image.alt || `${tool.name} 截图 ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">暂无截图</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>相关工具</CardTitle>
                  <CardDescription>您可能感兴趣的其他AI工具</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedTools.map((relatedTool) => (
                    <Link
                      key={relatedTool.id}
                      href={`/tool/${relatedTool.id}`}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={relatedTool.icon || "/placeholder.svg"}
                          alt={relatedTool.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{relatedTool.name}</h4>
                        <p className="text-xs text-gray-600">{relatedTool.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500">
                            {(relatedTool as any).tool_categories?.name || '未知分类'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 简短描述 */}
            {tool.short_description && (
              <Card>
                <CardHeader>
                  <CardTitle>简短描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{tool.short_description}</p>
                </CardContent>
              </Card>
            )}

            {/* Tool Stats */}
            {/* 
            <Card>
              <CardHeader>
                <CardTitle>工具统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">浏览次数</span>
                  <span className="font-medium">{formatUserCount(tool.view_count)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">收藏次数</span>
                  <span className="font-medium">{tool.favorite_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">评分数量</span>
                  <span className="font-medium">{tool.rating_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">创建时间</span>
                  <span className="font-medium">{new Date(tool.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </CardContent>
            </Card>
            */}

            {/* Report */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
                  <Flag className="w-4 h-4 mr-2" />
                  举报此工具
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
