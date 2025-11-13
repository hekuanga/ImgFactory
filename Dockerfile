# 第一阶段：依赖安装
FROM node:18-alpine AS deps
WORKDIR /app

# 安装依赖工具
RUN apk add --no-cache libc6-compat

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 第二阶段：构建应用
FROM node:18-alpine AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制项目文件，确保public目录被正确复制
COPY . .

# 验证public目录是否存在
RUN ls -la && mkdir -p public

# 复制环境变量文件
COPY .env .env

# 构建应用
RUN npx prisma generate && npm run build

# 第三阶段：生产环境
FROM node:18-alpine AS runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV production

# 创建non-root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 从builder复制public目录并设置正确的权限
COPY --from=builder /app/public ./public
RUN chmod -R 755 ./public && chown -R nextjs:nodejs ./public

# 复制其他必要文件
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./next.config.js

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]