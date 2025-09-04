import { Metadata } from "next"
import { getToolById } from "@/lib/tools"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const toolId = parseInt(params.id)
  
  if (isNaN(toolId)) {
    return {
      title: "工具不存在 - CollectNow.top",
      description: "您访问的工具页面不存在，请返回首页查看其他AI工具。",
    }
  }

  try {
    const tool = await getToolById(toolId)
    
    if (!tool) {
      return {
        title: "工具不存在 - CollectNow.top",
        description: "您访问的工具页面不存在，请返回首页查看其他AI工具。",
      }
    }

    const categoryName = (tool as any).tool_categories?.name || 'AI工具'
    const shortDescription = tool.short_description || tool.description.slice(0, 150) + '...'
    
    return {
      title: `${tool.name} - ${categoryName} | CollectNow.top`,
      description: `${tool.name}是一款优秀的${categoryName}，${shortDescription}。在CollectNow.top发现更多AI工具，提升您的工作效率。`,
      keywords: `${tool.name},${categoryName},AI工具,人工智能,${tool.tags?.join(',') || ''},CollectNow`,
      openGraph: {
        title: `${tool.name} - ${categoryName}`,
        description: shortDescription,
        type: "website",
        url: `https://collectnow.top/tool/${tool.id}`,
        siteName: "CollectNow.top - AI工具集",
        images: [
          {
            url: tool.icon || "https://collectnow.top/og-image.jpg",
            width: 1200,
            height: 630,
            alt: `${tool.name} - ${categoryName}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${tool.name} - ${categoryName}`,
        description: shortDescription,
        images: [tool.icon || "https://collectnow.top/og-image.jpg"],
      },
      alternates: {
        canonical: `https://collectnow.top/tool/${tool.id}`,
      },
    }
  } catch (error) {
    console.error('生成metadata失败:', error)
    return {
      title: "工具详情 - CollectNow.top",
      description: "查看AI工具详情，发现更多优质AI工具。",
    }
  }
}
