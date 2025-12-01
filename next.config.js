/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // 启用 standalone 输出模式（用于 Docker）
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  images: {
    domains: ["upcdn.io", "replicate.delivery", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  // Next.js 内置了图片处理，不需要自定义 file-loader
  // 移除自定义 webpack 配置以避免与 Next.js 内置资源处理冲突
  // webpack: (config) => {
  //   config.module.rules.push({
  //     test: /\.(png|jpg|jpeg|gif|svg)$/,
  //     use: [
  //       {
  //         loader: 'file-loader',
  //         options: {
  //           name: '[name].[ext]',
  //           outputPath: 'static/images/',
  //           publicPath: '/_next/static/images/',
  //         },
  //       },
  //     ],
  //   });
  //   return config;
  // },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/Nutlope/restorePhotos",
        permanent: false,
      },
      {
        source: "/deploy",
        destination: "https://vercel.com/templates/next.js/ai-photo-restorer",
        permanent: false,
      },
    ];
  },
};
