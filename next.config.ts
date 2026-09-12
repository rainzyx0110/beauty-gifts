import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：npm run build 后生成 out/ 目录，可部署到任意静态托管（Vercel / GitHub Pages / Netlify / 对象存储等）
  output: "export",
};

export default nextConfig;
