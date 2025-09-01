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

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 工具分类表
CREATE TABLE tool_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_tool_categories_sort_order ON tool_categories(sort_order);
CREATE INDEX idx_tool_categories_is_active ON tool_categories(is_active);

-- 添加注释
COMMENT ON TABLE tool_categories IS '工具分类表';
COMMENT ON COLUMN tool_categories.id IS '主键ID';
COMMENT ON COLUMN tool_categories.name IS '分类名称';
COMMENT ON COLUMN tool_categories.slug IS '分类标识符（URL友好）';
COMMENT ON COLUMN tool_categories.description IS '分类描述';
COMMENT ON COLUMN tool_categories.icon IS '分类图标路径';
COMMENT ON COLUMN tool_categories.sort_order IS '排序顺序';
COMMENT ON COLUMN tool_categories.is_active IS '是否启用';
COMMENT ON COLUMN tool_categories.created_at IS '创建时间';
COMMENT ON COLUMN tool_categories.updated_at IS '更新时间';

-- 2. AI工具表
CREATE TABLE ai_tools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description VARCHAR(200),
    category_id INTEGER NOT NULL,
    icon VARCHAR(500),
    website_url VARCHAR(500),
    features JSONB,
    tags JSONB,
    rating_count INTEGER NOT NULL DEFAULT 0,
    preview_images JSONB DEFAULT '[]'::jsonb,
    view_count INTEGER NOT NULL DEFAULT 0,
    favorite_count INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
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
CREATE INDEX idx_ai_tools_approved_by ON ai_tools(approved_by);

-- 添加注释
COMMENT ON TABLE ai_tools IS 'AI工具表';
COMMENT ON COLUMN ai_tools.id IS '主键ID';
COMMENT ON COLUMN ai_tools.name IS '工具名称';
COMMENT ON COLUMN ai_tools.slug IS '工具标识符（URL友好）';
COMMENT ON COLUMN ai_tools.description IS '工具描述';
COMMENT ON COLUMN ai_tools.short_description IS '简短描述（用于卡片显示）';
COMMENT ON COLUMN ai_tools.category_id IS '分类ID';
COMMENT ON COLUMN ai_tools.icon IS '工具图标路径';
COMMENT ON COLUMN ai_tools.website_url IS '工具官网链接';
COMMENT ON COLUMN ai_tools.features IS '功能特性（JSON格式）';
COMMENT ON COLUMN ai_tools.tags IS '标签（JSON格式）';
COMMENT ON COLUMN ai_tools.rating_count IS '评分数量';
COMMENT ON COLUMN ai_tools.view_count IS '浏览次数';
COMMENT ON COLUMN ai_tools.favorite_count IS '收藏次数';
COMMENT ON COLUMN ai_tools.is_featured IS '是否推荐';
COMMENT ON COLUMN ai_tools.is_new IS '是否新工具';
COMMENT ON COLUMN ai_tools.status IS '状态（active-正常，inactive-停用，deleted-已删除）';
COMMENT ON COLUMN ai_tools.approved_by IS '审核管理员ID（UUID）';
COMMENT ON COLUMN ai_tools.approved_at IS '审核通过时间';
COMMENT ON COLUMN ai_tools.created_at IS '创建时间';
COMMENT ON COLUMN ai_tools.updated_at IS '更新时间';
COMMENT ON COLUMN ai_tools.preview_images IS '预览图片（JSON格式）';

-- 3. 用户提交记录表
CREATE TABLE tool_submissions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    website_url VARCHAR(500),
    short_description VARCHAR(200), 
    icon_path VARCHAR(500),
    features JSONB,
    tags JSONB,
    slug VARCHAR(100) NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    preview_images JSONB DEFAULT '[]'::jsonb,
    review_notes TEXT,
    reject_reason TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    approved_tool_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. 用户收藏工具表
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    tool_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- 确保每个用户只能收藏同一个工具一次
    UNIQUE(user_id, tool_id)
);

-- 创建索引
CREATE INDEX idx_tool_submissions_user_id ON tool_submissions(user_id);
CREATE INDEX idx_tool_submissions_category_id ON tool_submissions(category_id);
CREATE INDEX idx_tool_submissions_status ON tool_submissions(status);
CREATE INDEX idx_tool_submissions_reviewed_by ON tool_submissions(reviewed_by);
CREATE INDEX idx_tool_submissions_approved_tool_id ON tool_submissions(approved_tool_id);
CREATE INDEX idx_tool_submissions_slug ON tool_submissions(slug);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at);

