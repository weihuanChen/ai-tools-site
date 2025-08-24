import { useState, useEffect } from 'react'
import { SidebarCategory } from '@/types/database'
import { getCategoriesForSidebar } from '@/lib/categories'

export function useCategories() {
  const [categories, setCategories] = useState<SidebarCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCategoriesForSidebar()
        setCategories(data)
      } catch (err) {
        console.error('获取分类数据失败:', err)
        setError('获取分类数据失败')
        // 如果获取失败，使用默认数据
        setCategories([
          { id: "writing", name: "AI写作工具", icon: null },
          { id: "image", name: "AI图像工具", icon: null },
          { id: "video", name: "AI视频工具", icon: null },
          { id: "office", name: "AI办公工具", icon: null },
          { id: "programming", name: "AI编程工具", icon: null },
          { id: "chat", name: "AI聊天助手", icon: null },
          { id: "search", name: "AI搜索引擎", icon: null },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const refreshCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCategoriesForSidebar()
      setCategories(data)
    } catch (err) {
      console.error('刷新分类数据失败:', err)
      setError('刷新分类数据失败')
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    refreshCategories
  }
} 
