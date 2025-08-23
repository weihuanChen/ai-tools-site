import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, Users } from "lucide-react"

interface Tool {
  id: number
  name: string
  description: string
  icon: string
  category: string
  rating?: number
  users?: string
  isNew?: boolean
  isFeatured?: boolean
}

interface ToolCardProps {
  tool: Tool
  variant?: "default" | "featured" | "compact"
}

export function ToolCard({ tool, variant = "default" }: ToolCardProps) {
  const isCompact = variant === "compact"
  const isFeatured = variant === "featured"

  return (
    <Link href={`/tool/${tool.id}`}>
      <Card
        className={`
        ${isCompact ? "p-3" : "p-4"} 
        hover:shadow-lg transition-all duration-200 cursor-pointer group 
        ${isFeatured ? "border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50" : "hover:border-blue-200"}
        relative overflow-hidden min-w-0
      `}
      >
        {tool.isNew && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">新</div>
        )}

        {tool.isFeatured && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
            推荐
          </div>
        )}

        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`
            ${isCompact ? "w-8 h-8" : "w-12 h-12"} 
            rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 
            group-hover:scale-105 transition-transform duration-200
          `}
          >
            <img src={tool.icon || "/placeholder.svg"} alt={tool.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
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
              text-gray-600 line-clamp-2 mb-3 break-words
              ${isCompact ? "text-xs leading-relaxed" : "text-sm leading-relaxed"}
            `}
              title={tool.description}
            >
              {tool.description}
            </p>

            <div className="flex items-center justify-between gap-2 min-w-0">
              <Badge
                variant="secondary"
                className={`${isCompact ? "text-xs" : "text-xs"} bg-gray-100 text-gray-700 hover:bg-gray-200 truncate`}
                title={tool.category}
              >
                {tool.category}
              </Badge>

              <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                {tool.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{tool.rating}</span>
                  </div>
                )}
                {tool.users && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="hidden sm:inline">{tool.users}</span>
                    <span className="sm:hidden">{tool.users.replace(/万\+/, 'w+')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
