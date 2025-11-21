# RestorePhotos 部署指南

## 项目概述

本指南详细介绍了如何快速部署和管理 RestorePhotos 应用程序。通过我们提供的自动化脚本，您可以轻松地在远程服务器上设置和更新应用程序，无需重复输入密码，大大简化了部署流程。

## 准备工作

### 前提条件

在开始部署前，请确保您的系统已满足以下要求：

1. **Windows 10/11 操作系统**：推荐使用最新版本的Windows系统
2. **OpenSSH 客户端**：用于连接远程服务器
   - Windows 10/11 可以在 "设置 -> 应用 -> 可选功能" 中安装 OpenSSH 客户端
3. **PowerShell 5.1 或更高版本**：用于执行部署脚本
4. **远程服务器**：已安装 Docker 和 Docker Compose 的 Linux 服务器

### 检查项目文件

确保您的项目目录包含以下关键文件：

- `Dockerfile`：应用程序构建文件
- `docker-compose.yml`：服务配置文件
- `.env`：环境变量配置
- `init-db/01-init-db.sql`：数据库初始化脚本
- `auto_deploy.ps1`：自动部署脚本
- `setup_ssh_key.ps1`：SSH密钥配置脚本
- `test_deploy.ps1`：部署测试脚本

## 部署流程

### 第一步：配置SSH密钥（一次性设置）

为了避免在部署过程中重复输入密码，我们需要设置SSH密钥认证。

1. 打开 PowerShell 终端
2. 导航到项目目录
3. 运行 SSH 密钥配置脚本：

```powershell
.\setup_ssh_key.ps1
```

4. 按照脚本提示操作：
   - 脚本会检查您的系统是否安装了 SSH 客户端
   - 生成新的 SSH 密钥对（如需要）
   - 将公钥复制到远程服务器
   - 测试免密码登录连接
   - 创建 SSH 配置文件，简化未来的连接

### 第二步：运行部署测试（可选但推荐）

在执行实际部署前，建议先运行测试脚本来验证所有组件是否正常：

```powershell
.	est_deploy.ps1
```

测试脚本将检查：
- 必要文件是否存在
- 脚本语法是否正确
- Dockerfile 配置是否包含 curl 支持
- docker-compose.yml 配置是否正确
- 本地环境是否准备就绪

### 第三步：执行自动部署

一旦 SSH 密钥配置完成并且测试通过，您可以执行自动部署脚本：

```powershell
.\auto_deploy.ps1
```

部署脚本将自动执行以下操作：
1. 检查必要文件是否存在
2. 将所有关键文件传输到远程服务器
3. 在服务器上构建和启动 Docker 容器
4. 等待服务初始化完成
5. 验证部署状态，包括：
   - 检查容器运行状态
   - 检查端口监听情况
   - 测试服务可访问性

## 脚本详细说明

### 1. SSH密钥配置脚本 (setup_ssh_key.ps1)

**功能**：设置SSH免密码登录，简化部署流程

**主要功能**：
- 检查SSH客户端是否可用
- 生成SSH密钥对（如果不存在）
- 将公钥复制到远程服务器
- 测试SSH免密码登录连接
- 创建SSH配置文件，使用`restorephotos-server`作为别名

**使用场景**：首次部署前运行，或需要更新SSH密钥时运行

### 2. 自动部署脚本 (auto_deploy.ps1)

**功能**：自动化整个部署流程，从文件传输到服务验证

**主要流程**：
- 检查项目文件完整性
- 使用SSH密钥（如有）传输文件到服务器
- 停止现有服务并使用新配置启动
- 等待服务初始化
- 验证部署结果

**配置项**（可在脚本开头修改）：
- `$SERVER_IP`：服务器IP地址
- `$SERVER_USER`：服务器用户名
- `$SERVER_DIR`：服务器上的项目目录
- `$SSH_ALIAS`：SSH配置别名

### 3. 部署测试脚本 (test_deploy.ps1)

**功能**：验证部署环境和脚本是否准备就绪

**测试内容**：
- 必要文件检查
- 脚本语法验证
- Dockerfile配置验证（确保包含curl）
- docker-compose.yml配置验证（端口映射和健康检查）
- 本地环境检查（SSH和SCP可用性）

## 常见问题解答

### Q: SSH密钥配置失败怎么办？

**A**: 检查以下几点：
- 确保远程服务器的SSH服务正在运行
- 验证用户名和IP地址是否正确
- 尝试手动复制公钥到服务器的`~/.ssh/authorized_keys`文件

### Q: 部署脚本执行时提示权限错误

**A**: 确保：
- 远程用户对目标目录有写入权限
- Docker服务在远程服务器上正常运行
- 用户有权限执行Docker命令（可能需要sudo权限）

### Q: 容器状态显示为unhealthy

**A**: 这可能是因为：
- Dockerfile中没有安装curl（已通过我们的修改解决）
- 健康检查配置错误（已通过修改指向localhost:3000解决）
- 应用程序启动超时或出错

### Q: 远程无法访问服务

**A**: 检查：
- 服务器防火墙是否允许3001端口的入站流量
- Docker容器的端口映射是否正确
- 应用程序是否正常启动（查看容器日志）

## 故障排除

如果在部署过程中遇到问题，可以尝试以下步骤：

1. **检查服务器状态**：
   ```powershell
   ssh restorephotos-server "docker info"
   ```

2. **查看容器日志**：
   ```powershell
   ssh restorephotos-server "cd /root/restorephotos && docker-compose logs app"
   ```

3. **检查容器状态**：
   ```powershell
   ssh restorephotos-server "cd /root/restorephotos && docker-compose ps"
   ```

4. **重新初始化部署**：
   ```powershell
   .\auto_deploy.ps1
   ```

## 更新记录

### v1.0.0
- 初始版本
- 添加了SSH密钥自动配置
- 创建了自动部署脚本
- 提供了部署测试工具
- 添加了详细的使用说明

## 版权信息

© 2024 RestorePhotos 项目团队