import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { AITool } from "@/types/database"
import { LazyImage } from "@/components/lazy-image"

interface ToolCardProps {
  tool: AITool
  variant?: "default" | "featured" | "compact"
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  const isCompact = variant === "compact"
  const isFeatured = variant === "featured"
  
  // 从数据库数据中提取需要的信息
  const categoryName = (tool as any).tool_categories?.name || '未知分类'
  const isNew = tool.is_new
  const isFeaturedTool = tool.is_featured
  
  return (
    <Link href={`/tool/${tool.id}`}>
      <Card
        className={`
        ${isCompact ? "p-3" : "p-4"} 
        hover:shadow-lg transition-all duration-200 cursor-pointer group 
        ${isFeatured ? "border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50" : "hover:border-blue-200"}
        relative overflow-hidden min-w-0
        ${isCompact ? "min-h-[120px]" : "min-h-[160px]"}
      `}
      >
        {isNew && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">新</div>
        )}

        {isFeaturedTool && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
            推荐
          </div>
        )}

        <div className="flex items-start gap-3 min-w-0 h-full">
          <div
            className={`
            ${isCompact ? "w-8 h-8" : "w-12 h-12"} 
            rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 
            group-hover:scale-105 transition-transform duration-200
          `}
          >
            <LazyImage
              src={tool.icon || "/placeholder.svg"}
              alt={tool.name}
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden flex flex-col h-full">
            <div className="flex items-start justify-between mb-1 gap-2">
              <h3
                className={`
                font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate
                ${isCompact ? "text-sm" : "text-base"}
              `}
                title={tool.name}
              >
                {tool.name}
              </h3>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            <p
              className={`
              text-gray-600 line-clamp-2 mb-3 break-words flex-1
              ${isCompact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}
            `}
              title={tool.short_description || tool.description}
            >
              {tool.short_description || tool.description}
            </p>

            <div className="flex items-center justify-between gap-2 min-w-0 mt-auto">
              <Badge
                variant="secondary"
                className={`
                  ${isCompact ? "text-xs" : "text-xs"}
                  ${isFeatured
                    ? "bg-white/80 text-gray-800 border border-gray-200 shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                  truncate
                `}
                title={categoryName}
              >
                {categoryName}
              </Badge>

              {/* 移除评分和阅读量显示 */}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
