"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarCategory } from "@/types/database"
import { useCategories } from "@/hooks/use-categories"

export function Sidebar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { categories, loading, error } = useCategories()

  const handleCategoryClick = (category: SidebarCategory) => {
    setActiveCategory(category.id)
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

  // 渲染图标
  const renderIcon = (category: SidebarCategory) => {
    if (category.icon) {
      // 如果有icon URL，使用图片
      return (
        <img
          src={category.icon}
          alt={`${category.name}图标`}
          className="w-4 h-4 object-contain"
          onError={(e) => {
            // 如果图片加载失败，回退到默认图标
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              const fallbackIcon = document.createElement('div')
              fallbackIcon.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>'
              fallbackIcon.className = 'w-4 h-4'
              parent.appendChild(fallbackIcon)
            }
          }}
        />
      )
    } else {
      // 如果没有icon URL，使用默认图标
      return <ImageIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-screen z-10">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <div className="space-y-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-screen z-10">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed left-0 top-0 h-screen z-10">
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                    activeCategory === category.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(category)}
                    <span className="font-medium">{category.name}</span>
                  </div>
                </button>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
