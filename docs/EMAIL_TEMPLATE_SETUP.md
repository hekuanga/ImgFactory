# Supabase 邮箱验证模板配置指南

## 模板位置

在 Supabase Dashboard 中：
1. 进入 **Authentication** > **Email Templates**
2. 选择 **Confirm signup** 模板

## 推荐的邮箱验证模板

将以下代码复制到 **Confirm signup** 模板中：

```html
<h2>验证你的邮箱</h2>

<p>点击下面的按钮完成账号激活：</p>

<div style="text-align: center; margin: 30px 0;">
  <a 
    href="{{ .ConfirmationURL }}" 
    style="display: inline-block; padding: 12px 24px; background: #22c55e; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;"
  >
    立即验证邮箱
  </a>
</div>

<p style="color: #666; font-size: 14px; margin-top: 20px;">
  如果按钮无法点击，请复制以下链接到浏览器：<br>
  {{ .ConfirmationURL }}
</p>
```

## 配置说明

### 1. 按钮居中
- 使用 `<div style="text-align: center;">` 包裹按钮
- 按钮设置为 `display: inline-block` 以保持块级元素的样式

### 2. 绿色选择
- **当前使用**：`#22c55e` (Tailwind green-500)
  - 既不太刺眼，也不会太低饱和
  - 符合现代UI设计标准
- **备选颜色**：
  - `#16a34a` (green-600) - 稍深一些
  - `#10b981` (emerald-500) - 稍亮一些
  - `#059669` (emerald-600) - 更深一些

### 3. 变量检查
- ✅ `{{ .ConfirmationURL }}` - **正确**
  - 这是 Supabase 的标准模板变量
  - 会自动替换为完整的验证URL
  - 包含重定向URL和token

### 4. 样式优化
- `padding: 12px 24px` - 舒适的按钮内边距
- `border-radius: 8px` - 圆角，现代感
- `font-weight: 500` - 中等字重，清晰可读
- `font-size: 16px` - 标准字体大小

## 完整模板示例（带样式）

如果你想要更完整的邮件模板，可以使用以下代码：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #fff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <h2 style="color: #1f2937; margin-top: 0;">验证你的邮箱</h2>
    
    <p style="color: #4b5563; margin-bottom: 30px;">
      感谢您注册！请点击下面的按钮完成账号激活：
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a 
        href="{{ .ConfirmationURL }}" 
        style="display: inline-block; padding: 12px 24px; background: #22c55e; color: white; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px; transition: background-color 0.2s;"
      >
        立即验证邮箱
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      如果按钮无法点击，请复制以下链接到浏览器：<br>
      <a href="{{ .ConfirmationURL }}" style="color: #3b82f6; word-break: break-all;">{{ .ConfirmationURL }}</a>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
      此链接将在24小时后过期。如果您没有注册账户，请忽略此邮件。
    </p>
    
  </div>
  
</body>
</html>
```

## 验证配置是否正确

### ✅ 检查清单

1. **变量使用**
   - ✅ `{{ .ConfirmationURL }}` - 正确
   - ❌ `{{ .SiteURL }}` - 仅用于重定向URL，不包含token

2. **重定向URL配置**
   - 确保在 **Authentication** > **URL Configuration** 中设置了正确的 **Site URL**
   - 确保在 **Redirect URLs** 中添加了回调URL

3. **代码中的重定向设置**
   - 注册时已设置 `emailRedirectTo: getAuthCallbackUrl()`
   - 这会自动使用正确的域名

## 测试

1. **注册新账户**
2. **检查邮箱**，查看验证邮件
3. **验证按钮样式**：
   - 按钮应该在邮件中间
   - 绿色应该舒适（不太刺眼，也不太低饱和）
   - 按钮应该可以点击
4. **点击按钮**，应该能正常跳转并验证

## 常见问题

**Q: 按钮没有居中？**

**A:** 确保使用了 `<div style="text-align: center;">` 包裹按钮，并且按钮是 `display: inline-block`

**Q: 绿色太刺眼？**

**A:** 可以尝试使用 `#16a34a` (green-600) 或 `#059669` (emerald-600)

**Q: 绿色太低饱和？**

**A:** 可以尝试使用 `#10b981` (emerald-500) 或 `#4ade80` (green-400)

**Q: `{{ .ConfirmationURL }}` 是否正确？**

**A:** ✅ 是的，这是 Supabase 的标准变量，会自动包含完整的验证URL和重定向信息

