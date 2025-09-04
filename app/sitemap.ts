import { MetadataRoute } from 'next'
import { getTools } from '@/lib/tools'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://collectnow.top'
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    // 获取所有工具页面
    const tools = await getTools()
    const toolPages = tools.map((tool) => ({
      url: `${baseUrl}/tool/${tool.id}`,
      lastModified: new Date(tool.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...toolPages]
  } catch (error) {
    console.error('生成sitemap失败:', error)
    return staticPages
  }
}
