// 抽奖配置：想改规则只改这里
export const LOTTERY_CONFIG = {
  // 页面标题
  title: "🎂 生日礼物抽奖机 🎂",
  subtitle: "一共 6 次机会，吃的玩的随你挑～",
  // 总抽奖次数
  totalChances: 6,
  // 兑奖单文案
  redeemTitle: "🎟️ 兑奖单",
  redeemHint: "你抽中的礼物都在这里：",
  redeemFooter: "拿好这张小票，随时来找我兑换！💝",
  // 按钮文案（{n} 会被替换为第几次）
  continueButton: "🎲 继续抽第 {n} 次",
  saveButton: "📸 保存兑奖单图片",
  redrawButton: "🔄 重新抽一次",
} as const;

// 类别展示文案（吃的 / 玩的）
export const CATEGORY_META: Record<"food" | "other", { label: string; emoji: string }> = {
  food: { label: "吃的", emoji: "🍪" },
  other: { label: "玩的", emoji: "🧸" },
};
