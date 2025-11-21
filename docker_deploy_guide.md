# Docker部署指南：RestorePhotos项目

本文档提供了RestorePhotos项目的Docker部署详细步骤，确保项目可以通过公网IP正常访问。

## 问题分析

当在服务器上运行`npm run dev`或`npm start`后，如果只能通过`localhost:3000`访问而无法通过外网IP访问，主要原因有：

1. **Next.js默认只监听本地接口**：Next.js开发服务器默认只监听`localhost`，不接受来自外部网络的请求
2. **NEXTAUTH_URL配置错误**：认证URL设置为localhost会导致认证失败
3. **Docker网络配置问题**：容器端口映射和网络设置不正确

## 配置修改（已完成）

### 1. 修改Next.js监听接口

已更新`package.json`中的脚本，使Next.js监听所有网络接口：

```json
"scripts": {
  "dev": "next dev -H 0.0.0.0",
  "start": "next start -H 0.0.0.0"
}
```

### 2. 更新NEXTAUTH_URL

已修改`.env`和`docker-compose.yml`中的配置：

```
NEXTAUTH_URL=http://49.232.38.171:3000
```

## Docker部署步骤

### 1. 准备工作

确保服务器上已安装Docker和Docker Compose：

```bash
# 检查Docker是否安装
docker --version
# 检查Docker Compose是否安装
docker-compose --version
```

### 2. 上传项目文件

使用SFTP将项目文件上传到服务器的`/gitidea/restorephotos`目录：

```bash
# 在本地终端执行
sftp root@49.232.38.171
cd /gitidea/restorephotos
lcd d:\gitidea\备份\restorephotos
put -r *
```

### 3. 创建并配置环境变量文件

确保`.env`文件包含正确的配置：

```bash
# 在服务器上执行
cd /gitidea/restorephotos
# 检查并编辑.env文件（如有必要）
```

### 4. 构建并启动Docker容器

```bash
# 在服务器上执行
cd /gitidea/restorephotos
# 构建镜像并启动容器
docker-compose up -d --build
```

### 5. 验证部署

```bash
# 检查容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 手动部署（非Docker方式）

如果不想使用Docker，可以按照以下步骤手动部署：

```bash
# 在服务器上执行
cd /gitidea/restorephotos

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务（使用PM2确保后台运行）
npm install -g pm2
pm run start
# 或使用PM2（推荐）
pm2 start npm --name restorephotos -- start
```

## 网络配置注意事项

1. **防火墙设置**：确保服务器防火墙允许3000端口的入站流量

   ```bash
   # 如果使用firewalld
   firewall-cmd --permanent --add-port=3000/tcp
   firewall-cmd --reload
   
   # 如果使用iptables
   iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
   iptables-save
   ```

2. **端口映射检查**：Docker Compose已配置将容器3000端口映射到主机3000端口

3. **网络接口绑定**：确认Next.js服务绑定到了0.0.0.0而不是localhost

## 常见问题排查

1. **无法访问公网IP**
   - 检查防火墙设置
   - 确认Next.js启动命令中包含`-H 0.0.0.0`
   - 检查服务器网络配置

2. **认证失败**
   - 确认`NEXTAUTH_URL`设置为正确的公网URL
   - 检查`NEXTAUTH_SECRET`是否已设置

3. **数据库连接问题**
   - 确认Docker Compose中的数据库配置正确
   - 检查数据库容器是否正常运行

## 访问验证

部署完成后，可以通过以下方式访问项目：

- 浏览器访问：`http://49.232.38.171:3000`
- 或使用curl命令测试：`curl http://49.232.38.171:3000`

## 后续维护

1. **重启服务**：
   ```bash
   # Docker方式
   docker-compose restart
   
   # PM2方式
   pm2 restart restorephotos
   ```

2. **更新代码**：
   ```bash
   # 上传新代码后
   cd /gitidea/restorephotos
   
   # Docker方式
   docker-compose up -d --build
   
   # 手动方式
   npm run build
   pm2 restart restorephotos
   ```

3. **查看服务状态**：
   ```bash
   # Docker方式
   docker-compose ps
   
   # PM2方式
   pm2 status
   ```

---

通过以上配置和步骤，您的RestorePhotos项目应该可以通过公网IP正常访问了！