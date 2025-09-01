# 收藏功能实现说明

## 功能概述

收藏功能允许用户收藏他们感兴趣的AI工具，并在个人中心的收藏夹中查看和管理这些收藏。

## 数据库设计

### 用户收藏表 (user_favorites)

```sql
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tool_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 确保每个用户只能收藏同一个工具一次
    UNIQUE(user_id, tool_id)
);
```

### 关键特性

1. **唯一性约束**: 每个用户只能收藏同一个工具一次
2. **级联删除**: 当用户或工具被删除时，相关收藏记录也会被删除
3. **自动计数**: 通过触发器自动维护工具的收藏计数
4. **安全策略**: 用户只能管理自己的收藏

## 前端实现

### 1. 工具详情页收藏功能

- **位置**: `app/tool/[id]/page.tsx`
- **功能**: 
  - 显示收藏状态（已收藏/未收藏）
  - 点击收藏/取消收藏
  - 加载状态显示
  - 用户未登录时的提示

### 2. 个人中心收藏夹

- **位置**: `app/profile/page.tsx`
- **功能**:
  - 显示用户收藏的工具列表
  - 取消收藏功能
  - 查看工具详情
  - 收藏数量统计

## 核心函数

### 收藏相关函数 (`lib/tools.ts`)

```typescript
// 添加收藏
export async function addToFavorites(userId: string, toolId: number): Promise<boolean>

// 取消收藏
export async function removeFromFavorites(userId: string, toolId: number): Promise<boolean>

// 获取用户收藏列表
export async function getUserFavorites(userId: string): Promise<AITool[]>

// 检查工具是否被用户收藏
export async function checkToolFavorited(userId: string, toolId: number): Promise<boolean>

// 获取工具详情（包含收藏状态）
export async function getToolByIdWithFavorite(toolId: number, userId?: string): Promise<AIToolWithFavorite | null>
```

## 类型定义

### 新增类型 (`types/database.ts`)

```typescript
// 用户收藏工具类型
export interface UserFavorite {
  id: number
  user_id: string // UUID类型
  tool_id: number
  created_at: string
  updated_at: string
}

// 扩展AITool接口，添加收藏状态
export interface AIToolWithFavorite extends AITool {
  is_favorited?: boolean
}
```

## 使用方法

### 1. 收藏工具

在工具详情页点击收藏按钮，系统会：
- 检查用户登录状态
- 添加收藏记录到数据库
- 更新工具的收藏计数
- 显示成功提示

### 2. 取消收藏

在工具详情页或个人中心点击取消收藏，系统会：
- 从数据库中删除收藏记录
- 更新工具的收藏计数
- 从本地状态中移除
- 显示成功提示

### 3. 查看收藏

在个人中心的"收藏夹"标签页中：
- 显示所有收藏的工具
- 提供取消收藏功能
- 提供查看工具详情的链接

## 安全特性

### RLS (Row Level Security)

```sql
-- 用户只能查看和管理自己的收藏
CREATE POLICY "用户收藏查看" ON user_favorites
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户收藏创建" ON user_favorites
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户收藏删除" ON user_favorites
FOR DELETE USING (user_id = auth.uid());
```

### 外键约束

- `user_id` 关联 `auth.users(id)`，级联删除
- `tool_id` 关联 `ai_tools(id)`，级联删除

## 性能优化

### 索引设计

```sql
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);
```

### 触发器优化

自动维护工具的收藏计数，避免手动更新可能的数据不一致问题。

## 错误处理

- 用户未登录时的友好提示
- 网络请求失败的重试机制
- 数据库操作失败的错误提示
- 加载状态的显示

## 未来扩展

1. **收藏分类**: 允许用户为收藏的工具添加标签或分类
2. **收藏分享**: 允许用户分享自己的收藏列表
3. **收藏推荐**: 基于用户收藏历史推荐相似工具
4. **批量操作**: 支持批量取消收藏或移动收藏
5. **收藏统计**: 更详细的收藏数据分析和可视化
