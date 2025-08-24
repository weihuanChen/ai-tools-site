import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 需要认证的路由
const protectedRoutes = ['/profile']
// 已认证用户不能访问的路由
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查用户是否已认证
  // 由于中间件在服务器端运行，无法直接访问localStorage
  // 我们通过检查Authorization header或特殊的认证cookie来判断
  const isAuthenticated = request.headers.get('authorization')?.startsWith('Bearer ') ||
                         request.cookies.has('ai-tools-auth') ||
                         request.cookies.has('auth-token')

  // 如果访问受保护的路由但未认证，重定向到登录页
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 如果已认证用户访问登录/注册页，重定向到首页
  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
