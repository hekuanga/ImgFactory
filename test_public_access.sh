#!/bin/bash

# RestorePhotos 项目公网访问测试脚本
# 此脚本用于测试项目是否可以通过公网IP正常访问

echo "=== RestorePhotos 项目公网访问测试脚本 ==="
echo ""

# 服务器信息
SERVER_IP="49.232.38.171"
SERVER_PORT="3000"

# 测试URL
TEST_URL="http://${SERVER_IP}:${SERVER_PORT}"

# 1. 检查网络连接
echo "1. 检查网络连接..."
ping -c 3 ${SERVER_IP} > /dev/null

if [ $? -ne 0 ]; then
  echo "警告: 无法ping通服务器 ${SERVER_IP}，网络连接可能存在问题！"
else
  echo "✓ 网络连接测试成功"
fi
echo ""

# 2. 检查端口是否开放
echo "2. 检查端口 ${SERVER_PORT} 是否开放..."

# 尝试使用 nc 命令检查端口
if command -v nc &> /dev/null; then
  nc -zv ${SERVER_IP} ${SERVER_PORT} 2>&1 > /dev/null
  if [ $? -eq 0 ]; then
    echo "✓ 端口 ${SERVER_PORT} 已开放"
  else
    echo "警告: 端口 ${SERVER_PORT} 未开放，可能被防火墙阻止！"
  fi
else
  # 如果没有 nc 命令，使用 telnet
  if command -v telnet &> /dev/null; then
    timeout 2 telnet ${SERVER_IP} ${SERVER_PORT} 2>&1 > /dev/null
    if [ $? -eq 0 ]; then
      echo "✓ 端口 ${SERVER_PORT} 已开放"
    else
      echo "警告: 端口 ${SERVER_PORT} 未开放或连接超时！"
    fi
  else
    echo "警告: 未找到 nc 或 telnet 命令，无法检查端口状态。"
  fi
fi
echo ""

# 3. 测试 HTTP 访问
echo "3. 测试 HTTP 访问 ${TEST_URL}..."

# 使用 curl 测试 HTTP 访问
if command -v curl &> /dev/null; then
  HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' ${TEST_URL})
  
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✓ HTTP 访问测试成功 (状态码: $HTTP_STATUS)"
    
    # 获取页面标题
    PAGE_TITLE=$(curl -s ${TEST_URL} | grep -o '<title>[^<]*' | sed 's/<title>//')
    if [ -n "$PAGE_TITLE" ]; then
      echo "   页面标题: $PAGE_TITLE"
    else
      echo "   无法获取页面标题"
    fi
  elif [ "$HTTP_STATUS" -eq 000 ]; then
    echo "✗ HTTP 访问失败: 连接被拒绝，服务可能未启动"
  else
    echo "✗ HTTP 访问测试失败，状态码: $HTTP_STATUS"
  fi
else
  echo "警告: 未找到 curl 命令，无法进行 HTTP 访问测试。"
  echo "请手动在浏览器中访问: ${TEST_URL}"
fi
echo ""

# 4. 测试 API 端点
echo "4. 测试 API 端点..."
TEST_API="${TEST_URL}/api/remaining"

if command -v curl &> /dev/null; then
  API_STATUS=$(curl -s -o /dev/null -w '%{http_code}' ${TEST_API})
  
  if [ "$API_STATUS" -eq 200 ] || [ "$API_STATUS" -eq 401 ]; then
    echo "✓ API 端点 ${TEST_API} 可访问 (状态码: $API_STATUS)"
  else
    echo "✗ API 端点测试失败，状态码: $API_STATUS"
  fi
fi
echo ""

# 5. 显示访问信息
echo "=== 访问测试结果 ==="
echo "服务器 IP: ${SERVER_IP}"
echo "服务端口: ${SERVER_PORT}"
echo "访问地址: ${TEST_URL}"
echo ""

echo "访问方式:"
echo "1. 浏览器访问: ${TEST_URL}"
echo "2. 命令行测试: curl -v ${TEST_URL}"
echo ""

echo "故障排除建议:"
echo "1. 检查服务器防火墙是否允许 ${SERVER_PORT} 端口"
echo "2. 确认 Next.js 服务监听在 0.0.0.0 而非 localhost"
echo "3. 检查 NEXTAUTH_URL 是否设置为 ${TEST_URL}"
echo "4. 查看服务日志: docker-compose logs -f"
echo "5. 尝试重启服务: docker-compose restart"