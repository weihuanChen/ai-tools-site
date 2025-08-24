"use client"

import { useState } from "react"
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
} from "lucide-react"

// Mock tool data
const mockTool = {
  id: 1,
  name: "豆包",
  description: "字节跳动推出的AI智能助手，支持多轮对话、文档分析、代码生成等多种功能",
  longDescription: `# 豆包 - 字节跳动AI智能助手

## 产品概述

豆包是字节跳动开发的新一代AI智能助手，基于先进的大语言模型技术，能够进行自然流畅的对话交流。它不仅支持日常聊天，还能协助用户进行文档分析、代码编写、创意写作、学习辅导等多种任务。

## 核心特性

### 🤖 智能对话
- **多轮对话**: 支持连续对话，理解上下文
- **自然语言**: 理解人类自然表达，无需特定指令
- **个性化**: 根据用户习惯调整回复风格

### 📚 文档分析
- **文档上传**: 支持PDF、Word、TXT等多种格式
- **智能总结**: 自动提取关键信息和要点
- **问答功能**: 针对文档内容进行深度问答

### 💻 代码生成
- **多语言支持**: Python、JavaScript、Java、Go等
- **代码解释**: 详细解释代码逻辑和功能
- **调试建议**: 提供代码优化和错误修复建议

### ✍️ 创意写作
- **文章创作**: 协助撰写各类文章和内容
- **风格调整**: 支持不同写作风格和语调
- **创意激发**: 提供写作灵感和思路

## 技术优势

- **大模型技术**: 基于最新的GPT架构
- **持续学习**: 模型不断优化和更新
- **安全可靠**: 多重安全防护机制
- **隐私保护**: 严格的数据隐私保护

## 使用场景

### 个人用户
- 日常问答和聊天
- 学习辅导和知识获取
- 创意写作和内容创作

### 专业用户
- 程序员代码辅助
- 研究人员文档分析
- 内容创作者写作支持

### 企业应用
- 客服自动化
- 文档智能处理
- 知识库构建

## 定价策略

- **免费版**: 基础功能，每日限额
- **专业版**: 完整功能，无使用限制
- **企业版**: 定制化服务，API接口

## 更新日志

### v2.1.0 (2024-01-20)
- 新增代码生成功能
- 优化文档分析算法
- 提升对话响应速度

### v2.0.0 (2024-01-15)
- 全新界面设计
- 增强多轮对话能力
- 支持更多文档格式

## 用户反馈

> "豆包是我用过最好的AI助手，特别是代码生成功能，大大提高了我的开发效率。" - 张工程师

> "文档分析功能太棒了！能快速提取关键信息，节省了大量时间。" - 李研究员

> "界面友好，功能强大，是学习和工作的好帮手。" - 王学生`,
  icon: "/ai-chat-assistant-icon.png",
  category: "AI写作工具",
  subcategory: "智能对话",
  rating: 4.8,
  reviewCount: 1250,
  users: "100万+",
  website: "https://www.doubao.com",
  pricing: "免费",
  features: ["多轮智能对话", "文档分析与总结", "代码生成与调试", "创意写作辅助", "学习问答", "多语言支持"],
  screenshots: ["/tool-screenshot-1.png", "/tool-screenshot-2.png", "/tool-screenshot-3.png"],
  tags: ["对话AI", "文档分析", "代码生成", "写作助手", "免费"],
  publishedAt: "2024-01-15",
  updatedAt: "2024-01-20",
  developer: {
    name: "字节跳动",
    avatar: "/bytedance-logo.png",
    verified: true,
  },
  stats: {
    views: 15420,
    favorites: 892,
    shares: 156,
  },
}

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    user: {
      name: "张三",
      avatar: "/user-avatar-1.png",
    },
    rating: 5,
    content: "非常好用的AI助手，回答问题很准确，界面也很友好。特别是代码生成功能，大大提高了我的工作效率。",
    date: "2024-01-18",
    helpful: 23,
    unhelpful: 2,
  },
  {
    id: 2,
    user: {
      name: "李四",
      avatar: "/user-avatar-2.png",
    },
    rating: 4,
    content: "整体体验不错，对话很自然。不过有时候对复杂问题的理解还有待提升。",
    date: "2024-01-16",
    helpful: 15,
    unhelpful: 1,
  },
  {
    id: 3,
    user: {
      name: "王五",
      avatar: "/user-avatar-3.png",
    },
    rating: 5,
    content: "文档分析功能太棒了！能快速提取关键信息，节省了大量时间。强烈推荐！",
    date: "2024-01-14",
    helpful: 31,
    unhelpful: 0,
  },
]

