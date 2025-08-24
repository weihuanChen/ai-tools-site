"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { ToolCard } from "@/components/tool-card"
import { UserMenu } from "@/components/user-menu"
import { useTools } from "@/hooks/use-tools"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { featuredTools, latestTools, categoryTools, loading, error } = useTools()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // 获取指定分类的工具
  const getToolsByCategory = (categorySlug: string) => {
    return categoryTools[categorySlug] || []
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-gray-600">加载中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-lg text-red-600">加载失败: {error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">AI工具集</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="站内AI工具搜索"
                  className="pl-10 w-80 bg-gray-100 border-0 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Featured Tools Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔥</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">热门工具</h2>
                <span className="text-sm text-gray-500">精选优质AI工具推荐</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} variant="featured" />
                ))}
              </div>
            </section>

            {/* Latest Tools Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✨</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">最新收录</h2>
                <span className="text-sm text-gray-500">最新加入的AI工具</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {latestTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>

            {/* AI写作工具 Section */}
            <section id="section-writing" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✍️</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI写作工具</h2>
                <span className="text-sm text-gray-500">提升写作效率的AI助手</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('writing').map((tool) => (
                  <ToolCard key={`writing-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI图像工具 Section */}
            <section id="section-image" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎨</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI图像工具</h2>
                <span className="text-sm text-gray-500">AI图像生成与编辑工具</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('image').map((tool) => (
                  <ToolCard key={`image-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI视频工具 Section */}
            <section id="section-video" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🎬</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI视频工具</h2>
                <span className="text-sm text-gray-500">AI视频生成与编辑工具</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('video').map((tool) => (
                  <ToolCard key={`video-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI办公工具 Section */}
            <section id="section-office" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI办公工具</h2>
                <span className="text-sm text-gray-500">提升办公效率的AI工具</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('office').map((tool) => (
                  <ToolCard key={`office-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI编程工具 Section */}
            <section id="section-programming" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💻</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI编程工具</h2>
                <span className="text-sm text-gray-500">AI编程助手与开发工具</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('programming').map((tool) => (
                  <ToolCard key={`programming-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI聊天助手 Section */}
            <section id="section-chat" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">💬</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI聊天助手</h2>
                <span className="text-sm text-gray-500">智能对话与聊天机器人</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('chat').map((tool) => (
                  <ToolCard key={`chat-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>

            {/* AI搜索引擎 Section */}
            <section id="section-search" className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔍</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">AI搜索引擎</h2>
                <span className="text-sm text-gray-500">智能搜索与信息检索</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getToolsByCategory('search').map((tool) => (
                  <ToolCard key={`search-${tool.id}`} tool={tool} variant="compact" />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
