"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Clock, CheckCircle, XCircle, Edit, Upload, Star, Eye, Calendar, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

// Mock data for user submissions
const mockSubmissions = [
  {
    id: 1,
    name: "AI写作助手Pro",
    description: "专业的AI写作工具，支持多种文体创作",
    category: "AI写作工具",
    status: "approved",
    submittedAt: "2024-01-15",
    views: 1250,
    rating: 4.6,
    icon: "/ai-writing-pro-icon.png",
  },
  {
    id: 2,
    name: "智能图片编辑器",
    description: "基于AI的图片编辑和优化工具",
    category: "AI图像工具",
    status: "pending",
    submittedAt: "2024-01-20",
    views: 0,
    rating: 0,
    icon: "/ai-image-editor-icon.png",
  },
  {
    id: 3,
    name: "代码生成器",
    description: "AI驱动的代码自动生成工具",
    category: "AI编程工具",
    status: "rejected",
    submittedAt: "2024-01-10",
    views: 0,
    rating: 0,
    icon: "/ai-code-generator-icon.png",
    rejectReason: "工具描述不够详细，请补充更多功能说明",
  },
]

const mockStats = {
  totalSubmissions: 3,
  approvedTools: 1,
  pendingReview: 1,
  totalViews: 1250,
  averageRating: 4.6,
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "热爱AI技术的开发者，致力于分享优质AI工具",
    website: "https://example.com",
    location: "北京",
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">请先登录以访问个人中心</p>
            <Button asChild>
              <Link href="/login">立即登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">已通过</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">审核中</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">已拒绝</Badge>
      default:
        return <Badge variant="secondary">未知</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI工具集</h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Settings className="w-4 h-4" />
              设置
            </Link>
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.role === "admin" && <Badge className="bg-purple-100 text-purple-800">管理员</Badge>}
              </div>
              <p className="text-gray-600 mb-4">{profileData.bio}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📧 {user.email}</span>
                <span>📍 {profileData.location}</span>
                <span>🌐 {profileData.website}</span>
              </div>
            </div>

            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              编辑资料
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="submissions">我的提交</TabsTrigger>
            <TabsTrigger value="favorites">收藏夹</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.totalSubmissions}</p>
                      <p className="text-sm text-gray-600">总提交数</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.approvedTools}</p>
                      <p className="text-sm text-gray-600">已通过工具</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">总浏览量</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{mockStats.averageRating}</p>
                      <p className="text-sm text-gray-600">平均评分</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
                <CardDescription>您最近的工具提交和活动记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSubmissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={submission.icon || "/placeholder.svg"}
                          alt={submission.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{submission.name}</h4>
                        <p className="text-sm text-gray-600">{submission.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        {getStatusBadge(submission.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {submission.submittedAt}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">我的工具提交</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                提交新工具
              </Button>
            </div>

            <div className="grid gap-4">
              {mockSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={submission.icon || "/placeholder.svg"}
                          alt={submission.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{submission.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{submission.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {submission.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                          <span>提交时间: {submission.submittedAt}</span>
                          {submission.status === "approved" && (
                            <>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {submission.views} 浏览
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {submission.rating} 评分
                              </span>
                            </>
                          )}
                        </div>

                        {submission.status === "rejected" && submission.rejectReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>拒绝原因:</strong> {submission.rejectReason}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submission.status === "pending" || submission.status === "rejected"}
                          className={
                            submission.status === "pending" || submission.status === "rejected"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                          title={
                            submission.status === "pending"
                              ? "审核中的工具不允许编辑"
                              : submission.status === "rejected"
                                ? "已拒绝的工具不允许编辑"
                                : "编辑工具信息"
                          }
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        {submission.status === "approved" && (
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>收藏的工具</CardTitle>
                <CardDescription>您收藏的AI工具列表</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>您还没有收藏任何工具</p>
                  <p className="text-sm">浏览工具时点击收藏按钮来添加到这里</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>管理您的个人资料信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">用户名</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱地址</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">个人网站</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">所在地</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setIsEditing(false)}>保存更改</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      取消
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>头像设置</CardTitle>
                <CardDescription>上传或更改您的头像</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    上传新头像
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
