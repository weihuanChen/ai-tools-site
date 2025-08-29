-- 数据库迁移脚本：为 tool_submissions 表添加 slug 字段

-- 1. 为 tool_submissions 表添加 slug 字段
ALTER TABLE tool_submissions 
ADD COLUMN slug VARCHAR(100) NOT NULL DEFAULT '';

-- 2. 为 slug 字段添加唯一约束
ALTER TABLE tool_submissions 
ADD CONSTRAINT uk_tool_submissions_slug UNIQUE (slug);

-- 3. 为 slug 字段添加索引
CREATE INDEX idx_tool_submissions_slug ON tool_submissions(slug);

-- 4. 添加字段注释
COMMENT ON COLUMN tool_submissions.slug IS '工具标识符（URL友好）';

-- 5. 更新现有记录的 slug（如果有的话）
-- 注意：这里需要根据实际情况处理现有数据
-- UPDATE tool_submissions 
-- SET slug = LOWER(REGEXP_REPLACE(tool_name, '[^a-zA-Z0-9\s-]', '', 'g'))
-- WHERE slug = '';

-- 6. 移除默认值约束（在更新完现有数据后）
-- ALTER TABLE tool_submissions 
-- ALTER COLUMN slug DROP DEFAULT;

-- 验证迁移结果
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tool_submissions' 
AND column_name = 'slug';
