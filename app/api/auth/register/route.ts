import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 用户数据存储（在实际项目中应该使用数据库）
let users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: '管理员',
    role: 'user' as const,
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

// 验证注册请求的schema
const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(2, '用户名至少2位').max(20, '用户名最多20位'),
  verificationCode: z.string().length(6, '验证码必须是6位数字')
})

// 模拟验证码存储（实际项目中应该使用Redis或数据库）
const verificationCodes = new Map<string, { code: string; expires: number }>()

// 验证验证码
const verifyCode = (email: string, code: string): boolean => {
  const stored = verificationCodes.get(email)
  if (!stored) return false
  
  // 检查是否过期（10分钟）
  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    return false
  }
  
  // 检查验证码是否匹配
  if (stored.code !== code) return false
  
  // 验证成功后删除验证码
  verificationCodes.delete(email)
  return true
}

// 存储验证码（供发送验证码API使用）
export const storeVerificationCode = (email: string, code: string) => {
  verificationCodes.set(email, {
    code,
    expires: Date.now() + 10 * 60 * 1000 // 10分钟后过期
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { email, password, name, verificationCode } = validationResult.data

    // 检查邮箱是否已存在
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 验证验证码
    if (!verifyCode(email, verificationCode)) {
      return NextResponse.json(
        { error: '验证码错误或已过期，请重新获取' },
        { status: 400 }
      )
    }

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // 实际项目中应该加密存储
      name,
      role: 'user' as const,
      avatar: `/placeholder.svg?height=40&width=40&text=${name.charAt(0).toUpperCase()}`
    }

    // 添加到用户列表（实际项目中应该保存到数据库）
    users.push(newUser)

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: '注册成功'
    })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
