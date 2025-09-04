import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI工具搜索 - 快速找到您需要的AI工具 | CollectNow.top",
  description: "在CollectNow.top搜索AI工具，快速找到最适合您需求的AI写作、AI图像、AI视频、AI编程等各类工具，提升工作效率。",
  keywords: "AI工具搜索,AI工具查找,AI工具筛选,AI写作工具搜索,AI图像工具搜索,AI编程工具搜索,CollectNow",
  openGraph: {
    title: "AI工具搜索 - 快速找到您需要的AI工具",
    description: "在CollectNow.top搜索AI工具，快速找到最适合您需求的各类AI工具，提升工作效率。",
    type: "website",
    url: "https://collectnow.top/search",
    siteName: "CollectNow.top - AI工具集",
  },
  alternates: {
    canonical: "https://collectnow.top/search",
  },
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI工具搜索
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            快速找到您需要的AI工具
          </p>
          {/* 这里可以添加搜索组件 */}
        </div>
      </div>
    </div>
  )
}