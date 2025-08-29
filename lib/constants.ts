// 工具标签配置
export const TOOL_TAGS = [
  { value: 'free', label: '免费', color: 'bg-green-100 text-green-800' },
  { value: 'paid', label: '付费', color: 'bg-blue-100 text-blue-800' },
  { value: 'freemium', label: '免费增值', color: 'bg-purple-100 text-purple-800' },
  { value: 'api', label: 'API接口', color: 'bg-orange-100 text-orange-800' },
  { value: 'mobile', label: '移动端', color: 'bg-pink-100 text-pink-800' },
  { value: 'desktop', label: '桌面端', color: 'bg-gray-100 text-gray-800' },
  { value: 'web', label: '网页版', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'open-source', label: '开源', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'enterprise', label: '企业版', color: 'bg-red-100 text-red-800' },
  { value: 'personal', label: '个人版', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'collaboration', label: '协作', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'automation', label: '自动化', color: 'bg-slate-100 text-slate-800' },
  { value: 'analytics', label: '数据分析', color: 'bg-rose-100 text-rose-800' },
  { value: 'security', label: '安全', color: 'bg-amber-100 text-amber-800' },
  { value: 'multilingual', label: '多语言', color: 'bg-lime-100 text-lime-800' },
  { value: 'real-time', label: '实时', color: 'bg-teal-100 text-teal-800' }
] as const

// 工具状态
export const TOOL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
} as const

// 提交状态
export const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

// 文件上传限制
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_LOGO_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_FEATURES: 6,
  MAX_TAGS: 6,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
} as const

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const
