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

// 用户收藏工具类型
export interface UserFavorite {
  id: number
  user_id: string // UUID类型
  tool_id: number
  created_at: string
  updated_at: string
}

// 扩展AITool接口，添加收藏状态
export interface AIToolWithFavorite extends AITool {
  is_favorited?: boolean
}

// 评论相关类型定义
export interface ToolComment {
  id: number
  tool_id: number
  user_id: string // UUID类型
  parent_id?: number
  rating: number // 1-5星
  title?: string
  content: string
  pros: string[] // 优点列表
  cons: string[] // 缺点列表
  use_case?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  is_verified_user: boolean
  helpful_count: number
  reply_count: number
  status: 'active' | 'hidden' | 'deleted' | 'pending_review'
  flagged_count: number
  last_flagged_at?: string
  created_at: string
  updated_at: string
}

// 评论互动接口
export interface CommentInteraction {
  id: number
  comment_id: number
  user_id: string // UUID类型
  interaction_type: 'helpful' | 'not_helpful' | 'flag' | 'report'
  metadata?: any
  created_at: string
}

// 评论标签接口
export interface CommentTag {
  id: number
  comment_id: number
  tag_name: string
  tag_type: 'feature' | 'use_case' | 'sentiment' | 'custom'
  created_at: string
}

// 扩展的评论接口（包含用户信息和互动状态）
export interface ToolCommentWithUser extends ToolComment {
  user_email?: string
  user_name?: string
  user_avatar?: string
  helpful_votes?: number
  not_helpful_votes?: number
  user_has_voted_helpful?: boolean
  replies?: ToolCommentWithUser[]
}

// 工具评分统计接口
export interface ToolRatingStats {
  tool_id: number
  total_reviews: number
  average_rating: number
  five_star_count: number
  four_star_count: number
  three_star_count: number
  two_star_count: number
  one_star_count: number
} 
