#!/bin/bash

# RestorePhotos 项目部署指南
# 由于SSH密钥认证存在问题，本脚本提供使用密码认证的完整部署步骤

echo "===== RestorePhotos 项目部署指南 ====="
echo "服务器信息:"
echo "- IP地址: 49.232.38.171"
echo "- 用户名: root"
echo "- 密码: Raveland2025."
echo "- 项目目录: /gitidea/restorephotos"
echo ""

# 步骤1: 创建远程Git仓库
echo "步骤1: 在服务器上初始化Git仓库"
echo "请在本地终端执行以下命令:"
echo ""
echo "ssh root@49.232.38.171 'mkdir -p /gitidea/restorephotos.git && cd /gitidea/restorephotos.git && git init --bare'"
echo ""

# 步骤2: 配置本地Git远程仓库
echo "步骤2: 配置本地Git远程仓库"
echo "请在项目目录执行以下命令:"
echo ""
echo "git remote set-url origin ssh://root@49.232.38.171:/gitidea/restorephotos.git"
echo ""

# 步骤3: 推送代码
echo "步骤3: 推送代码到远程仓库"
echo "请在项目目录执行以下命令:"
echo ""
echo "git push -u origin master"
echo "(执行时会提示输入密码: Raveland2025.)"
echo ""

# 步骤4: 在服务器上克隆仓库
echo "步骤4: 在服务器上克隆仓库到部署目录"
echo "请在本地终端执行以下命令:"
echo ""
echo "ssh root@49.232.38.171 'cd /gitidea && git clone /gitidea/restorephotos.git restorephotos_deploy && mv restorephotos/* restorephotos_deploy/ 2>/dev/null || true'"
echo ""

# 步骤5: 安装依赖
echo "步骤5: 在服务器上安装依赖"
echo "请在本地终端执行以下命令:"
echo ""
echo "ssh root@49.232.38.171 'cd /gitidea/restorephotos && npm install'"
echo ""

# 步骤6: 构建项目
echo "步骤6: 构建项目"
echo "请在本地终端执行以下命令:"
echo ""
echo "ssh root@49.232.38.171 'cd /gitidea/restorephotos && npm run build'"
echo ""

# 步骤7: 启动项目
echo "步骤7: 启动项目"
echo "请在本地终端执行以下命令:"
echo ""
echo "ssh root@49.232.38.171 'cd /gitidea/restorephotos && npm run start'"
echo ""

# 备选方案：使用SFTP上传
echo "备选部署方案: 使用SFTP直接上传文件"
echo "请在本地终端执行以下命令:"
echo ""
echo "sftp root@49.232.38.171"
echo "# 连接后执行:"
echo "cd /gitidea/restorephotos"
echo "lcd d:\gitidea\备份\restorephotos"
echo "put -r *"
echo "quit"
echo ""

# 验证部署
echo "验证部署:"
echo "部署完成后，请访问: http://49.232.38.171:3000"
echo ""
echo "注意事项:"
echo "1. 请确保服务器已安装Node.js环境"
echo "2. 如需后台运行，请使用PM2: npm install -g pm2 && pm2 start npm --name restorephotos -- start"
echo "3. 如遇到端口占用问题，请修改package.json中的端口配置"
echo "4. SSH密钥格式可能有问题，建议重新生成SSH密钥对"
echo ""
echo "部署指南完成！请按照步骤逐步执行。"