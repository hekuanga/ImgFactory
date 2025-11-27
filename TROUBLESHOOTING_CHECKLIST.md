# 故障排查检查清单

## 📋 当遇到 TypeScript/构建错误时的检查流程

### 1. 全项目搜索类似问题
当遇到一个类型错误时，**必须**在整个项目中搜索类似的问题模式，而不是只修复报错的那一个文件。

### 2. UploadWidget 配置常见错误

#### ✅ 已修复的问题

1. **`styles.fonts` → `styles.fontFamilies`**
   - ❌ 错误：`fonts: { base: '...' }`
   - ✅ 正确：`fontFamilies: { base: '...' }`
   - 📍 位置：`pages/passport-photo.tsx`, `pages/restore.tsx`

2. **`locale` 配置不完整**
   - ❌ 错误：只提供部分 locale 属性（如 `orDragDrop`, `upload`, `browse`）
   - ✅ 正确：移除 `locale` 配置（使用默认值），或提供完整的 `UploadWidgetLocale` 接口
   - 📍 位置：`pages/passport-photo.tsx`, `pages/restore.tsx`

#### 🔍 检查命令

```bash
# 搜索所有使用 fonts: 的地方
grep -r "fonts:" pages/ components/ utils/

# 搜索所有 UploadWidgetConfig 配置
grep -r "UploadWidgetConfig" pages/ --after-context=15

# 搜索所有 styles 配置
grep -r "styles:" pages/ --after-context=5

# 搜索所有 locale 配置
grep -r "locale:" pages/ --after-context=5
```

### 3. UploadWidget 类型定义参考

#### `UploadWidgetStyles` 支持的属性：
```typescript
{
  colors?: UploadWidgetColors;
  fontFamilies?: UploadWidgetFontFamily;  // 注意：是 fontFamilies，不是 fonts
  fontSizes?: UploadWidgetFontSize;
}
```

#### `UploadWidgetLocale` 完整接口：
```typescript
{
  "addAnotherFile": string;
  "addAnotherImage": string;
  "cancel": string;
  "cancelInPreviewWindow": string;
  "cancelled!": string;
  "continue": string;
  "crop": string;
  "customValidationFailed": string;
  "done": string;
  "error!": string;
  "finish": string;
  "finishIcon": boolean;
  "image": string;
  "maxFilesReached": string;
  "maxImagesReached": string;
  "maxSize": string;
  "next": string;
  "of": string;
  "orDragDropFile": string;
  "orDragDropFiles": string;
  "orDragDropImage": string;  // 注意：不是 orDragDrop
  "orDragDropImages": string;
  "pleaseWait": string;
  "processingFile": string;
  "remove": string;
  "removed!": string;
  "skip": string;
  "unsupportedFileType": string;
  "uploadFile": string;
  "uploadFiles": string;
  "uploadImage": string;  // 注意：不是 upload
  "uploadImages": string;
}
```

### 4. 修复流程

1. **运行构建命令**：`npm run build` 查看所有错误
2. **识别错误模式**：分析错误信息，找出错误的属性名或类型
3. **全项目搜索**：使用 grep 或 codebase_search 找到所有类似问题
4. **批量修复**：一次性修复所有类似问题
5. **验证修复**：再次运行 `npm run build` 确保所有错误已解决
6. **提交代码**：提交修复并推送到远程仓库

### 5. 常见错误模式

| 错误模式 | 正确写法 | 检查位置 |
|---------|---------|---------|
| `fonts:` | `fontFamilies:` | `pages/*.tsx` |
| `orDragDrop:` | `orDragDropImage:` | `pages/*.tsx` |
| `upload:` | `uploadImage:` | `pages/*.tsx` |
| 不完整的 `locale` 对象 | 移除或提供完整接口 | `pages/*.tsx` |

### 6. 预防措施

- ✅ 使用 TypeScript 严格模式
- ✅ 在提交前运行 `npm run build` 检查类型错误
- ✅ 使用 IDE 的类型提示功能
- ✅ 参考官方类型定义文件（`node_modules/@bytescale/upload-widget/dist/**/*.d.ts`）

### 7. 相关文件

- `pages/passport-photo.tsx` - 证件照页面
- `pages/restore.tsx` - 照片修复页面
- `node_modules/@bytescale/upload-widget/dist/config/UploadWidgetConfig.d.ts` - 配置类型定义
- `node_modules/@bytescale/upload-widget/dist/config/UploadWidgetStyles.d.ts` - 样式类型定义
- `node_modules/@bytescale/upload-widget/dist/modules/locales/UploadWidgetLocale.d.ts` - 本地化类型定义

---

**重要提示**：当遇到任何类型错误时，**必须**在整个项目中搜索类似的问题，确保一次性修复所有相关问题，而不是只修复报错的那一个文件。

