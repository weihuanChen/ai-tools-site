"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react"
import Link from "next/link"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'logging-in'>('loading')
  const [message, setMessage] = useState('')
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取URL中的认证参数
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // 设置Supabase会话
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (error) {
            setStatus('error')
            setMessage('会话设置失败：' + error.message)
            return
          }

          if (data.session && data.user) {
            setUserData(data.user)
            setStatus('logging-in')
            setMessage('正在为您自动登录...')
            
            // 将用户信息存储到localStorage和cookie
            const userInfo = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
              email_confirmed_at: data.user.email_confirmed_at,
              created_at: data.user.created_at
            }
            
            // 存储到localStorage
            localStorage.setItem('ai-tools-user', JSON.stringify(userInfo))
            
            // 设置认证cookie
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            document.cookie = `auth-token=${userInfo.id}; expires=${expires}; path=/; SameSite=Lax`
            
            // 2秒后跳转到首页
            setTimeout(() => {
              router.push('/')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('认证会话无效，请重新注册。')
          }
        } else {
          // 如果没有token参数，尝试获取当前会话
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            setStatus('error')
            setMessage('认证失败：' + error.message)
            return
          }

          if (data.session && data.session.user) {
            setUserData(data.session.user)
            setStatus('success')
            setMessage('邮箱确认成功！您的账户已激活。')
            
            // 3秒后自动跳转到首页
            setTimeout(() => {
              router.push('/')
            }, 3000)
          } else {
            setStatus('error')
            setMessage('认证会话无效，请重新注册。')
          }
        }
      } catch (error) {
        console.error('认证回调错误:', error)
        setStatus('error')
        setMessage('处理认证回调时发生错误。')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 头部 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI工具集</h1>
          <p className="text-gray-600">邮箱确认</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {status === 'loading' && '正在处理...'}
              {status === 'success' && '认证成功'}
              {status === 'logging-in' && '自动登录中'}
              {status === 'error' && '认证失败'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && '请稍候，我们正在处理您的认证请求'}
              {status === 'success' && '您的邮箱已成功确认'}
              {status === 'logging-in' && '正在为您设置登录状态'}
              {status === 'error' && '认证过程中遇到了问题'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {status === 'loading' && (
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === 'logging-in' && (
                <UserCheck className="w-16 h-16 text-blue-500 animate-pulse" />
              )}
              {status === 'error' && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            
            <div className="text-center">
              <p className={`text-sm ${
                status === 'success' ? 'text-green-600' : 
                status === 'logging-in' ? 'text-blue-600' :
                status === 'error' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {message}
              </p>
              
              {userData && status === 'logging-in' && (
                <p className="text-xs text-gray-500 mt-2">
                  欢迎回来，{userData.user_metadata?.name || userData.email?.split('@')[0]}！
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => router.push('/')} 
                className="flex-1" 
                variant={status === 'success' || status === 'logging-in' ? 'default' : 'outline'}
              >
                返回首页
              </Button>
              {status === 'error' && (
                <Button 
                  onClick={() => router.push('/register')} 
                  variant="outline"
                >
                  重新注册
                </Button>
              )}
            </div>

            {status === 'success' && (
              <div className="text-xs text-gray-500 text-center">
                <p>3秒后自动跳转到首页</p>
              </div>
            )}
            
            {status === 'logging-in' && (
              <div className="text-xs text-gray-500 text-center">
                <p>2秒后自动跳转到首页</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
