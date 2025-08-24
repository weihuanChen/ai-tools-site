import { jwtDecode } from 'jwt-decode'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin'
  email_confirmed_at?: string
  created_at?: string
}

export interface AuthToken {
  user: User
  exp: number
  iat: number
}

// 生成简单的JWT token（实际项目中应使用专业的JWT库）
export function generateToken(user: User): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    user,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时后过期
    iat: Math.floor(Date.now() / 1000)
  }))
  const signature = btoa('mock-signature') // 实际项目中应该是真实的签名
  
  return `${header}.${payload}.${signature}`
}

// 验证token
export function verifyToken(token: string): User | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    
    return payload.user
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// 从localStorage获取用户信息
export function getUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem('ai-tools-user')
    if (!stored) return null
    
    const data = JSON.parse(stored)
    
    // 检查是否过期
    if (data.expires && new Date(data.expires) < new Date()) {
      localStorage.removeItem('ai-tools-user')
      return null
    }
    
    return data.user
  } catch (error) {
    console.error('Error getting user from storage:', error)
    localStorage.removeItem('ai-tools-user')
    return null
  }
}

// 设置用户信息到localStorage
export function setUserToStorage(user: User): void {
  const sessionData = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
  }
  localStorage.setItem('ai-tools-user', JSON.stringify(sessionData))
}

// 清除用户信息
export function clearUserFromStorage(): void {
  localStorage.removeItem('ai-tools-user')
}

// 检查用户是否有特定权限
export function hasPermission(user: User | null, requiredRole: 'user' | 'admin'): boolean {
  if (!user) return false
  
  if (requiredRole === 'admin') {
    return user.role === 'admin'
  }
  
  return true // 普通用户权限
}

// 格式化用户头像
export function getUserAvatar(user: User): string {
  if (user.avatar) return user.avatar
  
  // 如果没有头像，生成基于用户名的头像
  const initials = user.name.charAt(0).toUpperCase()
  return `/placeholder.svg?height=40&width=40&text=${initials}`
}
