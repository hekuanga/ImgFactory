#!/bin/bash

# 服务器上的简化部署脚本
echo "=== RestorePhotos 服务器部署脚本 ==="
echo ""

# 服务器配置
SERVER_IP="49.232.38.171"
SERVER_DIR="/root/restorephotos"

echo "1. 检查当前目录文件..."
if [ -f "Dockerfile" ] && [ -f "docker-compose.yml" ] && [ -f ".env" ]; then
  echo "✓ 必要配置文件存在"
else
  echo "错误: 缺少必要的配置文件！"
  echo "请确保 Dockerfile、docker-compose.yml 和 .env 文件都在当前目录。"
  exit 1
fi

echo ""
echo "2. 构建和启动 Docker 容器..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
  echo "错误: Docker 容器构建或启动失败！"
  exit 1
fi

echo "✓ Docker 容器构建和启动成功"
echo ""

# 等待服务启动
echo "3. 等待服务启动..."
sleep 10

echo ""
echo "4. 验证部署状态..."
docker-compose ps

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://${SERVER_IP}:3000"
echo ""
echo "后续操作:"
echo "1. 检查服务日志: docker-compose logs -f"
echo "2. 停止服务: docker-compose down"
echo "3. 重启服务: docker-compose restart"