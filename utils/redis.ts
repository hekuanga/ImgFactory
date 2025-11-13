// 暂时移除Redis依赖以避免webpack编译错误
// 实际使用时，取消注释下面的代码并配置正确的环境变量

// import { Redis } from "@upstash/redis";

// const redis =
//   !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
//     ? new Redis({
//         url: process.env.UPSTASH_REDIS_REST_URL,
//         token: process.env.UPSTASH_REDIS_REST_TOKEN,
//       })
//     : undefined;

// 导出null以避免undefined引用问题
export default null;
