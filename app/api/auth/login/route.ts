import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 用户数据存储（在实际项目中应该使用数据库）
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123', // 实际项目中应该使用加密密码
    name: '管理员',
    role: 'admin' as const,
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    name: '普通用户',
    role: 'user' as const,
    avatar: '/placeholder-user.jpg'
  }
]

// 验证登录请求的schema
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '密码不能为空')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // 查找用户
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 创建用户会话（不包含密码）
    const { password: _, ...userWithoutPassword } = user
    
    // 在实际项目中，这里应该生成JWT token或设置session
    const session = {
      user: userWithoutPassword,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    }

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '登录成功'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
