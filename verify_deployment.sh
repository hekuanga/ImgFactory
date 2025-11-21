#!/bin/bash

# RestorePhotos 项目部署验证脚本
# 此脚本用于验证项目是否正确部署并正常运行

echo "=== RestorePhotos 项目部署验证脚本 ==="
echo ""

# 服务器信息
SERVER_IP="49.232.38.171"
SERVER_PORT="22"
SERVER_USER="root"
SERVER_DIR="/gitidea/restorephotos"

# 1. 检查服务器上的 Docker 容器状态
echo "1. 检查 Docker 容器状态..."
echo "请输入服务器密码: Raveland2025."

# 连接服务器并检查容器状态
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "cd ${SERVER_DIR} && docker-compose ps" > container_status.log

if [ $? -ne 0 ]; then
  echo "错误: 无法连接到服务器或检查容器状态！"
  exit 1
fi

echo "✓ 容器状态检查完成"
cat container_status.log
echo ""

# 2. 检查服务日志
echo "2. 检查最近的服务日志..."
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "cd ${SERVER_DIR} && docker-compose logs --tail=20 app"

if [ $? -ne 0 ]; then
  echo "警告: 无法获取服务日志，请手动检查。"
else
  echo "✓ 服务日志检查完成"
fi
echo ""

# 3. 检查数据库连接
echo "3. 检查数据库容器状态..."
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "cd ${SERVER_DIR} && docker-compose logs --tail=20 db"

if [ $? -ne 0 ]; then
  echo "警告: 无法获取数据库日志，请手动检查。"
else
  echo "✓ 数据库日志检查完成"
fi
echo ""

# 4. 测试本地访问（在服务器上）
echo "4. 在服务器上测试本地访问..."
ssh ${SERVER_USER}@${SERVER_IP} -p ${SERVER_PORT} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" > local_status_code.txt

LOCAL_STATUS=$(cat local_status_code.txt)
if [ "$LOCAL_STATUS" -eq 200 ]; then
  echo "✓ 本地访问测试成功 (HTTP $LOCAL_STATUS)"
else
  echo "警告: 本地访问测试失败，状态码: $LOCAL_STATUS"
fi
echo ""

# 5. 显示连接信息
echo "=== 部署验证信息 ==="
echo "服务器 IP: ${SERVER_IP}"
echo "部署目录: ${SERVER_DIR}"
echo "应用访问地址: http://${SERVER_IP}:3000"
echo "数据库访问地址: ${SERVER_IP}:5432"
echo ""
echo "服务状态摘要:"
if grep -q "Up" container_status.log; then
  echo "✓ Docker 容器正在运行"
else
  echo "✗ Docker 容器未正常运行"
fi

echo ""
echo "故障排除建议:"
echo "1. 检查完整日志: docker-compose logs -f"
echo "2. 检查环境变量配置: cat .env"
echo "3. 检查端口占用: netstat -tulpn | grep 3000"
echo "4. 重启服务: docker-compose restart"

# 清理临时文件
rm -f container_status.log local_status_code.txt