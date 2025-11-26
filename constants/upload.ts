// Bytescale 免费账户的文件大小限制（字节）
export const BYTESCALE_FREE_LIMIT = 5 * 1024 * 1024; // 5MB

// Bytescale 付费账户的文件大小限制（字节）
export const BYTESCALE_PAID_LIMIT = 20 * 1024 * 1024; // 20MB

// 根据是否有 API key 获取最大文件大小
export function getMaxFileSize(hasApiKey: boolean): number {
  return hasApiKey ? BYTESCALE_PAID_LIMIT : BYTESCALE_FREE_LIMIT;
}

// 格式化文件大小为可读字符串
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

