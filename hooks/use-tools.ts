import { useState, useEffect } from 'react'
import { AITool } from '@/types/database'
import { getFeaturedTools, getLatestTools, getAllCategoryTools } from '@/lib/tools'

export function useTools() {
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([])
  const [latestTools, setLatestTools] = useState<AITool[]>([])
  const [categoryTools, setCategoryTools] = useState<Record<string, AITool[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 并行获取数据
        const [featured, latest, allCategory] = await Promise.all([
          getFeaturedTools(),
          getLatestTools(),
          getAllCategoryTools()
        ])
        
        setFeaturedTools(featured)
        setLatestTools(latest)
        setCategoryTools(allCategory)
      } catch (err) {
        console.error('获取工具数据失败:', err)
        setError('获取工具数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  const refreshTools = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [featured, latest, allCategory] = await Promise.all([
        getFeaturedTools(),
        getLatestTools(),
        getAllCategoryTools()
      ])
      
      setFeaturedTools(featured)
      setLatestTools(latest)
      setCategoryTools(allCategory)
    } catch (err) {
      console.error('刷新工具数据失败:', err)
      setError('刷新工具数据失败')
    } finally {
      setLoading(false)
    }
  }

  return {
    featuredTools,
    latestTools,
    categoryTools,
    loading,
    error,
    refreshTools
  }
}
