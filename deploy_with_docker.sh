#!/bin/bash

# RestorePhotos 项目 Docker 部署脚本
# 此脚本用于将项目部署到服务器并使用 Docker Compose 构建和启动

echo "=== RestorePhotos 项目部署脚本 ==="
echo ""

# 服务器信息
SERVER_IP="49.232.38.171"
SERVER_PORT="22"
SERVER_USER="root"
SERVER_DIR="/gitidea/restorephotos"

# 本地项目目录
LOCAL_DIR="d:\gitidea\备份\restorephotos"

# 1. 检查本地文件是否完整
echo "1. 检查本地项目文件..."
if [ ! -f "Dockerfile" ] || [ ! -f "docker-compose.yml" ] || [ ! -f ".env" ]; then
  echo "错误: 项目文件不完整，缺少必要的配置文件！"
  echo "请确保 Dockerfile、docker-compose.yml 和 .env 文件存在。"
  exit 1
fi
echo "✓ 本地项目文件检查完成"
echo ""

# 2. 连接服务器并准备部署目录
echo "2. 连接服务器并准备部署目录..."
echo "请输入服务器密码: Raveland2025."

# 创建服务器上的部署目录
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "mkdir -p ${SERVER_DIR} && echo '✓ 部署目录创建成功'"
if [ $? -ne 0 ]; then
  echo "错误: 无法连接到服务器或创建部署目录！"
  exit 1
fi

# 3. 上传项目文件
echo "3. 上传项目文件到服务器..."

# 使用 SFTP 上传文件
sftp -P ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << EOF
cd ${SERVER_DIR}
lcd ${LOCAL_DIR}
put -r Dockerfile docker-compose.yml .env package*.json tsconfig.json next.config.js tailwind.config.js postcss.config.js
put -r components pages public styles lib utils
quit
EOF

if [ $? -ne 0 ]; then
  echo "错误: 文件上传失败！"
  exit 1
fi
echo "✓ 项目文件上传成功"
echo ""

# 4. 构建和启动 Docker 容器
echo "4. 在服务器上构建和启动 Docker 容器..."

# 连接到服务器并执行 Docker Compose 命令
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "cd ${SERVER_DIR} && docker-compose up -d --build"

if [ $? -ne 0 ]; then
  echo "错误: Docker 容器构建或启动失败！"
  exit 1
fi
echo "✓ Docker 容器构建和启动成功"
echo ""

# 5. 等待服务启动
echo "5. 等待服务启动..."
sleep 10

# 6. 验证部署状态
echo "6. 验证部署状态..."

# 检查容器状态
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "cd ${SERVER_DIR} && docker-compose ps"

if [ $? -ne 0 ]; then
  echo "警告: 无法获取容器状态，请手动检查。"
else
  echo "✓ 部署状态验证完成"
fi
echo ""

# 7. 测试访问
echo "7. 测试公网访问..."
echo "请在浏览器中访问: http://${SERVER_IP}:3000"
echo ""

# 8. 显示部署信息
echo "=== 部署完成 ==="
echo "部署路径: ${SERVER_DIR}"
echo "访问地址: http://${SERVER_IP}:3000"
echo ""
echo "后续操作:"
echo "1. 检查服务日志: docker-compose logs -f"
echo "2. 停止服务: docker-compose down"
echo "3. 重启服务: docker-compose restart"