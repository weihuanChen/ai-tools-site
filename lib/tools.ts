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
    // 先获取当前浏览次数
    const { data: currentTool, error: fetchError } = await supabase
      .from('ai_tools')
      .select('view_count')
      .eq('id', toolId)
      .single()

    if (fetchError) {
      console.error('获取工具浏览次数失败:', fetchError)
      return
    }

    // 更新浏览次数
    const { error: updateError } = await supabase
      .from('ai_tools')
      .update({ view_count: (currentTool?.view_count || 0) + 1 })
      .eq('id', toolId)

    if (updateError) {
      console.error('增加工具浏览次数失败:', updateError)
    }
  } catch (error) {
    console.error('增加工具浏览次数异常:', error)
  }
}

// 获取单个工具详情
export async function getToolById(id: number): Promise<AITool | null> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug, description)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('获取工具详情失败:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('获取工具详情异常:', error)
    return null
  }
}

// 获取相关工具（同分类的其他工具）
export async function getRelatedTools(categoryId: number, excludeId: number, limit: number = 3): Promise<AITool[]> {
  try {
    const { data, error } = await supabase
      .from('ai_tools')
      .select(`
        *,
        tool_categories!inner(name, slug)
      `)
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .eq('status', 'active')
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取相关工具失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取相关工具异常:', error)
    return []
  }
}
