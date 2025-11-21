// PM2 配置文件 - 用于 RestorePhotos 项目的进程管理
// 此配置用于在非Docker环境下使用PM2管理Next.js应用

module.exports = {
  apps : [{
    name: "restorephotos",         // 应用名称
    script: "npm",                // 执行脚本
    args: "start",                // 脚本参数
    instances: 1,                  // 实例数量（可根据CPU核心数调整）
    exec_mode: "cluster",         // 执行模式：cluster 或 fork
    watch: false,                  // 生产环境关闭文件监听
    max_memory_restart: "1G",      // 内存使用超过1G时自动重启
    autorestart: true,             // 应用崩溃时自动重启
    restart_delay: 3000,           // 重启延迟时间（毫秒）
    cwd: "/gitidea/restorephotos", // 工作目录
    env: {
      NODE_ENV: "production"      // 环境变量
    },
    // 日志配置
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "/gitidea/restorephotos/logs/error.log",
    out_file: "/gitidea/restorephotos/logs/output.log",
    combine_logs: true,
    merge_logs: true,
    
    // 监控和告警
    exp_backoff_restart_delay: 100,
    listen_timeout: 30000,
    kill_timeout: 10000,
    
    // 启动前钩子（可选）
    // 可用于在启动前执行构建或其他准备工作
    pre_start: [
      {
        cmd: "npm run build",
        cwd: "/gitidea/restorephotos"
      }
    ],
    
    // 健康检查配置（与PM2 Plus结合使用）
    health_check: {
      url: "http://localhost:3000",
      interval: 30000,  // 30秒检查一次
      timeout: 5000,    // 5秒超时
      max_retries: 3    // 最大重试次数
    }
  }],
  
  // 部署配置（可选）
  deploy: {
    production: {
      user: "root",
      host: "49.232.38.171",
      ref: "origin/master",
      repo: "ssh://git@49.232.38.171:22/gitidea/restorephotos.git",
      path: "/gitidea/restorephotos",
      'post-deploy': "npm install && npm run build && pm2 reload ecosystem.config.js"
    }
  }
};

/*
使用说明：

1. 安装 PM2：
   npm install -g pm2

2. 启动应用：
   pm2 start ecosystem.config.js

3. 常用命令：
   - 查看状态：pm2 status
   - 查看日志：pm2 logs restorephotos
   - 重启应用：pm2 restart restorephotos
   - 停止应用：pm2 stop restorephotos
   - 自动启动设置：pm2 startup
   - 保存当前进程列表：pm2 save
*/