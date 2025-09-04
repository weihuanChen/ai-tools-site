import { generateMetadata } from "./metadata"

export { generateMetadata }

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Reply,
  Trash2,
  AlertCircle,
} from "lucide-react"
import { AIToolWithFavorite, ToolCommentWithUser, ToolRatingStats } from "@/types/database"
import { getToolById, getRelatedTools, incrementToolViewCount, getToolByIdWithFavorite, addToFavorites, removeFromFavorites } from "@/lib/tools"
import { getToolComments, createComment, addCommentInteraction, removeCommentInteraction, getToolRatingStats, checkUserHasCommented, deleteComment } from "@/lib/comments"
import { TOOL_TAGS } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LazyImage } from "@/components/lazy-image"
import { StructuredData } from "@/components/structured-data"

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [tool, setTool] = useState<AIToolWithFavorite | null>(null)
  const [relatedTools, setRelatedTools] = useState<AIToolWithFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showShareSuccess, setShowShareSuccess] = useState(false)

  // 评论相关状态
  const [comments, setComments] = useState<ToolCommentWithUser[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [ratingStats, setRatingStats] = useState<ToolRatingStats | null>(null)
  const [userHasCommented, setUserHasCommented] = useState(false)
  const [commentForm, setCommentForm] = useState({
    rating: 0,
    title: '',
    content: '',
    pros: [''],
    cons: [''],
    use_case: '',
    experience_level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)

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

        // 使用新的函数获取工具详情（包含收藏状态）
        const toolData = await getToolByIdWithFavorite(toolId, user?.id)
        if (!toolData) {
          setError('工具不存在或已被删除')
          return
        }

        setTool(toolData)
        setIsFavorited(toolData.is_favorited || false)

        // 获取相关工具
        const related = await getRelatedTools(toolData.category_id, toolId, 3)
        setRelatedTools(related)

        // 增加浏览次数
        await incrementToolViewCount(toolId)

        // 获取评分统计
        const stats = await getToolRatingStats(toolId)
        setRatingStats(stats)

        // 检查用户是否已评论
        if (user) {
          const hasCommented = await checkUserHasCommented(toolId, user.id)
          setUserHasCommented(hasCommented)
        }

        // 获取评论列表
        await fetchComments(toolId)

      } catch (err) {
        console.error('获取工具详情失败:', err)
        setError('获取工具详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTool()
  }, [params.id, user?.id])

  // 获取评论列表
  const fetchComments = async (toolId: number) => {
    try {
      setCommentsLoading(true)
      const result = await getToolComments(toolId, user?.id)
      setComments(result.comments)
    } catch (error) {
      console.error('获取评论失败:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // 处理收藏/取消收藏
  const handleFavorite = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能收藏工具",
        variant: "destructive",
      })
      return
    }

    if (!tool) return

    try {
      setFavoriteLoading(true)
      let success = false

      if (isFavorited) {
        // 取消收藏
        success = await removeFromFavorites(user.id, tool.id)
        if (success) {
          setIsFavorited(false)
          toast({
            title: "已取消收藏",
            description: "工具已从收藏夹中移除",
          })
        }
      } else {
        // 添加收藏
        success = await addToFavorites(user.id, tool.id)
        if (success) {
          setIsFavorited(true)
          toast({
            title: "收藏成功",
            description: "工具已添加到收藏夹",
          })
        }
      }

      if (!success) {
        toast({
          title: "操作失败",
          description: "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 提交评论
  const handleSubmitComment = async () => {
    if (!user || !tool) return

    if (commentForm.rating === 0) {
      toast({
        title: "请选择评分",
        description: "请为工具打分",
        variant: "destructive",
      })
      return
    }

    if (!commentForm.content.trim()) {
      toast({
        title: "评论内容不能为空",
        description: "请填写评论内容",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingComment(true)

      const commentData = {
        tool_id: tool.id,
        user_id: user.id,
        rating: commentForm.rating,
        title: commentForm.content.trim().length > 50 ? commentForm.title : undefined,
        content: commentForm.content.trim(),
        pros: commentForm.pros.filter(p => p.trim()),
        cons: commentForm.cons.filter(c => c.trim()),
        use_case: commentForm.use_case.trim() || undefined,
        experience_level: commentForm.experience_level
      }

      const newComment = await createComment(commentData)
      
      if (newComment) {
        toast({
          title: "评论提交成功",
          description: "感谢您的反馈！",
        })
        
        // 重置表单
        setCommentForm({
          rating: 0,
          title: '',
          content: '',
          pros: [''],
          cons: [''],
          use_case: '',
          experience_level: 'intermediate'
        })
        
        setShowCommentForm(false)
        setUserHasCommented(true)
        
        // 刷新评论列表和评分统计
        await fetchComments(tool.id)
        const stats = await getToolRatingStats(tool.id)
        setRatingStats(stats)
      }
    } catch (error) {
      console.error('提交评论失败:', error)
      toast({
        title: "提交失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  // 处理评论互动
  const handleCommentInteraction = async (
    commentId: number,
    interactionType: 'helpful' | 'not_helpful' | 'flag' | 'report'
  ) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能进行此操作",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await addCommentInteraction(commentId, user.id, interactionType)
      if (success) {
        toast({
          title: "操作成功",
          description: interactionType === 'helpful' ? "感谢您的反馈！" : "已记录您的反馈",
        })
        // 刷新评论列表
        if (tool) {
          await fetchComments(tool.id)
        }
      }
    } catch (error) {
      console.error('评论互动失败:', error)
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!user || !tool) return

    try {
      const success = await deleteComment(commentId, user.id)
      if (success) {
        toast({
          title: "评论已删除",
          description: "评论已成功删除",
        })
        setUserHasCommented(false)
        // 刷新评论列表和评分统计
        await fetchComments(tool.id)
        const stats = await getToolRatingStats(tool.id)
        setRatingStats(stats)
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

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
  const calculateAverageRating = () => {
    if (!ratingStats || ratingStats.total_reviews === 0) return 0
    return ratingStats.average_rating
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

  // 渲染评论列表
  const renderComments = () => {
    if (commentsLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">加载评论中...</span>
        </div>
      )
    }

    if (comments.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">暂无用户评价</p>
          <p className="text-sm text-gray-400 mt-1">成为第一个评价的用户吧！</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4 bg-gray-50">
            {/* 评论头部 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user_avatar} />
                  <AvatarFallback>
                    {comment.user_name?.charAt(0) || comment.user_email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.user_name || comment.user_email?.split('@')[0] || '匿名用户'}
                    </span>
                    {comment.is_verified_user && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        认证用户
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {comment.experience_level === 'beginner' ? '初学者' :
                       comment.experience_level === 'intermediate' ? '中级' :
                       comment.experience_level === 'advanced' ? '高级' : '专家'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {renderStars(comment.rating)}
                    <span>{comment.rating}.0</span>
                    <span>•</span>
                    <span>{new Date(comment.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center gap-2">
                {user && comment.user_id === user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 评论内容 */}
            {comment.title && (
              <h4 className="font-medium text-gray-900 mb-2">{comment.title}</h4>
            )}
            <p className="text-gray-700 mb-3">{comment.content}</p>

            {/* 优缺点 */}
            {(comment.pros.length > 0 || comment.cons.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {comment.pros.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-2">优点</h5>
                    <ul className="space-y-1">
                      {comment.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {comment.cons.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-2">缺点</h5>
                    <ul className="space-y-1">
                      {comment.cons.map((con, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 使用场景 */}
            {comment.use_case && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-700 mb-1">使用场景</h5>
                <p className="text-sm text-gray-600">{comment.use_case}</p>
              </div>
            )}

            {/* 互动按钮 */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentInteraction(comment.id, 'helpful')}
                  className={`flex items-center gap-2 ${
                    comment.user_has_voted_helpful ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.helpful_count}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentInteraction(comment.id, 'flag')}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
              
              {comment.reply_count > 0 && (
                <span className="text-sm text-gray-500">
                  {comment.reply_count} 条回复
                </span>
              )}
            </div>

            {/* 回复列表 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-white rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.user_avatar} />
                        <AvatarFallback>
                          {reply.user_name?.charAt(0) || reply.user_email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {reply.user_name || reply.user_email?.split('@')[0] || '匿名用户'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
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
      {/* 结构化数据 */}
      {tool && <StructuredData tool={tool} type="tool" />}

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
              <LazyImage
                src={tool.icon || "/placeholder.svg"}
                alt={tool.name}
                className="w-full h-full"
                priority={true}
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
                    {ratingStats && ratingStats.total_reviews > 0 && (
                      <div className="flex items-center gap-2">
                        {renderStars(calculateAverageRating())}
                        <span className="font-medium">{calculateAverageRating().toFixed(1)}</span>
                        <span className="text-gray-500">({ratingStats.total_reviews} 评价)</span>
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
                    onClick={handleFavorite}
                    className={isFavorited ? "text-red-600 border-red-200" : ""}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                    )}
                    {favoriteLoading ? "处理中..." : (isFavorited ? "已收藏" : "收藏")}
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
                    {/* 评分统计 */}
                    {ratingStats && ratingStats.total_reviews > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {calculateAverageRating().toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600">平均评分</div>
                            {renderStars(calculateAverageRating())}
                            <div className="text-xs text-gray-500 mt-1">
                              {ratingStats.total_reviews} 条评价
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = ratingStats[`${star === 5 ? 'five' : star === 4 ? 'four' : star === 3 ? 'three' : star === 2 ? 'two' : 'one'}_star_count` as keyof ToolRatingStats] as number
                              const percentage = ratingStats.total_reviews > 0 ? (count / ratingStats.total_reviews) * 100 : 0
                              return (
                                <div key={star} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 w-4">{star}星</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 w-8">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 写评论表单 */}
                    {!userHasCommented && user && (
                      <div className="border-b pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">写下您的评价</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCommentForm(!showCommentForm)}
                          >
                            {showCommentForm ? '收起' : '写评价'}
                          </Button>
                        </div>
                        
                        {showCommentForm && (
                          <div className="space-y-4">
                            <div>
                              <Label className="block text-sm font-medium mb-2">评分 *</Label>
                              {renderStars(commentForm.rating, true, (rating) => 
                                setCommentForm(prev => ({ ...prev, rating }))
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor="commentTitle" className="block text-sm font-medium mb-2">
                                评价标题（可选）
                              </Label>
                              <Input
                                id="commentTitle"
                                placeholder="简短概括您的评价..."
                                value={commentForm.title}
                                onChange={(e) => setCommentForm(prev => ({ ...prev, title: e.target.value }))}
                                maxLength={100}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="commentContent" className="block text-sm font-medium mb-2">
                                评价内容 *
                              </Label>
                              <Textarea
                                id="commentContent"
                                placeholder="详细分享您的使用体验、优缺点、使用场景等..."
                                value={commentForm.content}
                                onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                                rows={4}
                                maxLength={1000}
                              />
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {commentForm.content.length}/1000
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="block text-sm font-medium mb-2">优点（可选）</Label>
                                <div className="space-y-2">
                                  {commentForm.pros.map((pro, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        placeholder="优点..."
                                        value={pro}
                                        onChange={(e) => {
                                          const newPros = [...commentForm.pros]
                                          newPros[index] = e.target.value
                                          setCommentForm(prev => ({ ...prev, pros: newPros }))
                                        }}
                                      />
                                      {commentForm.pros.length > 1 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newPros = commentForm.pros.filter((_, i) => i !== index)
                                            setCommentForm(prev => ({ ...prev, pros: newPros }))
                                          }}
                                        >
                                          ×
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  {commentForm.pros.length < 5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCommentForm(prev => ({ 
                                        ...prev, 
                                        pros: [...prev.pros, ''] 
                                      }))}
                                    >
                                      添加优点
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="block text-sm font-medium mb-2">缺点（可选）</Label>
                                <div className="space-y-2">
                                  {commentForm.cons.map((con, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        placeholder="缺点..."
                                        value={con}
                                        onChange={(e) => {
                                          const newCons = [...commentForm.cons]
                                          newCons[index] = e.target.value
                                          setCommentForm(prev => ({ ...prev, cons: newCons }))
                                        }}
                                      />
                                      {commentForm.cons.length > 1 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newCons = commentForm.cons.filter((_, i) => i !== index)
                                            setCommentForm(prev => ({ ...prev, cons: newCons }))
                                          }}
                                        >
                                          ×
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  {commentForm.cons.length < 5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCommentForm(prev => ({ 
                                        ...prev, 
                                        cons: [...prev.cons, ''] 
                                      }))}
                                    >
                                      添加缺点
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="useCase" className="block text-sm font-medium mb-2">
                                使用场景（可选）
                              </Label>
                              <Input
                                id="useCase"
                                placeholder="描述您主要在什么场景下使用这个工具..."
                                value={commentForm.use_case}
                                onChange={(e) => setCommentForm(prev => ({ ...prev, use_case: e.target.value }))}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="experienceLevel" className="block text-sm font-medium mb-2">
                                您的经验水平
                              </Label>
                              <Select
                                value={commentForm.experience_level}
                                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') =>
                                  setCommentForm(prev => ({ ...prev, experience_level: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">初学者</SelectItem>
                                  <SelectItem value="intermediate">中级</SelectItem>
                                  <SelectItem value="advanced">高级</SelectItem>
                                  <SelectItem value="expert">专家</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Button 
                              onClick={handleSubmitComment}
                              disabled={submittingComment || commentForm.rating === 0 || !commentForm.content.trim()}
                              className="w-full"
                            >
                              {submittingComment ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  提交中...
                                </>
                              ) : (
                                '提交评价'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 登录提示 */}
                    {!user && (
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-blue-800 font-medium">登录后即可评价</p>
                            <p className="text-blue-600 text-sm">分享您的使用体验，帮助其他用户做出选择</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button asChild size="sm">
                            <Link href="/login">立即登录</Link>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 评论列表 */}
                    {renderComments()}
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
                            <LazyImage
                              src={image.url || "/placeholder.svg?height=300&width=500"}
                              alt={image.alt || `${tool.name} 截图 ${index + 1}`}
                              className="w-full h-full hover:scale-105 transition-transform cursor-pointer"
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
                        <LazyImage
                          src={relatedTool.icon || "/placeholder.svg"}
                          alt={relatedTool.name}
                          className="w-full h-full"
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
