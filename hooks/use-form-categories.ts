import { useState, useEffect } from 'react'
import { FormCategory } from '@/types/database'
import { getCategoriesForForm } from '@/lib/categories'

export function useFormCategories() {
  const [categories, setCategories] = useState<FormCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCategoriesForForm()
        setCategories(data)
      } catch (err) {
        console.error('获取分类数据失败:', err)
        setError('获取分类数据失败')
        // 如果获取失败，使用默认数据（注意：这里需要实际的数据库ID）
        setCategories([
          { id: 1, name: "AI写作工具", slug: "writing", icon: null },
          { id: 2, name: "AI图像工具", slug: "image", icon: null },
          { id: 3, name: "AI视频工具", slug: "video", icon: null },
          { id: 4, name: "AI办公工具", slug: "office", icon: null },
          { id: 5, name: "AI编程工具", slug: "programming", icon: null },
          { id: 6, name: "AI聊天助手", slug: "chat", icon: null },
          { id: 7, name: "AI搜索引擎", slug: "search", icon: null },
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
      const data = await getCategoriesForForm()
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
