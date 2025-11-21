#!/bin/bash

# 文件传输脚本 - 将关键部署文件传输到服务器

# 服务器配置
SERVER_IP="49.232.38.171"
SERVER_USER="root"
SERVER_DIR="/root/restorephotos"
SSH_KEY="tencent_rsa"

# 确保脚本可执行
chmod +x "$0"

echo "开始传输文件到服务器 $SERVER_IP..."

# 检查SSH私钥是否存在
if [ ! -f "$SSH_KEY" ]; then
    echo "错误：SSH私钥文件 $SSH_KEY 不存在！"
    exit 1
fi

# 创建服务器上的目录
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_DIR"

# 传输关键文件
echo "正在传输Docker配置文件..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no docker-compose.yml Dockerfile "$SERVER_USER@$SERVER_IP:$SERVER_DIR/"

if [ $? -ne 0 ]; then
    echo "错误：Docker配置文件传输失败！"
    exit 1
fi

echo "正在传输部署脚本..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no deploy_with_docker.sh verify_deployment.sh test_public_access.sh "$SERVER_USER@$SERVER_IP:$SERVER_DIR/"

if [ $? -ne 0 ]; then
    echo "错误：部署脚本传输失败！"
    exit 1
fi

echo "正在传输数据库初始化脚本..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_DIR/init-db"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no init-db/01-init-db.sql "$SERVER_USER@$SERVER_IP:$SERVER_DIR/init-db/"

if [ $? -ne 0 ]; then
    echo "错误：数据库初始化脚本传输失败！"
    exit 1
fi

echo "正在传输PM2配置文件..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ecosystem.config.js "$SERVER_USER@$SERVER_IP:$SERVER_DIR/"

if [ $? -ne 0 ]; then
    echo "错误：PM2配置文件传输失败！"
    exit 1
fi

echo "所有文件传输完成！"
echo "服务器目录：$SERVER_DIR"