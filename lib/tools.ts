import { supabase } from './supabase'
import { AITool } from '@/types/database'

// 获取推荐工具
export async function getFeaturedTools(): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .eq('is_featured', true)
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(6)

    if (error) {
      console.error('获取推荐工具失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取推荐工具异常:', error)
    return []
  }
}

// 获取最新工具
export async function getLatestTools(): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('获取最新工具失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取最新工具异常:', error)
    return []
  }
}

// 根据分类获取工具
export async function getToolsByCategory(categorySlug: string): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .eq('tool_categories.slug', categorySlug)
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(10)

    if (error) {
      console.error(`获取${categorySlug}分类工具失败:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`获取${categorySlug}分类工具异常:`, error)
    return []
  }
}

// 获取所有分类的工具（用于首页展示）
export async function getAllCategoryTools(): Promise<Record<string, AITool[]>> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .eq('status', 'active')
      .order('view_count', { ascending: false })

    if (error) {
      console.error('获取所有分类工具失败:', error)
      return {}
    }

    // 按分类分组
    const toolsByCategory: Record<string, AITool[]> = {}
    data?.forEach(tool => {
      const categorySlug = (tool as any).tool_categories.slug
      if (!toolsByCategory[categorySlug]) {
        toolsByCategory[categorySlug] = []
      }
      toolsByCategory[categorySlug].push(tool)
    })

    return toolsByCategory
  } catch (error) {
    console.error('获取所有分类工具异常:', error)
    return {}
  }
}

// 搜索工具
export async function searchTools(query: string): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags::text.ilike.%${query}%`)
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(20)

    if (error) {
      console.error('搜索工具失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('搜索工具异常:', error)
    return []
  }
}

// 增加工具浏览次数
export async function incrementToolViewCount(toolId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('ai_tools')
      .update({ view_count: supabase.rpc('increment') })
      .eq('id', toolId)

    if (error) {
      console.error('增加工具浏览次数失败:', error)
    }
  } catch (error) {
    console.error('增加工具浏览次数异常:', error)
  }
}
