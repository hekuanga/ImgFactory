/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // 启用 standalone 输出模式（用于 Docker）
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  images: {
    domains: ["upcdn.io", "replicate.delivery", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  // 确保构建时正确处理public目录
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|jpeg|gif|svg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/images/',
            publicPath: '/_next/static/images/',
          },
        },
      ],
    });
    return config;
  },
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
