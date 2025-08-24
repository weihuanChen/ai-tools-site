# Supabase 设置说明

## 1. 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 获取Supabase配置信息：

1. 登录 [Supabase](https://supabase.com)
2. 选择或创建项目
3. 进入项目设置 (Settings) > API
4. 复制 `Project URL` 和 `anon public` key

## 2. 数据库表创建

在Supabase SQL编辑器中执行以下SQL语句：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 工具分类表
CREATE TABLE tool_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(500), -- 存储分类图标的URL
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tool_categories_sort_order ON tool_categories(sort_order);
CREATE INDEX idx_tool_categories_is_active ON tool_categories(is_active);

-- 2. AI工具表
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(200),
    category_id INTEGER NOT NULL,
    icon VARCHAR(500), -- 存储工具图标的URL
    website_url VARCHAR(500),
    features JSONB,
    tags JSONB,
    rating_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    submitted_by UUID NOT NULL,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_ai_tools_category_id ON ai_tools(category_id);
CREATE INDEX idx_ai_tools_view_count ON ai_tools(view_count);
CREATE INDEX idx_ai_tools_is_featured ON ai_tools(is_featured);
CREATE INDEX idx_ai_tools_is_new ON ai_tools(is_new);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_submitted_by ON ai_tools(submitted_by);
CREATE INDEX idx_ai_tools_approved_by ON ai_tools(approved_by);

-- 3. 用户提交记录表
CREATE TABLE tool_submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    website_url VARCHAR(500),
    icon_path VARCHAR(500), -- 存储工具图标的URL
    features JSONB,
    tags JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    reject_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    approved_tool_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tool_submissions_user_id ON tool_submissions(user_id);
CREATE INDEX idx_tool_submissions_category_id ON tool_submissions(category_id);
CREATE INDEX idx_tool_submissions_status ON tool_submissions(status);
CREATE INDEX idx_tool_submissions_reviewed_by ON tool_submissions(reviewed_by);
CREATE INDEX idx_tool_submissions_approved_tool_id ON tool_submissions(approved_tool_id);

-- 创建外键约束
ALTER TABLE ai_tools 
ADD CONSTRAINT fk_ai_tools_category_id 
FOREIGN KEY (category_id) REFERENCES tool_categories(id) ON DELETE RESTRICT;

ALTER TABLE ai_tools 
ADD CONSTRAINT fk_ai_tools_submitted_by 
FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE ai_tools 
ADD CONSTRAINT fk_ai_tools_approved_by 
FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE tool_submissions 
ADD CONSTRAINT fk_tool_submissions_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE tool_submissions 
ADD CONSTRAINT fk_tool_submissions_category_id 
FOREIGN KEY (category_id) REFERENCES tool_categories(id) ON DELETE RESTRICT;

ALTER TABLE tool_submissions 
ADD CONSTRAINT fk_tool_submissions_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE tool_submissions 
ADD CONSTRAINT fk_tool_submissions_approved_tool_id 
FOREIGN KEY (approved_tool_id) REFERENCES ai_tools(id) ON DELETE SET NULL;

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新时间触发器
CREATE TRIGGER update_tool_categories_updated_at 
    BEFORE UPDATE ON tool_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_tools_updated_at 
    BEFORE UPDATE ON ai_tools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_submissions_updated_at 
    BEFORE UPDATE ON tool_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. 插入初始分类数据

```sql
-- 插入初始分类数据
INSERT INTO tool_categories (name, slug, description, icon, sort_order, is_active) VALUES
('AI写作工具', 'writing', '提升写作效率的AI助手', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/writing/32x32.png', 1, true),
('AI图像工具', 'image', 'AI图像生成与编辑工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/image/32x32.png', 2, true),
('AI视频工具', 'video', 'AI视频生成与编辑工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/video/32x32.png', 3, true),
('AI办公工具', 'office', '提升办公效率的AI工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/office/32x32.png', 4, true),
('AI编程工具', 'programming', 'AI编程助手与开发工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/programming/32x32.png', 5, true),
('AI聊天助手', 'chat', '智能对话与聊天机器人', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/chat/32x32.png', 6, true),
('AI搜索引擎', 'search', '智能搜索与信息检索', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/search/32x32.png', 7, true),
('AI智能体', 'bot', 'AI智能体与自动化工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/bot/32x32.png', 8, true),
('AI设计工具', 'design', 'AI设计创作工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/design/32x32.png', 9, true),
('AI音频工具', 'audio', 'AI音频生成与编辑工具', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/audio/32x32.png', 10, true),
('AI开发平台', 'platform', 'AI开发与部署平台', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/platform/32x32.png', 11, true),
('AI学习网站', 'learning', 'AI学习与教育资源', 'https://your-project.supabase.co/storage/v1/object/public/category-icons/learning/32x32.png', 12, true);
```

## 4. 功能特性

### 侧边栏组件更新：

1. **真实数据**: 从Supabase数据库获取分类数据
2. **动态图标**: 支持从URL加载分类图标
3. **实时计数**: 显示每个分类下的工具数量
4. **错误处理**: 网络错误时显示友好的错误信息
5. **加载状态**: 数据加载时显示骨架屏
6. **回退机制**: 图标加载失败时使用默认图标

### 数据流程：

1. 组件挂载时调用 `useCategories` Hook
2. Hook从Supabase获取分类数据
3. 同时获取每个分类的工具数量
4. 渲染分类列表，支持图标URL和默认图标
5. 点击分类时滚动到对应页面区域

## 5. 注意事项

1. **环境变量**: 确保 `.env.local` 文件存在且配置正确
2. **网络权限**: 确保Supabase项目允许从你的域名访问
3. **图标URL**: 分类图标URL需要是可访问的公开链接
4. **错误处理**: 网络错误时会显示默认分类数据
5. **性能优化**: 分类数据会在组件挂载时获取一次

## 6. 故障排除

### 常见问题：

1. **"Missing Supabase environment variables"**
   - 检查 `.env.local` 文件是否存在
   - 确认环境变量名称正确

2. **"获取分类数据失败"**
   - 检查Supabase URL和Key是否正确
   - 确认数据库表是否已创建
   - 检查网络连接

3. **图标不显示**
   - 确认图标URL是否可访问
   - 检查图片格式是否支持
   - 查看浏览器控制台是否有错误

4. **工具数量为0**
   - 确认 `ai_tools` 表中有数据
   - 检查工具状态是否为 'active'
   - 验证外键关联是否正确
