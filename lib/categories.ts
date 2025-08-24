import { supabase } from './supabase'
import { ToolCategory, SidebarCategory } from '@/types/database'

// 获取所有激活的分类
export async function getActiveCategories(): Promise<ToolCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tool_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('获取分类失败:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('获取分类异常:', error)
    return []
  }
}

// 获取分类数据（简化版，不包含工具数量）
export async function getCategoriesForSidebar(): Promise<SidebarCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tool_categories')
      .select('id, name, slug, icon')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('获取分类失败:', error)
      return []
    }

    // 转换为侧边栏需要的格式
    return (data || []).map(category => ({
      id: category.slug,
      name: category.name,
      icon: category.icon
    }))
  } catch (error) {
    console.error('获取分类异常:', error)
    return []
  }
}

// 获取单个分类的工具数量（保留此函数以备将来使用）
export async function getCategoryToolCount(categoryId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('ai_tools')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('status', 'active')

    if (error) {
      console.error('获取分类工具数量失败:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('获取分类工具数量异常:', error)
    return 0
  }
}

// 获取所有分类（包含工具数量）- 保留以备将来使用
export async function getAllCategoriesWithCounts(): Promise<SidebarCategory[]> {
  try {
    // 获取所有激活的分类
    const categories = await getActiveCategories()
    
    // 为每个分类获取工具数量
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await getCategoryToolCount(category.id)
        return {
          id: category.slug,
          name: category.name,
          icon: category.icon,
          count,
          hasSubmenu: false // 可以根据需要设置
        }
      })
    )

    return categoriesWithCounts
  } catch (error) {
    console.error('获取所有分类及数量异常:', error)
    return []
  }
}
