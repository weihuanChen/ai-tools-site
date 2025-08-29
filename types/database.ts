// 数据库表类型定义

// 预览图片类型
export interface PreviewImage {
  id: string
  url: string
  filename: string
  alt: string
  description?: string
  sort_order: number
  size: number
  width: number
  height: number
  uploaded_at: string
}

export interface ToolCategory {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AITool {
  id: number
  name: string
  slug: string
  description: string
  short_description: string | null
  category_id: number
  icon: string | null
  website_url: string | null
  features: any | null
  tags: any | null
  preview_images: PreviewImage[] // 预览图片
  rating_count: number
  view_count: number
  favorite_count: number
  is_featured: boolean
  is_new: boolean
  status: 'active' | 'inactive' | 'deleted'
  submitted_by: string // UUID类型
  approved_by: string | null // UUID类型
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface ToolSubmission {
  id: number
  user_id: string // UUID类型
  tool_name: string
  slug: string // URL标识符
  description: string
  category_id: number
  website_url: string | null
  icon_path: string | null
  features: any | null
  tags: any | null
  preview_images: PreviewImage[] // 预览图片
  status: 'pending' | 'approved' | 'rejected'
  review_notes: string | null
  reject_reason: string | null
  reviewed_by: string | null // UUID类型
  reviewed_at: string | null
  approved_tool_id: number | null
  created_at: string
  updated_at: string
}

// 侧边栏分类项类型
export interface SidebarCategory {
  id: string
  name: string
  icon: string | null
}

// 表单分类项类型（包含数据库ID）
export interface FormCategory {
  id: number
  name: string
  slug: string
  icon: string | null
} 
