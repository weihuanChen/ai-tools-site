# 收藏功能调试指南

## 🚨 问题描述
收藏功能未生效，点击收藏按钮没有反应。

## 🔍 诊断步骤

### 1. 检查数据库表是否存在

在Supabase Dashboard中执行以下SQL查询：

```sql
-- 检查收藏表是否存在
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'user_favorites'
);

-- 如果表不存在，创建表
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tool_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, tool_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);
```

### 2. 检查RLS策略

```sql
-- 启用RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "用户收藏查看" ON user_favorites;
DROP POLICY IF EXISTS "用户收藏创建" ON user_favorites;
DROP POLICY IF EXISTS "用户收藏删除" ON user_favorites;

-- 创建新的RLS策略
CREATE POLICY "用户收藏查看" ON user_favorites
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户收藏创建" ON user_favorites
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户收藏删除" ON user_favorites
FOR DELETE USING (user_id = auth.uid());
```

### 3. 检查外键约束

```sql
-- 添加外键约束
ALTER TABLE user_favorites 
ADD CONSTRAINT IF NOT EXISTS fk_user_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_favorites 
ADD CONSTRAINT IF NOT EXISTS fk_user_favorites_tool_id 
FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE;
```

### 4. 检查触发器

```sql
-- 创建收藏计数更新触发器函数
CREATE OR REPLACE FUNCTION update_tool_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ai_tools
        SET favorite_count = favorite_count + 1
        WHERE id = NEW.tool_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ai_tools
        SET favorite_count = favorite_count - 1
        WHERE id = OLD.tool_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_tool_favorite_count ON user_favorites;
CREATE TRIGGER trigger_update_tool_favorite_count
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_tool_favorite_count();
```

## 🧪 测试步骤

### 1. 浏览器控制台测试

在工具详情页打开浏览器控制台，运行以下代码：

```javascript
// 检查用户状态
console.log('用户ID:', window.user?.id);

// 检查工具ID
console.log('工具ID:', window.tool?.id);

// 测试收藏函数
if (window.addToFavorites) {
  console.log('addToFavorites函数存在');
} else {
  console.log('addToFavorites函数不存在');
}

// 测试取消收藏函数
if (window.removeFromFavorites) {
  console.log('removeFromFavorites函数存在');
} else {
  console.log('removeFromFavorites函数不存在');
}
```

### 2. 网络请求检查

在浏览器开发者工具的Network标签页中：
1. 点击收藏按钮
2. 查看是否有网络请求发送
3. 检查请求的URL和参数
4. 查看响应状态和内容

### 3. 数据库测试

在Supabase Dashboard的SQL编辑器中测试：

```sql
-- 测试插入收藏
INSERT INTO user_favorites (user_id, tool_id) 
VALUES ('你的用户ID', 1);

-- 测试查询收藏
SELECT * FROM user_favorites WHERE user_id = '你的用户ID';

-- 测试删除收藏
DELETE FROM user_favorites WHERE user_id = '你的用户ID' AND tool_id = 1;
```

## 🐛 常见问题及解决方案

### 问题1: 表不存在
**症状**: 控制台显示 "relation 'user_favorites' does not exist"
**解决**: 执行步骤1中的建表SQL

### 问题2: 权限不足
**症状**: 控制台显示 "new row violates row-level security policy"
**解决**: 检查并重新创建RLS策略

### 问题3: 外键约束失败
**症状**: 控制台显示 "insert or update on table violates foreign key constraint"
**解决**: 检查用户ID和工具ID是否有效

### 问题4: 用户未认证
**症状**: 控制台显示 "JWT expired" 或用户ID为空
**解决**: 重新登录用户

### 问题5: 函数未定义
**症状**: 控制台显示 "handleFavorite is not defined"
**解决**: 检查组件是否正确导入和使用了函数

## 📱 前端调试

### 1. 检查组件导入

确保在 `app/tool/[id]/page.tsx` 中正确导入了所有必要的函数：

```typescript
import { 
  getToolById, 
  getRelatedTools, 
  incrementToolViewCount, 
  getToolByIdWithFavorite, 
  addToFavorites, 
  removeFromFavorites 
} from "@/lib/tools"
```

### 2. 检查状态管理

确保状态变量正确定义：

```typescript
const [isFavorited, setIsFavorited] = useState(false)
const [favoriteLoading, setFavoriteLoading] = useState(false)
```

### 3. 检查事件绑定

确保收藏按钮正确绑定了事件：

```typescript
<Button
  variant="outline"
  onClick={handleFavorite}
  className={isFavorited ? "text-red-600 border-red-200" : ""}
  disabled={favoriteLoading}
>
  {/* 按钮内容 */}
</Button>
```

## 🚀 快速修复

如果以上步骤都无法解决问题，可以尝试：

1. **重启开发服务器**:
   ```bash
   npm run dev
   ```

2. **清除浏览器缓存**:
   - 硬刷新页面 (Ctrl+F5 或 Cmd+Shift+R)
   - 清除浏览器缓存和Cookie

3. **检查环境变量**:
   确保 `.env.local` 中的Supabase配置正确

4. **重新构建项目**:
   ```bash
   npm run build
   npm run dev
   ```

## 📞 获取帮助

如果问题仍然存在，请提供以下信息：

1. 浏览器控制台的错误信息
2. Network标签页的请求详情
3. 当前用户ID和工具ID
4. 数据库表结构截图
5. RLS策略配置截图
