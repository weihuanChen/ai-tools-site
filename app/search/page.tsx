"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolCard } from "@/components/tool-card";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useTools } from "@/hooks/use-tools";
import { TOOL_TAGS } from "@/lib/constants";
import { useCategories } from "@/hooks/use-categories";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // 获取真实数据
  const { featuredTools, latestTools, categoryTools, loading, error } = useTools();
  const { categories, loading: categoriesLoading } = useCategories();

  // 使用useMemo来稳定allTools引用
  const allTools = useMemo(() => {
    const tools = [
      ...featuredTools,
      ...latestTools,
      ...Object.values(categoryTools).flat()
    ];
    // 去重
    return tools.filter((tool, index, self) => 
      index === self.findIndex(t => t.id === tool.id)
    );
  }, [featuredTools, latestTools, categoryTools]);

  // 使用useMemo来稳定filteredTools
  const filteredTools = useMemo(() => {
    if (allTools.length === 0) return [];

    const filtered = allTools.filter((tool) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.short_description && tool.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tool.tags && tool.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(tool.category_id?.toString() || "");

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        (tool.tags && tool.tags.some((tag: string) => selectedTags.includes(tag)));

      return matchesSearch && matchesCategory && matchesTags;
    });

    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created_at":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [allTools, searchQuery, selectedCategories, selectedTags, sortBy]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy("name");
  };

  const activeFiltersCount =
    selectedCategories.length + selectedTags.length;

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">加载失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">AI工具搜索</h1>
            </div>
            
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回首页
            </Link>
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
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`w-64 flex-shrink-0 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
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
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.id.toString()}
                            checked={selectedCategories.includes(category.id.toString())}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(category.id.toString(), checked as boolean)
                            }
                          />
                          <label
                            htmlFor={category.id.toString()}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <h4 className="font-medium mb-3">工具标签</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {TOOL_TAGS.map((tag) => (
                        <div
                          key={tag.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={tag.value}
                            checked={selectedTags.includes(tag.value)}
                            onCheckedChange={(checked) =>
                              handleTagChange(tag.value, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={tag.value}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {tag.label}
                          </label>
                        </div>
                      ))}
                    </div>
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    搜索结果 ({filteredTools.length})
                  </h2>
                  {searchQuery && (
                    <p className="text-gray-600 mt-1">关键词: "{searchQuery}"</p>
                  )}
                </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">排序:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">名称</SelectItem>
                    <SelectItem value="created_at">最新</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id.toString() === categoryId);
                  return (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {category?.name || categoryId}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleCategoryChange(categoryId, false)}
                      />
                    </Badge>
                  );
                })}
                {selectedTags.map((tagValue) => {
                  const tag = TOOL_TAGS.find(t => t.value === tagValue);
                  return (
                    <Badge
                      key={tagValue}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag?.label || tagValue}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleTagChange(tagValue, false)}
                      />
                    </Badge>
                  );
                })}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    未找到相关工具
                  </h3>
                  <p className="text-gray-600 mb-4">
                    尝试调整搜索关键词或筛选条件
                  </p>
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
  );
}
