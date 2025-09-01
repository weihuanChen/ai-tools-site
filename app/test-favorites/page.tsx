"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { addToFavorites, removeFromFavorites, getUserFavorites } from "@/lib/tools"
import { AITool } from "@/types/database"
import { Heart, Loader2 } from "lucide-react"

export default function TestFavoritesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<AITool[]>([])
  const [loading, setLoading] = useState(false)
  const [testToolId] = useState(1) // 测试用的工具ID

  // 测试添加收藏
  const testAddFavorite = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能测试收藏功能",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const success = await addToFavorites(user.id, testToolId)
      
      if (success) {
        toast({
          title: "测试成功",
          description: "收藏功能正常工作",
        })
        // 刷新收藏列表
        await loadFavorites()
      } else {
        toast({
          title: "测试失败",
          description: "收藏功能存在问题",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('测试收藏失败:', error)
      toast({
        title: "测试异常",
        description: "请检查控制台错误信息",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试取消收藏
  const testRemoveFavorite = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "登录后才能测试收藏功能",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const success = await removeFromFavorites(user.id, testToolId)
      
      if (success) {
        toast({
          title: "测试成功",
          description: "取消收藏功能正常工作",
        })
        // 刷新收藏列表
        await loadFavorites()
      } else {
        toast({
          title: "测试失败",
          description: "取消收藏功能存在问题",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('测试取消收藏失败:', error)
      toast({
        title: "测试异常",
        description: "请检查控制台错误信息",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载收藏列表
  const loadFavorites = async () => {
    if (!user) return

    try {
      const favoritesData = await getUserFavorites(user.id)
      setFavorites(favoritesData)
    } catch (error) {
      console.error('加载收藏失败:', error)
    }
  }

  // 页面加载时获取收藏列表
  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">请先登录以测试收藏功能</p>
            <Button asChild>
              <a href="/login">立即登录</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>收藏功能测试页面</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={testAddFavorite}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                测试添加收藏 (工具ID: {testToolId})
              </Button>

              <Button
                onClick={testRemoveFavorite}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                测试取消收藏 (工具ID: {testToolId})
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>当前用户ID: {user.id}</p>
              <p>测试工具ID: {testToolId}</p>
              <p>收藏数量: {favorites.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>当前收藏列表</CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-2">
                {favorites.map((tool) => (
                  <div key={tool.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={tool.icon || "/placeholder.svg"}
                          alt={tool.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-gray-600">ID: {tool.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无收藏的工具</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>调试信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>用户信息:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
              
              <p><strong>收藏函数状态:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>addToFavorites: {typeof addToFavorites}</li>
                <li>removeFromFavorites: {typeof removeFromFavorites}</li>
                <li>getUserFavorites: {typeof getUserFavorites}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
