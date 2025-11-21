// 通用辅助函数工具集

/**
 * 格式化日期时间
 * @param date - 日期对象或时间戳
 * @param format - 格式化字符串（可选）
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number,
  format?: string
): string {
  // TODO: 实现日期格式化逻辑
  // 1. 处理日期对象或时间戳
  // 2. 根据 format 参数格式化日期
  // 3. 返回格式化后的字符串

  // 临时返回，待实现
  return new Date(date).toISOString();
}

/**
 * 验证邮箱格式
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱格式
 */
export function isValidEmail(email: string): boolean {
  // TODO: 实现邮箱验证逻辑
  // 1. 使用正则表达式验证邮箱格式
  // 2. 返回验证结果

  // 临时返回，待实现
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 生成随机字符串
 * @param length - 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number): string {
  // TODO: 实现随机字符串生成逻辑
  // 1. 使用字符集生成指定长度的随机字符串
  // 2. 返回随机字符串

  // 临时返回，待实现
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * 深度克隆对象
 * @param obj - 要克隆的对象
 * @returns 克隆后的新对象
 */
export function deepClone<T>(obj: T): T {
  // TODO: 实现深度克隆逻辑
  // 1. 处理各种数据类型（对象、数组、基本类型等）
  // 2. 递归克隆嵌套对象
  // 3. 返回克隆后的新对象

  // 临时返回，待实现
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // TODO: 实现防抖逻辑
  // 1. 创建定时器
  // 2. 在指定时间内只执行最后一次调用
  // 3. 返回防抖后的函数

  // 临时返回，待实现
  return func;
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param wait - 等待时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // TODO: 实现节流逻辑
  // 1. 创建定时器
  // 2. 在指定时间内只执行一次
  // 3. 返回节流后的函数

  // 临时返回，待实现
  return func;
}

/**
 * 安全地解析 JSON
 * @param jsonString - JSON 字符串
 * @param defaultValue - 解析失败时的默认值
 * @returns 解析后的对象或默认值
 */
export function safeJsonParse<T>(
  jsonString: string,
  defaultValue: T
): T {
  // TODO: 实现安全 JSON 解析逻辑
  // 1. 尝试解析 JSON 字符串
  // 2. 如果解析失败，返回默认值
  // 3. 处理异常情况

  // 临时返回，待实现
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

