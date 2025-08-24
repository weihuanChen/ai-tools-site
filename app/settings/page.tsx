"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, User, Mail, Shield, Edit, Save, X, LogOut } from "lucide-react"

export default function SettingsPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || "")
  const [isSaving, setIsSaving] = useState(false)

  // 如果用户未登录，重定向到登录页
  if (!isLoading && !user) {
    router.push('/login')
    return null
  }

  const handleSave = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      return
    }

    setIsSaving(true)
    // 这里可以调用API更新用户信息
    // 暂时只是模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地状态
    if (user) {
      user.name = editName.trim()
    }
    
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditName(user?.name || "")
    setIsEditing(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">账户设置</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：用户信息卡片 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">角色</span>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：详细信息 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>管理您的账户信息</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 用户名 */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    用户名
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="请输入用户名"
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={isSaving || !editName.trim() || editName.trim().length < 2}
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-900 py-2">{user.name}</p>
                  )}
                </div>

                {/* 邮箱 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    邮箱地址
                  </Label>
                  <p className="text-gray-900 py-2">{user.email}</p>
                  <p className="text-sm text-gray-500">邮箱地址不可修改</p>
                </div>

                {/* 账户状态 */}
                <div className="space-y-2">
                  <Label>账户状态</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600">活跃</span>
                  </div>
                </div>

                {/* 注册时间 */}
                <div className="space-y-2">
                  <Label>注册时间</Label>
                  <p className="text-gray-900 py-2">
                    {new Date().toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 安全设置卡片 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>安全设置</CardTitle>
                <CardDescription>管理您的账户安全</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">密码</h4>
                    <p className="text-sm text-gray-500">上次更新：从未</p>
                  </div>
                  <Button variant="outline" size="sm">
                    修改密码
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">两步验证</h4>
                    <p className="text-sm text-gray-500">未启用</p>
                  </div>
                  <Button variant="outline" size="sm">
                    启用
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
