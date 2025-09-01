# Slug重复性检查完整解决方案

## 问题描述

在AI工具目录系统中，slug（URL标识符）需要在以下场景中保持唯一性：
1. 现有的AI工具表（`ai_tools`）
2. 用户提交记录表（`tool_submissions`）
3. 防止并发提交相同slug

## 解决方案架构

### 1. 前端防重复检查

#### 实时检查
- 用户输入slug时实时检查可用性
- 使用防抖处理（500ms延迟）避免频繁请求
- 同时检查`ai_tools`和`tool_submissions`两个表

#### 提交前二次检查
- 在表单提交前再次验证slug可用性
- 防止在用户输入和提交之间被其他用户占用

### 2. 数据库级约束

#### 唯一索引
```sql
-- ai_tools表的slug唯一约束
ALTER TABLE ai_tools ADD CONSTRAINT uk_ai_tools_slug UNIQUE (slug);

-- tool_submissions表的slug唯一约束  
ALTER TABLE tool_submissions ADD CONSTRAINT uk_tool_submissions_slug UNIQUE (slug);

-- 防止同一用户提交重复slug
CREATE UNIQUE INDEX idx_tool_submissions_user_slug ON tool_submissions(user_id, slug);
```

#### 跨表唯一性触发器
```sql
CREATE OR REPLACE FUNCTION check_slug_uniqueness_across_tables()
RETURNS TRIGGER AS $$
BEGIN
    -- 检查ai_tools表中是否已存在相同的slug
    IF EXISTS (
        SELECT 1 FROM ai_tools 
        WHERE slug = NEW.slug 
        AND status != 'deleted'
    ) THEN
        RAISE EXCEPTION 'URL标识 "%" 已被现有工具使用', NEW.slug;
    END IF;
    
    -- 检查tool_submissions表中是否已存在相同的slug
    IF EXISTS (
        SELECT 1 FROM tool_submissions 
        WHERE slug = NEW.slug 
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'URL标识 "%" 已被其他提交记录使用', NEW.slug;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 3. 错误处理策略

#### 前端错误提示
- 格式错误：显示具体的格式要求
- 已被占用：显示占用者的工具名称和状态
- 检查失败：提供重试选项

#### 数据库错误处理
- 违反唯一约束时抛出明确的错误信息
- 包含具体的冲突信息（工具名称、状态等）

## 实现细节

### 前端代码结构

```typescript
// 防抖处理slug检查
const debouncedSlugCheck = useCallback((value: string) => {
  if (slugCheckTimer) {
    clearTimeout(slugCheckTimer)
  }
  
  const timer = setTimeout(async () => {
    // 执行slug检查逻辑
  }, 500)
  
  setSlugCheckTimer(timer)
}, [slugCheckTimer])

// 双重检查：实时检查 + 提交前检查
const handleSubmit = async (e: React.FormEvent) => {
  // 提交前再次检查slug可用性
  const finalSlugCheck = await checkSlugAvailability(slug)
  if (!finalSlugCheck.available) {
    setError(`提交失败：${finalSlugCheck.message}`)
    return
  }
  // 继续提交流程
}
```

### 数据库约束层次

1. **表级约束**：每个表的slug字段唯一性
2. **跨表约束**：触发器确保跨表唯一性
3. **用户级约束**：同一用户不能提交重复slug
4. **状态过滤**：只检查活跃状态的工具

## 性能优化

### 1. 索引优化
- 为slug字段创建B-tree索引
- 复合索引优化查询性能

### 2. 查询优化
- 使用`Promise.all`并行检查两个表
- 使用`maybeSingle()`避免不必要的错误

### 3. 防抖处理
- 500ms延迟减少不必要的API调用
- 清理定时器避免内存泄漏

## 安全考虑

### 1. SQL注入防护
- 使用参数化查询
- 避免动态SQL拼接

### 2. 权限控制
- RLS策略限制用户只能查看自己的提交
- 防止用户查看其他用户的提交记录

### 3. 并发控制
- 数据库级约束防止并发冲突
- 前端双重检查减少冲突概率

## 测试建议

### 1. 功能测试
- 测试相同slug在不同表的冲突检测
- 测试并发提交相同slug的处理
- 测试各种错误场景的错误提示

### 2. 性能测试
- 测试大量并发请求的性能
- 测试防抖机制的有效性
- 测试数据库查询的响应时间

### 3. 边界测试
- 测试特殊字符的slug处理
- 测试极长/极短slug的处理
- 测试网络异常时的错误处理

## 部署注意事项

### 1. 数据库迁移
- 在应用部署前执行数据库迁移脚本
- 确保所有约束和触发器正确创建
- 验证现有数据的完整性

### 2. 监控告警
- 监控slug冲突的频率
- 监控数据库性能指标
- 设置适当的告警阈值

### 3. 回滚计划
- 准备数据库迁移的回滚脚本
- 测试回滚流程的可行性
- 制定数据恢复策略

## 总结

通过前端防重复检查、数据库级约束和跨表唯一性验证的三层防护，我们建立了一个健壮的slug重复性检查系统。该系统能够：

1. **实时反馈**：用户输入时立即知道slug是否可用
2. **防止冲突**：数据库级约束确保数据一致性
3. **性能优化**：防抖处理和并行查询提升用户体验
4. **错误处理**：清晰的错误信息帮助用户理解问题

这种多层次的解决方案确保了系统的可靠性和用户体验的流畅性。
