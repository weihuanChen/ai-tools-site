// 调试收藏功能的脚本
// 在浏览器控制台中运行

console.log('开始调试收藏功能...');

// 检查用户状态
console.log('当前用户:', window.user || '未定义');

// 检查Supabase客户端
console.log('Supabase客户端:', window.supabase || '未定义');

// 检查收藏按钮
const favoriteButton = document.querySelector('button[onclick*="handleFavorite"]') || 
                      document.querySelector('button:has(.heart)') ||
                      document.querySelector('button:contains("收藏")');
console.log('收藏按钮:', favoriteButton);

// 检查收藏状态
console.log('收藏状态:', window.isFavorited || '未定义');

// 检查工具数据
console.log('工具数据:', window.tool || '未定义');

// 检查函数定义
console.log('handleFavorite函数:', typeof window.handleFavorite);
console.log('addToFavorites函数:', typeof window.addToFavorites);
console.log('removeFromFavorites函数:', typeof window.removeFromFavorites);

// 检查网络请求
console.log('网络请求历史:', window.performance.getEntriesByType('resource'));

// 检查控制台错误
console.log('控制台错误:', window.consoleErrors || '无错误记录');