-- 添加注释
COMMENT ON TABLE tool_submissions IS '用户提交记录表';
COMMENT ON COLUMN tool_submissions.id IS '主键ID';
COMMENT ON COLUMN tool_submissions.user_id IS '提交用户ID（UUID）';
COMMENT ON COLUMN tool_submissions.tool_name IS '工具名称';
COMMENT ON COLUMN tool_submissions.description IS '工具描述';
COMMENT ON COLUMN tool_submissions.category_id IS '分类ID';
COMMENT ON COLUMN tool_submissions.website_url IS '工具官网链接';
COMMENT ON COLUMN tool_submissions.icon_path IS '工具图标路径';
COMMENT ON COLUMN tool_submissions.features IS '功能特性';
COMMENT ON COLUMN tool_submissions.tags IS '标签';
COMMENT ON COLUMN tool_submissions.status IS '审核状态（pending-待审核，approved-已通过，rejected-已拒绝）';
COMMENT ON COLUMN tool_submissions.review_notes IS '审核备注';
COMMENT ON COLUMN tool_submissions.reject_reason IS '拒绝原因';
COMMENT ON COLUMN tool_submissions.reviewed_by IS '审核管理员ID（UUID）';
COMMENT ON COLUMN tool_submissions.reviewed_at IS '审核时间';
COMMENT ON COLUMN tool_submissions.approved_tool_id IS '审核通过后的工具ID';
COMMENT ON COLUMN tool_submissions.preview_images IS '预览图片（JSON格式）';
COMMENT ON COLUMN tool_submissions.created_at IS '提交时间';
COMMENT ON COLUMN tool_submissions.updated_at IS '更新时间';
COMMENT ON COLUMN tool_submissions.slug IS '工具标识符（URL友好）';

COMMENT ON TABLE user_favorites IS '用户收藏工具表';
COMMENT ON COLUMN user_favorites.id IS '主键ID';
COMMENT ON COLUMN user_favorites.user_id IS '用户ID（UUID）';
COMMENT ON COLUMN user_favorites.tool_id IS 'AI工具ID';
COMMENT ON COLUMN user_favorites.created_at IS '收藏时间';
COMMENT ON COLUMN user_favorites.updated_at IS '更新时间';

-- 创建外键约束
ALTER TABLE ai_tools 
ADD CONSTRAINT fk_ai_tools_category_id 
FOREIGN KEY (category_id) REFERENCES tool_categories(id) ON DELETE RESTRICT;

ALTER TABLE user_favorites
ADD CONSTRAINT fk_user_favorites_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_favorites
ADD CONSTRAINT fk_user_favorites_tool_id
FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE;

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

CREATE TRIGGER update_user_favorites_updated_at 
    BEFORE UPDATE ON user_favorites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建收藏计数更新触发器函数
CREATE OR REPLACE FUNCTION update_tool_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 新增收藏时，增加计数
        UPDATE ai_tools
        SET favorite_count = favorite_count + 1
        WHERE id = NEW.tool_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 取消收藏时，减少计数
        UPDATE ai_tools
        SET favorite_count = favorite_count - 1
        WHERE id = OLD.tool_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER trigger_update_tool_favorite_count
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW EXECUTE FUNCTION update_tool_favorite_count();

-- ===== 新增：跨表slug唯一性检查 =====

-- 创建检查slug是否在所有相关表中唯一的函数
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
        AND id != NEW.id  -- 排除当前记录（用于更新操作）
    ) THEN
        RAISE EXCEPTION 'URL标识 "%" 已被其他提交记录使用', NEW.slug;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为tool_submissions表创建触发器，在插入和更新时检查slug唯一性
CREATE TRIGGER trigger_check_slug_uniqueness_submissions
    BEFORE INSERT OR UPDATE ON tool_submissions
    FOR EACH ROW EXECUTE FUNCTION check_slug_uniqueness_across_tables();

-- 为ai_tools表创建触发器，在插入和更新时检查slug唯一性
CREATE TRIGGER trigger_check_slug_uniqueness_tools
    BEFORE INSERT OR UPDATE ON ai_tools
    FOR EACH ROW EXECUTE FUNCTION check_slug_uniqueness_across_tables();

-- 创建复合唯一索引，确保同一用户不能提交重复的slug
CREATE UNIQUE INDEX idx_tool_submissions_user_slug 
ON tool_submissions(user_id, slug);

-- 添加注释
COMMENT ON FUNCTION check_slug_uniqueness_across_tables() IS '检查slug在所有相关表中的唯一性';
COMMENT ON TRIGGER trigger_check_slug_uniqueness_submissions ON tool_submissions IS '在插入/更新tool_submissions时检查slug唯一性';
COMMENT ON TRIGGER trigger_check_slug_uniqueness_tools ON ai_tools IS '在插入/更新ai_tools时检查slug唯一性';

-- 启用RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS安全策略
-- AI工具表：公开读取，所有者修改
CREATE POLICY "工具公开读取" ON ai_tools
FOR SELECT USING (true);

CREATE POLICY "工具所有者修改" ON ai_tools
FOR UPDATE USING (
    submitted_by = auth.uid()
);

-- 收藏表：用户只能查看和管理自己的收藏
CREATE POLICY "用户收藏查看" ON user_favorites
FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "用户收藏创建" ON user_favorites
FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "用户收藏删除" ON user_favorites
FOR DELETE USING (
    user_id = auth.uid()
);

-- 提交记录表：用户只能查看自己的提交
CREATE POLICY "提交记录用户查看" ON tool_submissions
FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "提交记录用户创建" ON tool_submissions
FOR INSERT WITH CHECK (
    user_id = auth.uid()
);
