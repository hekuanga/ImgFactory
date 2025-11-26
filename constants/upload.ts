// 上传组件支持的最大文件大小（字节）
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

