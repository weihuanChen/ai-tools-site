import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AuthProvider } from "@/contexts/auth-context"
import { StructuredData } from "@/components/structured-data"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI工具集 - 最全面的AI工具导航平台 | CollectNow.top",
  description: "CollectNow.top是专业的AI工具导航平台，收录最新最全的AI工具，包括AI写作、AI图像、AI视频、AI编程等各类工具，帮助用户快速发现和选择最适合的AI工具，提升工作效率。",
  keywords: "AI工具,人工智能工具,AI导航,AI写作工具,AI图像工具,AI视频工具,AI编程工具,AI办公工具,AI聊天助手,AI搜索引擎,CollectNow",
  authors: [{ name: "CollectNow Team" }],
  creator: "CollectNow.top",
  publisher: "CollectNow.top",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://collectnow.top",
    siteName: "CollectNow.top - AI工具集",
    title: "AI工具集 - 最全面的AI工具导航平台",
    description: "专业的AI工具导航平台，收录最新最全的AI工具，帮助用户快速发现和选择最适合的AI工具。",
    images: [
      {
        url: "https://collectnow.top/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CollectNow.top - AI工具集",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI工具集 - 最全面的AI工具导航平台",
    description: "专业的AI工具导航平台，收录最新最全的AI工具，帮助用户快速发现和选择最适合的AI工具。",
    images: ["https://collectnow.top/og-image.jpg"],
  },
  alternates: {
    canonical: "https://collectnow.top",
  },
  category: "technology",
  classification: "AI Tools Directory",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "AI工具集",
    "application-name": "AI工具集",
    "msapplication-TileColor": "#2563eb",
    "theme-color": "#2563eb",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <StructuredData type="website" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
