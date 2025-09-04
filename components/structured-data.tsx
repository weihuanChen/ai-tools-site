import { AITool } from "@/types/database"

interface StructuredDataProps {
  tool?: AITool
  type?: 'website' | 'tool' | 'organization'
}

export function StructuredData({ tool, type = 'website' }: StructuredDataProps) {
  const getWebsiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CollectNow.top - AI工具集",
    "alternateName": "AI工具导航",
    "url": "https://collectnow.top",
    "description": "专业的AI工具导航平台，收录最新最全的AI工具，包括AI写作、AI图像、AI视频、AI编程等各类工具。",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://collectnow.top/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CollectNow.top",
      "url": "https://collectnow.top",
      "logo": {
        "@type": "ImageObject",
        "url": "https://collectnow.top/logo.png"
      }
    }
  })

  const getToolStructuredData = () => {
    if (!tool) return null

    const categoryName = (tool as any).tool_categories?.name || 'AI工具'
    
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": tool.name,
      "description": tool.short_description || tool.description,
      "url": `https://collectnow.top/tool/${tool.id}`,
      "applicationCategory": categoryName,
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CNY"
      },
      "aggregateRating": tool.rating ? {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "ratingCount": tool.review_count || 1
      } : undefined,
      "author": {
        "@type": "Organization",
        "name": tool.developer || "未知开发者"
      },
      "datePublished": tool.created_at,
      "dateModified": tool.updated_at,
      "image": tool.icon,
      "screenshot": tool.preview_images?.map(img => img.url) || [],
      "keywords": tool.tags?.join(', ') || '',
      "isAccessibleForFree": true,
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "softwareVersion": "1.0",
      "fileSize": "N/A",
      "memoryRequirements": "N/A",
      "storageRequirements": "N/A",
      "processorRequirements": "N/A"
    }
  }

  const getOrganizationStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CollectNow.top",
    "url": "https://collectnow.top",
    "logo": "https://collectnow.top/logo.png",
    "description": "专业的AI工具导航平台，收录最新最全的AI工具。",
    "foundingDate": "2024",
    "sameAs": [
      "https://collectnow.top"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://collectnow.top/contact"
    }
  })

  const getStructuredData = () => {
    switch (type) {
      case 'tool':
        return getToolStructuredData()
      case 'organization':
        return getOrganizationStructuredData()
      default:
        return getWebsiteStructuredData()
    }
  }

  const structuredData = getStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  )
}
