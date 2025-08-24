# Supabase 邮件服务配置指南

## 🎯 **概述**

本文档介绍如何配置Supabase的邮件服务，实现用户注册时的邮箱验证功能。

## 🚀 **方案选择**

### **方案1：Supabase Edge Function + SMTP（推荐）**
- 使用Supabase Edge Function调用SMTP服务
- 支持自定义邮件模板
- 完全控制邮件发送逻辑

### **方案2：Supabase内置邮件服务**
- 使用Supabase的邮件模板功能
- 配置简单，但功能有限
- 需要升级到付费计划

## 📋 **环境变量配置**

在 `.env.local` 文件中添加以下配置：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 网站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SMTP配置（如果使用Edge Function）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## 🔧 **配置步骤**

### **步骤1：获取Supabase密钥**

1. 登录Supabase控制台
2. 进入项目设置 → API
3. 复制以下信息：
   - Project URL
   - anon public key
   - service_role key（注意：这是敏感信息）

### **步骤2：配置SMTP服务**

#### **Gmail配置**
1. 开启两步验证
2. 生成应用专用密码
3. 使用应用专用密码作为SMTP密码

#### **其他SMTP服务**
- QQ邮箱：smtp.qq.com:587
- 163邮箱：smtp.163.com:25
- 企业邮箱：咨询您的IT管理员

### **步骤3：部署Edge Function**

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录Supabase
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 部署Edge Function
supabase functions deploy send-email
```

## 📧 **邮件模板配置**

### **HTML邮件模板**
邮件模板包含：
- 品牌化的头部设计
- 清晰的验证码显示
- 有效期说明
- 安全提示
- 品牌链接

### **纯文本邮件**
为不支持HTML的邮件客户端提供纯文本版本。

## 🧪 **测试邮件发送**

### **本地测试**
1. 启动开发服务器：`pnpm dev`
2. 访问注册页面
3. 填写邮箱和用户名
4. 点击发送验证码
5. 检查控制台日志

### **生产环境测试**
1. 部署Edge Function
2. 配置生产环境变量
3. 测试真实邮件发送

## 🚨 **注意事项**

### **安全考虑**
- 不要在前端暴露 `SUPABASE_SERVICE_ROLE_KEY`
- 验证码有效期设置为合理时间（建议10分钟）
- 限制验证码发送频率

### **邮件配额**
- 注意SMTP服务的发送限制
- 监控邮件发送成功率
- 设置邮件发送失败的重试机制

### **用户体验**
- 提供清晰的错误提示
- 支持重新发送验证码
- 倒计时显示剩余时间

## 🔍 **故障排除**

### **常见问题**

#### **1. 邮件发送失败**
- 检查SMTP配置是否正确
- 确认网络连接正常
- 查看Edge Function日志

#### **2. 验证码不匹配**
- 检查验证码存储逻辑
- 确认时间同步
- 验证数据库连接

#### **3. Edge Function调用失败**
- 检查函数是否已部署
- 确认权限配置正确
- 查看网络请求日志

### **调试技巧**
1. 使用Supabase Dashboard查看日志
2. 在Edge Function中添加详细日志
3. 使用浏览器开发者工具检查网络请求
4. 验证环境变量是否正确加载

## 📚 **相关资源**

- [Supabase Edge Functions文档](https://supabase.com/docs/guides/functions)
- [Supabase Auth文档](https://supabase.com/docs/guides/auth)
- [SMTP配置指南](https://support.google.com/mail/answer/7126229)

## 🤝 **技术支持**

如果遇到问题，可以：
1. 查看Supabase官方文档
2. 在GitHub上提交Issue
3. 联系项目维护者
