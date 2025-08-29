-- 测试分类数据的SQL脚本

-- 1. 查看所有分类
SELECT 
    id,
    name,
    slug,
    is_active,
    sort_order,
    created_at
FROM tool_categories
ORDER BY sort_order, id;

-- 2. 查看激活的分类
SELECT 
    id,
    name,
    slug,
    sort_order
FROM tool_categories
WHERE is_active = true
ORDER BY sort_order, id;

-- 3. 检查分类ID的连续性
SELECT 
    id,
    name,
    LAG(id) OVER (ORDER BY id) as prev_id,
    LEAD(id) OVER (ORDER BY id) as next_id
FROM tool_categories
WHERE is_active = true
ORDER BY id;

-- 4. 验证分类数据的完整性
SELECT 
    COUNT(*) as total_categories,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
    MIN(id) as min_id,
    MAX(id) as max_id,
    COUNT(DISTINCT slug) as unique_slugs
FROM tool_categories;

-- 5. 查看分类与工具的关联
SELECT 
    c.id as category_id,
    c.name as category_name,
    COUNT(t.id) as tool_count
FROM tool_categories c
LEFT JOIN ai_tools t ON c.id = t.category_id AND t.status = 'active'
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.sort_order, c.id;
