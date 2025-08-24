import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 存储bucket配置
export const STORAGE_BUCKETS = {
  CATEGORY_ICONS: 'category-icons',
  TOOL_LOGOS: 'tool-logos',
  TOOL_PREVIEWS: 'tool-previews'
} as const 
