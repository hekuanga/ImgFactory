# 敏感内容检测误判分析与优化

## 问题分析

### 为什么方舟SDK容易触发输出拦截？

从日志和代码分析，主要有以下几个原因：

#### 1. **Prompt 内容问题**
- **中文Prompt可能触发检测**：某些中文词汇可能被误判为敏感内容
- **描述过于详细**：如"完整保留原图主体内容"、"保持照片完整性"等可能触发检测
- **修复相关词汇**：如"修复"、"还原"等可能被误判

#### 2. **生成的图片特征**
- **人物照片**：包含人物的照片更容易被误判
- **老旧照片**：修复后的照片可能包含某些特征被误判
- **AI模型严格性**：方舟SDK的敏感内容检测比较严格

#### 3. **API配置问题**
- **Replicate备用方案失效**：当方舟SDK失败时，Replicate API Key未正确配置，导致无法切换

## 已实施的优化

### 1. Prompt 优化（已实施）
```typescript
// 之前：中文详细描述
const prompt = `专业照片修复和色彩还原，高清细节，自然真实的色彩还原，准确还原色彩，保持照片风格和时代特征，去除老化痕迹，修复划痕和破损，增强清晰度，保持照片完整性，不裁切，完整保留原图主体内容`;

// 现在：简洁的英文Prompt
const prompt = `restore old photo, enhance quality, fix scratches, improve clarity, color restoration`;
```

**优化原因**：
- 使用英文减少中文可能引起的误判
- 简化描述，移除可能触发检测的词汇
- 专注于核心功能描述

### 2. 错误处理优化（已实施）
- **跳过重试**：检测到 `OutputImageSensitiveContentDetected` 时，不重试方舟SDK
- **自动切换**：立即切换到Replicate备用模型
- **友好提示**：显示"可能是误判"的提示信息

### 3. 错误信息优化（已实施）
- 当所有模型都失败时，提供详细的错误信息
- 检查Replicate API Key配置状态
- 提供具体的失败原因

## 进一步优化建议

### 1. Prompt 进一步简化
如果仍然频繁触发，可以尝试更简单的Prompt：
```typescript
const prompt = `photo restoration, quality enhancement`;
```

### 2. 添加Prompt参数控制
考虑添加一个参数来控制Prompt的详细程度：
```typescript
const prompt = useSimplePrompt 
  ? `photo restoration` 
  : `restore old photo, enhance quality, fix scratches, improve clarity, color restoration`;
```

### 3. 图片预处理
在发送到API之前，对图片进行预处理：
- 降低分辨率（如果图片太大）
- 调整图片格式
- 压缩图片大小

### 4. 使用不同的模型参数
尝试调整模型参数：
- 降低 `size` 参数（从 "2K" 改为更小的尺寸）
- 调整其他模型参数

### 5. 确保Replicate备用方案可用
- 检查 `REPLICATE_API_KEY` 是否正确配置
- 确保Replicate API Key以 `r8_` 开头
- 验证API Key是否有效

## 当前状态

### 已优化
- ✅ Prompt已简化为英文
- ✅ 敏感内容检测错误时跳过重试
- ✅ 自动切换到Replicate备用模型
- ✅ 错误信息更详细

### 待优化
- ⚠️ Replicate API Key需要正确配置
- ⚠️ 如果Replicate也失败，需要更好的降级方案
- ⚠️ 可以考虑添加更多备用模型

## 测试建议

1. **测试简化后的Prompt**
   - 使用新的英文Prompt测试
   - 观察是否还会频繁触发敏感内容检测

2. **验证Replicate备用方案**
   - 确保Replicate API Key正确配置
   - 测试当方舟SDK失败时，是否能成功切换到Replicate

3. **监控误判率**
   - 记录敏感内容检测错误的频率
   - 分析哪些类型的图片更容易触发误判

## 如果问题持续存在

如果简化Prompt后仍然频繁触发敏感内容检测：

1. **联系方舟SDK技术支持**
   - 询问是否有方法降低敏感内容检测的严格程度
   - 了解是否有特殊的API参数可以调整

2. **考虑使用其他模型**
   - 评估其他图片修复API
   - 考虑自建模型或使用其他服务

3. **用户提示优化**
   - 在UI中提示用户某些图片可能无法处理
   - 提供图片预处理建议

## 相关代码位置

- Prompt定义：`pages/api/generate.ts` 第48行
- 敏感内容检测处理：`pages/api/generate.ts` 第161-166行
- 错误处理：`pages/api/generate.ts` 第232-239行
- 模型切换逻辑：`pages/api/generate.ts` 第652-672行