// Mock related tools
const relatedTools = [
  {
    id: 2,
    name: "即梦AI",
    description: "AI视频生成工具",
    icon: "/placeholder-plb3q.png",
    category: "AI视频工具",
    rating: 4.6,
  },
  {
    id: 3,
    name: "TRAE编程",
    description: "AI编程助手",
    icon: "/ai-programming-assistant-icon.png",
    category: "AI编程工具",
    rating: 4.7,
  },
  {
    id: 4,
    name: "AIPPT",
    description: "AI生成PPT工具",
    icon: "/ai-presentation-tool-icon.png",
    category: "AI办公工具",
    rating: 4.5,
  },
]

export default function ToolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [newReview, setNewReview] = useState("")
  const [userRating, setUserRating] = useState(0)

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
              <Link href={`/category/${mockTool.category}`} className="hover:text-blue-600">
                {mockTool.category}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{mockTool.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={mockTool.icon || "/placeholder.svg"}
                alt={mockTool.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{mockTool.name}</h1>
                    <Badge className="bg-blue-100 text-blue-800">{mockTool.category}</Badge>
                    {mockTool.pricing === "免费" && <Badge className="bg-green-100 text-green-800">免费</Badge>}
                  </div>
                  <p className="text-gray-600 text-lg mb-3">{mockTool.description}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      {renderStars(mockTool.rating)}
                      <span className="font-medium">{mockTool.rating}</span>
                      <span className="text-gray-500">({mockTool.reviewCount} 评价)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{mockTool.users} 用户</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>更新于 {mockTool.updatedAt}</span>
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
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                  <Button asChild>
                    <a href={mockTool.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      访问工具
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {mockTool.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="features">功能特性</TabsTrigger>
                <TabsTrigger value="screenshots">截图展示</TabsTrigger>
                <TabsTrigger value="reviews">用户评价</TabsTrigger>
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
                        {mockTool.longDescription}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>开发者信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={mockTool.developer.avatar || "/placeholder.svg"}
                          alt={mockTool.developer.name}
                        />
                        <AvatarFallback>{mockTool.developer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{mockTool.developer.name}</h4>
                          {mockTool.developer.verified && <Shield className="w-4 h-4 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600">认证开发者</p>
                      </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockTool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{feature}</span>
                        </div>
                      ))}
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockTool.screenshots.map((screenshot, index) => (
                        <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={screenshot || "/placeholder.svg?height=300&width=500"}
                            alt={`${mockTool.name} 截图 ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
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
                      {mockReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h5 className="font-medium text-gray-900">{review.user.name}</h5>
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-gray-700 mb-3">{review.content}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-green-600">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>有用 ({review.helpful})</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-red-600">
                                  <ThumbsDown className="w-4 h-4" />
                                  <span>无用 ({review.unhelpful})</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>回复</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Tools */}
            <Card>
              <CardHeader>
                <CardTitle>相关工具</CardTitle>
                <CardDescription>您可能感兴趣的其他AI工具</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={tool.icon || "/placeholder.svg"}
                        alt={tool.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{tool.name}</h4>
                      <p className="text-xs text-gray-600">{tool.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(tool.rating)}
                        <span className="text-xs text-gray-500">{tool.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

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
