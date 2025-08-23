"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolCard } from "@/components/tool-card"
import { Search, X, SlidersHorizontal } from "lucide-react"

// Mock data for all tools
const allTools = [
  {
    id: 1,
    name: "豆包",
    description: "字节跳动推出的AI智能助手，支持多轮对话和文档分析",
    icon: "/ai-chat-assistant-icon.png",
    category: "AI写作工具",
    rating: 4.8,
    users: "100万+",
    isFeatured: true,
    tags: ["对话AI", "文档分析", "免费"],
    pricing: "免费",
  },
  {
    id: 2,
    name: "即梦AI",
    description: "字节跳动推出的AI视频生成工具，一键生成高质量视频",
    icon: "/placeholder-plb3q.png",
    category: "AI视频工具",
    rating: 4.6,
    users: "50万+",
    tags: ["视频生成", "创意制作"],
    pricing: "付费",
  },
  {
    id: 3,
    name: "TRAE编程",
    description: "基于跳动推出的AI编程助手，提升开发效率",
    icon: "/ai-programming-assistant-icon.png",
    category: "AI编程工具",
    rating: 4.7,
    users: "30万+",
    tags: ["代码生成", "编程助手"],
    pricing: "免费增值",
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
    tags: ["PPT生成", "办公效率"],
    pricing: "付费",
  },
  {
    id: 5,
    name: "秘塔AI搜索",
    description: "最好用的AI搜索引擎，精准理解用户意图",
    icon: "/ai-search-engine-icon.png",
    category: "AI搜索引擎",
    rating: 4.9,
    users: "200万+",
    tags: ["智能搜索", "信息检索"],
    pricing: "免费",
  },
  {
    id: 6,
    name: "问小白",
    description: "免费AI智能助手，24小时在线服务",
    icon: "/ai-assistant-icon.png",
    category: "AI聊天助手",
    rating: 4.4,
    users: "60万+",
    tags: ["智能对话", "客服助手"],
    pricing: "免费",
  },
  {
    id: 7,
    name: "美图设计室",
    description: "AI图像创作和设计工具，专业级设计效果",
    icon: "/ai-design-tool-icon.png",
    category: "AI图像工具",
    rating: 4.3,
    users: "25万+",
    isNew: true,
    tags: ["图像设计", "创意工具"],
    pricing: "免费增值",
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
    tags: ["内容推荐", "智能分析"],
    pricing: "免费",
  },
]

const categories = [
  "AI写作工具",
  "AI图像工具",
  "AI视频工具",
  "AI办公工具",
  "AI智能体",
  "AI聊天助手",
  "AI编程工具",
  "AI设计工具",
  "AI音频工具",
  "AI搜索引擎",
]

const pricingOptions = ["免费", "付费", "免费增值"]
const ratingOptions = ["4.5+", "4.0+", "3.5+", "3.0+"]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [filteredTools, setFilteredTools] = useState(allTools)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPricing, setSelectedPricing] = useState<string[]>([])
  const [minRating, setMinRating] = useState("4.5+")
  const [sortBy, setSortBy] = useState("rating")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    filterTools()
  }, [searchQuery, selectedCategories, selectedPricing, minRating, sortBy])

  const filterTools = () => {
    const filtered = allTools.filter((tool) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category filter
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tool.category)

      // Pricing filter
      const matchesPricing = selectedPricing.length === 0 || selectedPricing.includes(tool.pricing)

      // Rating filter
      const matchesRating = minRating === "" || tool.rating >= Number.parseFloat(minRating.replace("+", ""))

      return matchesSearch && matchesCategory && matchesPricing && matchesRating
    })

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "users":
          return Number.parseInt(b.users.replace(/[^\d]/g, "")) - Number.parseInt(a.users.replace(/[^\d]/g, ""))
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTools(filtered)
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handlePricingChange = (pricing: string, checked: boolean) => {
    if (checked) {
      setSelectedPricing([...selectedPricing, pricing])
    } else {
      setSelectedPricing(selectedPricing.filter((p) => p !== pricing))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPricing([])
    setMinRating("")
    setSortBy("rating")
  }

  const activeFiltersCount = selectedCategories.length + selectedPricing.length + (minRating ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI工具搜索</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="搜索AI工具、功能或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              筛选
              {activeFiltersCount > 0 && <Badge className="ml-1 bg-blue-600 text-white">{activeFiltersCount}</Badge>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">筛选条件</CardTitle>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-1" />
                        清除
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h4 className="font-medium mb-3">工具分类</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                          />
                          <label htmlFor={category} className="text-sm text-gray-700 cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Filter */}
                  <div>
                    <h4 className="font-medium mb-3">价格模式</h4>
                    <div className="space-y-2">
                      {pricingOptions.map((pricing) => (
                        <div key={pricing} className="flex items-center space-x-2">
                          <Checkbox
                            id={pricing}
                            checked={selectedPricing.includes(pricing)}
                            onCheckedChange={(checked) => handlePricingChange(pricing, checked as boolean)}
                          />
                          <label htmlFor={pricing} className="text-sm text-gray-700 cursor-pointer">
                            {pricing}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h4 className="font-medium mb-3">最低评分</h4>
                    <Select value={minRating} onValueChange={setMinRating}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择最低评分" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4.5+">不限</SelectItem>
                        {ratingOptions.map((rating) => (
                          <SelectItem key={rating} value={rating}>
                            {rating} 星
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">搜索结果 ({filteredTools.length})</h2>
                {searchQuery && <p className="text-gray-600 mt-1">关键词: "{searchQuery}"</p>}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">排序:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">评分</SelectItem>
                    <SelectItem value="users">用户数</SelectItem>
                    <SelectItem value="name">名称</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleCategoryChange(category, false)} />
                  </Badge>
                ))}
                {selectedPricing.map((pricing) => (
                  <Badge key={pricing} variant="secondary" className="flex items-center gap-1">
                    {pricing}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handlePricingChange(pricing, false)} />
                  </Badge>
                ))}
                {minRating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {minRating} 星以上
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating("")} />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关工具</h3>
                  <p className="text-gray-600 mb-4">尝试调整搜索关键词或筛选条件</p>
                  <Button variant="outline" onClick={clearFilters}>
                    清除所有筛选条件
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
