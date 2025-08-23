"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { ToolCard } from "@/components/tool-card"
import { UserMenu } from "@/components/user-menu"

const featuredTools = [
  {
    id: 1,
    name: "豆包",
    description: "字节跳动推出的AI智能助手，支持多轮对话和文档分析",
    icon: "/ai-chat-assistant-icon.png",
    category: "AI写作工具",
    rating: 4.8,
    users: "100万+",
    isFeatured: true,
  },
  {
    id: 2,
    name: "即梦AI",
    description: "字节跳动推出的AI视频生成工具，一键生成高质量视频",
    icon: "/placeholder-plb3q.png",
    category: "AI视频工具",
    rating: 4.6,
    users: "50万+",
  },
  {
    id: 3,
    name: "TRAE编程",
    description: "基于跳动推出的AI编程助手，提升开发效率",
    icon: "/ai-programming-assistant-icon.png",
    category: "AI编程工具",
    rating: 4.7,
    users: "30万+",
  },
  {
    id: 4,
    name: "AIPPT",
    description: "AI快速生成高质量PPT，支持多种模板和风格",
    icon: "/ai-presentation-tool-icon.png",
    category: "AI办公工具",
    rating: 4.5,
    users: "80万+",
    isFeatured: true,
  },
  {
    id: 5,
    name: "秘塔AI搜索",
    description: "最好用的AI搜索引擎，精准理解用户意图",
    icon: "/ai-search-engine-icon.png",
    category: "AI搜索引擎",
    rating: 4.9,
    users: "200万+",
  },
  {
    id: 6,
    name: "问小白",
    description: "免费AI智能助手，24小时在线服务",
    icon: "/ai-assistant-icon.png",
    category: "AI聊天助手",
    rating: 4.4,
    users: "60万+",
  },
]

const latestTools = [
  {
    id: 7,
    name: "美图设计室",
    description: "AI图像创作和设计工具，专业级设计效果",
    icon: "/ai-design-tool-icon.png",
    category: "AI图像工具",
    rating: 4.3,
    users: "25万+",
    isNew: true,
  },
  {
    id: 8,
    name: "推荐AI",
    description: "同里出品的免费AI工具，智能推荐系统",
    icon: "/ai-recommendation-tool-icon.png",
    category: "AI写作工具",
    rating: 4.2,
    users: "15万+",
    isNew: true,
  },
  {
    id: 9,
    name: "给蛙",
    description: "AI智能客服工具，提升客户服务体验",
    icon: "/ai-customer-service-icon.png",
    category: "AI聊天助手",
    rating: 4.1,
    users: "10万+",
  },
  {
    id: 10,
    name: "办公小浣熊",
    description: "最强AI数据分析工具，让数据说话",
    icon: "/ai-data-analysis-icon.png",
    category: "AI办公工具",
    rating: 4.6,
    users: "35万+",
    isNew: true,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
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
                {featuredTools
                  .filter((tool) => tool.category === "AI写作工具")
                  .map((tool) => (
                    <ToolCard key={`writing-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI写作工具")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI图像工具")
                  .map((tool) => (
                    <ToolCard key={`image-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI图像工具")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI视频工具")
                  .map((tool) => (
                    <ToolCard key={`video-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI视频工具")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI办公工具")
                  .map((tool) => (
                    <ToolCard key={`office-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI办公工具")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI编程工具")
                  .map((tool) => (
                    <ToolCard key={`programming-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI编程工具")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI聊天助手")
                  .map((tool) => (
                    <ToolCard key={`chat-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI聊天助手")
                  .map((tool) => (
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
                {featuredTools
                  .filter((tool) => tool.category === "AI搜索引擎")
                  .map((tool) => (
                    <ToolCard key={`search-${tool.id}`} tool={tool} variant="compact" />
                  ))}
                {latestTools
                  .filter((tool) => tool.category === "AI搜索引擎")
                  .map((tool) => (
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
