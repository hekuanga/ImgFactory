# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

# 安装依赖工具
RUN apk add --no-cache libc6-compat openssl

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 第二阶段：构建应用
FROM node:18-alpine AS builder
WORKDIR /app

# 安装 Prisma CLI 和必要的构建工具
RUN apk add --no-cache openssl

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制 Prisma schema
COPY prisma ./prisma

# 生成 Prisma Client（需要环境变量，但构建时可以使用占位符）
# 注意：实际运行时需要正确的 DATABASE_URL
RUN npx prisma generate || echo "Prisma generate skipped (will run at runtime)"

# 复制项目文件
COPY . .

# 确保 public 目录存在
RUN mkdir -p public

# 构建应用
# 注意：构建时环境变量应该已经设置（通过 docker-compose 或构建参数）
# 设置 DOCKER_BUILD 环境变量以启用 standalone 输出
ENV DOCKER_BUILD=true
RUN npm run build

# 第三阶段：生产环境
FROM node:18-alpine AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安装必要的运行时工具
RUN apk add --no-cache curl openssl

# 创建 non-root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
# 如果使用 standalone 输出，复制 standalone 目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Prisma 相关文件（运行时需要）
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 设置权限
RUN chmod -R 755 ./public && \
    chown -R nextjs:nodejs ./public

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 启动命令
# 注意：运行时需要设置环境变量（通过 docker-compose 或运行时参数）
CMD ["node", "server.js"]