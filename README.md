# AI工具集 - AI-BOT.CN

一个现代化的AI工具导航网站，基于Next.js 15和React 19构建。

## 功能特性

- 🚀 **现代化技术栈**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- 🔐 **完整认证系统**: 邮箱密码登录注册，支持用户角色管理
- 📱 **响应式设计**: 完美适配各种设备尺寸
- 🎨 **美观UI**: 基于Radix UI和Shadcn/ui的现代化组件库
- 🔍 **智能搜索**: 站内AI工具搜索功能
- 📊 **分类管理**: 12个主要AI工具分类，支持子菜单
- 👤 **用户中心**: 个人资料管理，工具收藏等

## 技术架构

### 前端框架
- **Next.js 15.2.4**: 使用App Router架构
- **React 19**: 最新版本的React框架
- **TypeScript 5**: 类型安全的JavaScript超集

### UI组件库
- **Radix UI**: 完整的无头UI组件库
- **Tailwind CSS 4.1.9**: 原子化CSS框架
- **Shadcn/ui**: 基于Radix UI的组件系统
- **Lucide React**: 现代化图标库

### 认证系统
- **API路由**: 基于Next.js API Routes的RESTful接口
- **状态管理**: React Context + LocalStorage
- **表单验证**: Zod + React Hook Form
- **会话管理**: 24小时自动过期

## 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 pnpm

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 启动开发服务器
```bash
npm run dev
# 或
pnpm dev
```

### 构建生产版本
```bash
npm run build
npm start
```

## 认证系统

### 默认测试账户

#### 管理员账户
- 邮箱: `admin@example.com`
- 密码: `admin123`
- 权限: 管理员权限

#### 普通用户账户
- 邮箱: `user@example.com`
- 密码: `user123`
- 权限: 普通用户权限

### API接口

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user123"
}
```

#### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "新用户"
}
```

#### 登出
```http
POST /api/auth/logout
```

### 认证流程

1. **用户注册/登录**: 通过API接口验证用户凭据
2. **会话创建**: 成功认证后创建本地会话，24小时后自动过期
3. **状态管理**: 使用React Context管理全局认证状态
4. **路由保护**: 中间件自动保护需要认证的路由
5. **自动登出**: 会话过期或用户主动登出时清除状态

## 项目结构

```
ai-tools-directory/
├── app/                    # Next.js App Router页面
│   ├── api/               # API路由
│   │   └── auth/          # 认证相关API
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── profile/           # 用户资料页面
│   └── ...
├── components/             # 可复用组件
│   ├── ui/                # UI基础组件
│   ├── sidebar.tsx        # 侧边栏导航
│   ├── tool-card.tsx      # 工具卡片组件
│   └── ...
├── contexts/              # React Context
│   └── auth-context.tsx   # 认证上下文
├── lib/                   # 工具函数
│   ├── auth.ts            # 认证工具函数
│   └── utils.ts           # 通用工具函数
├── middleware.ts          # Next.js中间件
└── ...
```

## 部署说明

### Vercel部署（推荐）
1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 自动部署完成

### 其他平台
1. 运行 `npm run build` 构建项目
2. 将 `.next` 文件夹和 `public` 文件夹部署到服务器
3. 配置环境变量（如需要）

## 开发指南

### 添加新的AI工具
1. 在 `app/page.tsx` 中的 `featuredTools` 或 `latestTools` 数组中添加工具信息
2. 确保工具有正确的分类和图标

### 自定义认证逻辑
1. 修改 `app/api/auth/` 下的API路由
2. 更新 `contexts/auth-context.tsx` 中的状态管理逻辑
3. 调整 `lib/auth.ts` 中的工具函数

### 样式定制
1. 修改 `app/globals.css` 中的全局样式
2. 使用Tailwind CSS类名进行组件样式调整
3. 在 `tailwind.config.js` 中配置主题

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页: [AI工具集](https://ai-bot.cn)
- 问题反馈: 通过GitHub Issues提交
- 功能建议: 通过GitHub Discussions讨论

---

**注意**: 这是一个演示项目，生产环境使用前请：
1. 替换模拟数据为真实数据库
2. 实现真实的密码加密和JWT认证
3. 添加适当的错误处理和日志记录
4. 配置生产环境的安全设置
