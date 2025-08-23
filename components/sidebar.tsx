"use client"

import { useState } from "react"
import {
  ChevronRight,
  Edit,
  ImageIcon,
  Video,
  FileText,
  Bot,
  MessageSquare,
  Code,
  Palette,
  Music,
  Search,
  Monitor,
  GraduationCap,
  Crown,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "writing", name: "AI写作工具", icon: Edit, count: 156 },
  { id: "image", name: "AI图像工具", icon: ImageIcon, count: 89, hasSubmenu: true },
  { id: "video", name: "AI视频工具", icon: Video, count: 45 },
  { id: "office", name: "AI办公工具", icon: FileText, count: 78, hasSubmenu: true },
  { id: "chatbot", name: "AI智能体", icon: Bot, count: 234 },
  { id: "chat", name: "AI聊天助手", icon: MessageSquare, count: 123 },
  { id: "programming", name: "AI编程工具", icon: Code, count: 67 },
  { id: "design", name: "AI设计工具", icon: Palette, count: 45 },
  { id: "music", name: "AI音频工具", icon: Music, count: 34 },
  { id: "search", name: "AI搜索引擎", icon: Search, count: 23 },
  { id: "platform", name: "AI开发平台", icon: Monitor, count: 56 },
  { id: "learning", name: "AI学习网站", icon: GraduationCap, count: 89 },
  { id: "model", name: "AI训练模型", icon: Crown, count: 45 },
  { id: "evaluation", name: "AI模型评测", icon: Zap, count: 12 },
]

export function Sidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleCategoryClick = (category: any) => {
    setActiveCategory(category.id)
    if (category.hasSubmenu) {
      toggleCategory(category.id)
    } else {
      // Scroll to the corresponding section on the page
      const sectionId = `section-${category.id}`
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-screen z-10">
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon
              const isExpanded = expandedCategories.has(category.id)

              return (
                <div key={category.id}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                      activeCategory === category.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{category.count}</span>
                      {category.hasSubmenu && (
                        <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-90")} />
                      )}
                    </div>
                  </button>

                  {category.hasSubmenu && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        className="w-full text-left px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                        onClick={() => {
                          const sectionId = `section-${category.id}`
                          const element = document.getElementById(sectionId)
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                          }
                        }}
                      >
                        全部{category.name}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
