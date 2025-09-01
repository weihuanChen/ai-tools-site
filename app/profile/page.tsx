"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"


import { Plus, Clock, CheckCircle, XCircle, Edit, Star, Eye, Calendar, ArrowLeft, Settings, Heart, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { getUserFavorites, removeFromFavorites } from "@/lib/tools"
import { AITool } from "@/types/database"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")


  // 真实数据状态
  const [submissions, setSubmissions] = useState<any[]>([])
  const [favorites, setFavorites] = useState<AITool[]>([])
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    approvedTools: 0,
    totalViews: 0,
    totalFavorites: 0,
  })
  const [loading, setLoading] = useState(true)
  const [favoritesLoading, setFavoritesLoading] = useState(false)

  // 获取用户提交记录
  useEffect(() => {
    if (user) {
      fetchUserSubmissions()
      fetchUserFavorites()
    }
  }, [user])

  const fetchUserSubmissions = async () => {
    try {
      setLoading(true)
      
      // 获取用户提交记录
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('tool_submissions')
        .select(`
          *,
          tool_categories(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (submissionsError) {
        console.error('获取提交记录失败:', submissionsError)
        return
      }

      setSubmissions(submissionsData || [])

      // 计算统计数据
      const totalSubmissions = submissionsData?.length || 0
      const approvedTools = submissionsData?.filter(s => s.status === 'approved').length || 0
      
      // 获取已通过工具的总浏览量
      let totalViews = 0
      if (approvedTools > 0) {
        const approvedSubmissionIds = submissionsData
          ?.filter(s => s.status === 'approved')
          .map(s => s.approved_tool_id)
          .filter(Boolean) || []

        if (approvedSubmissionIds.length > 0) {
          const { data: toolsData } = await supabase
            .from('ai_tools')
            .select('view_count')
            .in('id', approvedSubmissionIds)

          totalViews = toolsData?.reduce((sum, tool) => sum + (tool.view_count || 0), 0) || 0
        }
      }

      setStats(prev => ({
        ...prev,
        totalSubmissions,
        approvedTools,
        totalViews,
      }))

    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserFavorites = async () => {
    if (!user) return

    try {
      setFavoritesLoading(true)
      const favoritesData = await getUserFavorites(user.id)
      setFavorites(favoritesData)
      
      setStats(prev => ({
        ...prev,
        totalFavorites: favoritesData.length,
      }))
    } catch (error) {
      console.error('获取收藏失败:', error)
    } finally {
      setFavoritesLoading(false)
    }
  }

  // 取消收藏
  const handleRemoveFavorite = async (toolId: number) => {
    if (!user) return

    try {
      const success = await removeFromFavorites(user.id, toolId)
      if (success) {
        // 从本地状态中移除
        setFavorites(prev => prev.filter(tool => tool.id !== toolId))
        setStats(prev => ({
          ...prev,
          totalFavorites: prev.totalFavorites - 1,
        }))
        toast({
          title: "已取消收藏",
          description: "工具已从收藏夹中移除",
        })
      } else {
        toast({
          title: "操作失败",
          description: "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
      toast({
        title: "操作失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

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
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.role === "admin" && <Badge className="bg-purple-100 text-purple-800">管理员</Badge>}
              </div>
              <p className="text-gray-600 mb-4">热爱AI技术的开发者，致力于分享优质AI工具</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📧 {user.email}</span>
                <span>📍 地球</span>
                <span>🌐 https://example.com 后续开放个人网址，敬请期待</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="submissions">我的提交</TabsTrigger>
            <TabsTrigger value="favorites">收藏夹</TabsTrigger>
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
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{stats.approvedTools}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">总浏览量</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalFavorites}</p>
                      <p className="text-sm text-gray-600">收藏工具</p>
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
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.slice(0, 3).map((submission) => (
                      <div key={submission.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={submission.icon_path || "/placeholder.svg"}
                            alt={submission.tool_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{submission.tool_name}</h4>
                          <p className="text-sm text-gray-600">{submission.short_description || submission.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(submission.status)}
                          {getStatusBadge(submission.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(submission.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>暂无提交记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">我的工具提交</h2>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push('/submit')}
              >
                <Plus className="w-4 h-4 mr-2" />
                提交新工具
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">加载中...</p>
              </div>
            ) : submissions.length > 0 ? (
              <div className="grid gap-4">
                {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={submission.icon_path || "/placeholder.svg"}
                            alt={submission.tool_name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{submission.tool_name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{submission.short_description || submission.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {submission.tool_categories?.name || '未知分类'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            {getStatusBadge(submission.status)}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mt-4">
                                                      <span>提交时间: {new Date(submission.created_at).toLocaleDateString('zh-CN')}</span>
                            {submission.status === "approved" && submission.approved_tool_id && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  N/A 浏览
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  N/A 评分
                                </span>
                              </>
                            )}
                        </div>

                        {submission.status === "rejected" && submission.reject_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>拒绝原因:</strong> {submission.reject_reason}
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
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Plus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">还没有提交过工具</p>
                <p className="text-sm mb-4">开始分享您发现的优质AI工具吧</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push('/submit')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  提交第一个工具
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>收藏的工具</CardTitle>
                <CardDescription>您收藏的AI工具列表</CardDescription>
              </CardHeader>
              <CardContent>
                {favoritesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="grid gap-4">
                    {favorites.map((tool) => (
                      <Card key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                 <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                             <img
                               src={tool.icon || "/placeholder.svg"}
                               alt={tool.name}
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div>
                             <h4 className="font-medium text-gray-900">{tool.name}</h4>
                             <p className="text-sm text-gray-600">{tool.short_description}</p>
                             <Badge variant="secondary" className="text-xs mt-1">
                               {(tool as any).tool_categories?.name || '未知分类'}
                             </Badge>
                           </div>
                         </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFavorite(tool.id)}
                            className="text-red-600 hover:text-red-800"
                            title="取消收藏"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                                                     <Button
                             variant="outline"
                             size="sm"
                             asChild
                             className="text-blue-600 hover:text-blue-800"
                             title="查看详情"
                           >
                             <Link href={`/tool/${tool.id}`}>
                               <Eye className="w-4 h-4" />
                             </Link>
                           </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>您还没有收藏任何工具</p>
                    <p className="text-sm">浏览工具时点击收藏按钮来添加到这里</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
