import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🎂 生日礼物抽奖机",
  description: "6 次机会，吃的玩的随你挑，抽完凭兑奖单来兑换～",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
