# 🎂 生日礼物大抽奖

一个简单的生日礼物抽奖小页面：一共 **6 次机会**，每次自己选抽「吃的」还是「玩的」，抽完自动生成一张**兑奖单**，可一键**保存为图片**（长按存相册 / 下载），凭单兑奖。

## 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:3000 即可体验。

## 怎么放礼物 / 改规则

| 想做的事 | 怎么做 |
| --- | --- |
| 加新礼物 | 把图片放进 `public/picture/food/`（吃的）或 `public/picture/other/`（玩的），重新 `npm run build`，图片文件名（去掉扩展名）就是礼物的名字 |
| 改抽奖次数 | 编辑 `lib/config.ts` 里的 `totalChances`（默认 6 次）；每次抽哪一类由她现场选，某类抽完会自动置灰提示 |
| 改文案 | 都在 `lib/config.ts` 里，标题、按钮、兑奖单提示语随意改 |

## 部署

项目已开启静态导出（`output: "export"`），构建后生成 `out/` 目录，可以直接扔到任何静态托管上：

```bash
npm run build
```

- **Vercel / Netlify / Cloudflare Pages**：把仓库连上去，框架选 Next.js，自动构建部署；
- **GitHub Pages / 对象存储 / 任意静态服务器**：把 `out/` 目录内容上传即可。

## 目录结构

```
gift/
├── app/                  # 页面与全局样式
│   ├── layout.tsx
│   ├── page.tsx          # 服务端组件：读取礼物列表
│   └── globals.css       # 动画与主题
├── components/
│   └── Lottery.tsx       # 抽奖交互（滚动动画 → 揭晓 → 兑奖单）
├── lib/
│   ├── config.ts         # 抽奖规则与文案配置
│   └── gifts.ts          # 扫描图片目录生成礼物列表
├── public/
│   └── picture/
│       ├── food/         # 吃的类礼物图片
│       └── other/        # 玩的类礼物图片
└── next.config.ts
```
